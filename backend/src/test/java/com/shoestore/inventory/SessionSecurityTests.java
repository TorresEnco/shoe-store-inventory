package com.shoestore.inventory;

import com.shoestore.inventory.shared.config.PasswordEncoderConfig;
import com.shoestore.inventory.shared.config.SessionSecurity;
import com.shoestore.inventory.shared.web.InventoryConflictAdvice;
import com.shoestore.inventory.product.domain.exception.InsufficientStockException;
import com.shoestore.inventory.user.application.ports.out.UserRepositoryPort;
import com.shoestore.inventory.user.application.service.UserService;
import com.shoestore.inventory.user.domain.model.Role;
import com.shoestore.inventory.user.domain.model.User;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.AuthController;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.customer.application.ports.out.CustomerRepositoryPort;
import com.shoestore.inventory.sale.application.ports.out.SaleRepositoryPort;
import com.shoestore.inventory.product.application.service.ProductService;
import com.shoestore.inventory.sale.application.service.SaleService;
import com.shoestore.inventory.customer.application.ports.in.CustomerUseCase;
import com.shoestore.inventory.customer.infrastructure.adapters.in.web.CustomerController;
import com.shoestore.inventory.product.infrastructure.adapters.in.web.ProductController;
import com.shoestore.inventory.sale.infrastructure.adapters.in.web.SaleController;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.UserController;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.sale.domain.model.Sale;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.filter.ForwardedHeaderFilter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import tools.jackson.databind.json.JsonMapper;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = SessionSecurityTests.Config.class)
class SessionSecurityTests {
    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SessionSecurity.class, AuthController.class, UserService.class, PasswordEncoderConfig.class, ProductService.class, SaleService.class,
            CustomerController.class, ProductController.class, SaleController.class, UserController.class,
            InventoryConflictAdvice.class,
            com.shoestore.inventory.product.infrastructure.adapters.in.web.CatalogController.class,
            com.shoestore.inventory.product.application.service.SaveCatalogService.class})
    static class Config {
        @Bean ProductRepositoryPort products() { return mock(ProductRepositoryPort.class); }
        @Bean CustomerRepositoryPort customers() { return mock(CustomerRepositoryPort.class); }
        @Bean SaleRepositoryPort sales() { return mock(SaleRepositoryPort.class); }
        @Bean CustomerUseCase customerQueries() { return mock(CustomerUseCase.class); }
        @Bean UserRepositoryPort users() { return mock(UserRepositoryPort.class); }
    }

    @Autowired WebApplicationContext context;
    @Autowired UserRepositoryPort users;
    @Autowired ProductRepositoryPort products;
    @Autowired SaleRepositoryPort sales;
    @Autowired CustomerRepositoryPort customers;
    @Autowired PasswordEncoder encoder;
    MockMvc mvc;
    String password;
    User user;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(context.getBean("springSecurityFilterChain", Filter.class)).build();
        password = UUID.randomUUID().toString();
        user = new User(7L, "Caja", "cashier", encoder.encode(password), Role.CASHIER, true, null);
        when(users.findByUsername("cashier")).thenReturn(Optional.of(user));
        when(users.findById(7L)).thenReturn(Optional.of(user));
    }

    private String csrf(MockHttpSession session) throws Exception {
        var result = mvc.perform(get("/api/auth/csrf").session(session)).andExpect(status().isOk()).andReturn();
        return new JsonMapper().readTree(result.getResponse().getContentAsString()).get("token").asString();
    }

    private MockHttpSession login() throws Exception {
        var previous = new MockHttpSession();
        var token = csrf(previous);
        var result = mvc.perform(post("/api/auth/login").session(previous).header("X-CSRF-TOKEN", token)
                .contentType("application/json").content(credentials(password)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value(user.getRole().name())).andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        assertTrue(previous.isInvalid());
        assertNotEquals(previous.getId(), session.getId());
        mvc.perform(post("/api/auth/logout").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isForbidden());
        return session;
    }

    private String credentials(String value) {
        return "{\"username\":\"cashier\",\"password\":\"" + value + "\",\"role\":\"ADMIN\"}";
    }

    @Test void rejectsAnonymousMissingCsrfAndIncorrectPassword() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/sales")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType("application/json").content(credentials(password)))
                .andExpect(status().isForbidden());
        var session = new MockHttpSession();
        var token = csrf(session);
        mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
                .contentType("application/json").content(credentials("incorrecta"))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
    }

    @Test void limitsLoginByAccountBeforeLookingUpCredentials() throws Exception {
        var session = new MockHttpSession();
        String token = csrf(session);
        String body = credentials("incorrecta").replace("cashier", "limited-user");
        clearInvocations(users);
        for (int i = 0; i < 11; i++) {
            var login = mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
                    .contentType("application/json").content(body));
            if (i < 10) {
                login.andExpect(status().isUnauthorized());
            } else {
                login.andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));
            }
        }
        verify(users, times(10)).findByUsername("limited-user");
    }

    @Test void separatesLoginBudgetsByClientAddressBehindTrustedProxy() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(new ForwardedHeaderFilter(),
                context.getBean("springSecurityFilterChain", Filter.class)).build();
        var session = new MockHttpSession();
        String token = csrf(session);
        for (int i = 0; i < 61; i++) {
            var login = mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
                    .header("X-Forwarded-For", "192.0.2.10").contentType("application/json")
                    .content(credentials("incorrecta").replace("cashier", "proxy-fixture-" + i)));
            login.andExpect(status().is(i < 60 ? 401 : 429));
        }
        mvc.perform(post("/api/auth/login").session(session).header("X-CSRF-TOKEN", token)
                .header("X-Forwarded-For", "192.0.2.11").contentType("application/json")
                .content(credentials("incorrecta").replace("cashier", "proxy-fixture-60")))
                .andExpect(status().isUnauthorized());
    }

    @Test void rotatesSessionAndCsrfAndInvalidatesOnLogout() throws Exception {
        var session = login();
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7)).andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(get("/api/users").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").session(session).header("X-CSRF-TOKEN", csrf(session)))
                .andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        assertFalse(csrf(new MockHttpSession()).isBlank());
    }

    @Test void catalogRequiresAdminAndValidVariants() throws Exception {
        var session = login();
        String payload = """
                {"name":"Modelo","brand":"Marca","category":"Casual","status":true,
                 "variants":[{"color":"Negro","size":40,"catalogPrice":45,"stock":2}]}
                """;
        mvc.perform(post("/api/products/catalog").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType("application/json").content(payload)).andExpect(status().isForbidden());
        mvc.perform(put("/api/products/1/catalog").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType("application/json").content(payload)).andExpect(status().isForbidden());
        user.setRole(Role.ADMIN);
        user.setPassword(encoder.encode(password));
        session = login();
        when(products.saveCatalog(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/products/catalog").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType("application/json").content(payload)).andExpect(status().isCreated());
        clearInvocations(products);
        mvc.perform(put("/api/products/1/catalog").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType("application/json").content(payload.replace("\"catalogPrice\":45", "\"catalogPrice\":0")))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(products);
    }

    @Test void rejectsZeroPricedLineBeforeWritingSale() throws Exception {
        var session = login();
        clearInvocations(products, customers, sales);
        String payload = """
                {"customerName":"Cliente","paymentType":"CASH",
                 "items":[{"variantId":3,"quantity":1,"unitPrice":12.50},
                          {"variantId":4,"quantity":1,"unitPrice":0.00}]}
                """;
        mvc.perform(post("/api/sales").session(session).header("X-CSRF-TOKEN", csrf(session))
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType("application/json").content(payload)).andExpect(status().isBadRequest());
        verifyNoInteractions(products, customers, sales);
    }

    @Test void cashierRegistersNegotiatedSaleAndReadsOnlyOwnRecords() throws Exception {
        var session = login();
        var variant = new ProductVariant();
        variant.setProductId(1L);
        var product = new com.shoestore.inventory.product.domain.model.Product();
        product.setStatus(true);
        when(products.findById(1L)).thenReturn(Optional.of(product));
        variant.setStock(4);
        when(products.findVariantById(3L)).thenReturn(Optional.of(variant));
        doAnswer(call -> {
            variant.updateStock(Math.toIntExact(call.<Long>getArgument(1)));
            return null;
        }).when(products).changeVariantStock(eq(3L), anyLong());
        when(customers.save(any())).thenAnswer(call -> call.getArgument(0));
        when(sales.save(any())).thenAnswer(call -> call.getArgument(0));
        String payload = """
                {"userId":999,"role":"ADMIN","customerName":"Cliente","paymentType":"CASH",
                 "items":[{"variantId":3,"quantity":1,"unitPrice":12.50}]}
                """;
        String saleKey = UUID.randomUUID().toString();
        when(sales.claimRequest(eq(7L), eq(UUID.fromString(saleKey)), anyString())).thenReturn(Optional.empty());
        mvc.perform(post("/api/sales").session(session).header("X-CSRF-TOKEN", csrf(session))
                .header("Idempotency-Key", saleKey)
                .contentType("application/json").content(payload)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(7)).andExpect(jsonPath("$.total").value(12.5));
        assertEquals(3, variant.getStock());
        verify(customers).save(any());
        mvc.perform(get("/api/sales/today").session(session)).andExpect(status().isOk());
        verify(sales).findByOwnerAndDateRange(eq(7L), any(), any());
        var other = new Sale();
        other.setUserId(8L);
        when(sales.findById(21L)).thenReturn(Optional.of(other));
        mvc.perform(get("/api/sales/21").session(session)).andExpect(status().isNotFound());
        other.setUserId(7L);
        other.setItems(java.util.List.of());
        mvc.perform(get("/api/sales/21").session(session)).andExpect(status().isOk());
        mvc.perform(get("/api/customers").session(session)).andExpect(status().isOk());
        mvc.perform(get("/api/products").session(session)).andExpect(status().isOk());
        mvc.perform(patch("/api/products/variants/3/stock").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType("application/json").content("{\"delta\":2}")).andExpect(status().isOk());
        mvc.perform(patch("/api/sales/21/cancel").session(session).header("X-CSRF-TOKEN", csrf(session)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/analytics/pareto").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/api/users").session(session).header("X-CSRF-TOKEN", csrf(session))
                .contentType("application/json").content("{}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/sales").session(session).contentType("application/json").content(payload))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/sales").session(session).header("X-CSRF-TOKEN", csrf(session))
                .header("Idempotency-Key", saleKey)
                .contentType("application/json").content(payload.replace("12.50", "-1")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/sales").session(session).header("X-CSRF-TOKEN", csrf(session))
                .header("Idempotency-Key", saleKey)
                .contentType("application/json").content(payload.replace("12.50", "12.501")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("El precio unitario admite hasta dos decimales."));
        assertEquals(5, variant.getStock());
        doThrow(new InsufficientStockException("stock"))
                .when(products).changeVariantStock(3L, -1L);
        mvc.perform(post("/api/sales").session(session).header("X-CSRF-TOKEN", csrf(session))
                .header("Idempotency-Key", saleKey)
                .contentType("application/json").content(payload))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.status").value(409));
    }

    @Test void adminCanManageUsersAndReadUnrestrictedHistory() throws Exception {
        user.setRole(Role.ADMIN);
        var session = login();
        mvc.perform(get("/api/users").session(session)).andExpect(status().isOk());
        mvc.perform(get("/api/sales/today").session(session)).andExpect(status().isOk());
        verify(sales).findByDateRange(any(), any());
        mvc.perform(get("/api/unclassified").session(session)).andExpect(status().isForbidden());
    }

    @Test void deactivationRevokesAccess() throws Exception {
        var session = login();
        user.setActive(false);
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
        assertTrue(session.isInvalid());
    }
}
