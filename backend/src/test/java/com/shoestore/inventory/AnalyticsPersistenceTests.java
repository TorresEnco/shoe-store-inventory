package com.shoestore.inventory;

import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort;
import com.shoestore.inventory.analytics.infrastructure.adapters.in.web.AnalyticsController;
import com.shoestore.inventory.analytics.application.ports.in.GetParetoAnalysisUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.SpringApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.Filter;
import tools.jackson.databind.json.JsonMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class AnalyticsPersistenceTests {
    @Test void rejectsOutOfRangePeriodsAtTheHttpBoundary() throws Exception {
        var useCase = mock(GetParetoAnalysisUseCase.class);
        var mvc = MockMvcBuilders.standaloneSetup(new AnalyticsController(useCase)).build();
        for (String days : List.of("0", "-1", "366", "invalid")) {
            mvc.perform(get("/api/analytics/pareto").param("days", days)).andExpect(status().isBadRequest());
        }
        verifyNoInteractions(useCase);
        mvc.perform(get("/api/analytics/pareto").param("days", "365")).andExpect(status().isOk());
        verify(useCase).getParetoReport(365);
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "ANA_TEST_JDBC_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/postgres")
    void queriesUseCompletedSalesAndVariantAgeWithExactBoundaries() throws Exception {
        String url = System.getenv("ANA_TEST_JDBC_URL");
        try (var connection = DriverManager.getConnection(url, "tx01_fixture", "fixture-only");
             var statement = connection.createStatement()) {
            try (var result = statement.executeQuery("select count(*) from information_schema.tables where table_schema = 'public'")) {
                assertTrue(result.next());
                assertEquals(0, result.getInt(1), "Use an empty disposable PostgreSQL cluster.");
            }
            for (String migration : List.of("000-initial-schema.sql", "001-sale-idempotency.sql", "002-sale-and-stock-integrity.sql")) {
                statement.execute(Files.readString(Path.of("db/migrations/" + migration)));
            }
        }
        try (var app = SpringApplication.run(InventoryApplication.class,
                "--spring.profiles.active=prod", "--spring.datasource.url=" + url,
                "--spring.datasource.username=tx01_fixture", "--spring.datasource.password=fixture-only",
                "--spring.jpa.show-sql=false", "--logging.level.org.hibernate.SQL=WARN",
                "--server.address=127.0.0.1", "--server.port=0")) {
            var jdbc = app.getBean(JdbcTemplate.class);
            var now = LocalDateTime.now().minusSeconds(2).withNano(0);
            var cutoff = now.minusDays(45);
            jdbc.update("insert into users (id, username, role) values (101, 'analytics-fixture', 'ADMIN')");
            jdbc.update("insert into colors (id, name) values (1, 'Negro')");
            // New product, old variants: liquidation must use variant age.
            jdbc.update("insert into products (id, name, status, created_at) values (1, 'Modelo', true, ?)", now.minusDays(1));
            int[] stock = {7, 3, 8, 4, 0, 5, 2, 9, 6};
            for (int i = 0; i < stock.length; i++) {
                LocalDateTime created = i == 2 ? now.minusDays(2) : i == 3 ? cutoff : now.minusDays(60);
                jdbc.update("insert into product_variants (id, product_id, color_id, size, catalog_price, stock, created_at) values (?, 1, 1, ?, 10, ?, ?)",
                        i + 1, 40 + i, stock[i], created);
            }
            sale(jdbc, 1, 2, now.minusDays(1), "CANCELLED");
            sale(jdbc, 2, 6, now.minusDays(30), "COMPLETED");
            sale(jdbc, 3, 7, now.minusDays(46), "COMPLETED");
            sale(jdbc, 4, 8, cutoff, "COMPLETED");
            sale(jdbc, 5, 9, now, "COMPLETED");
            var repository = app.getBean(AnalyticsRepositoryPort.class);
            var stagnant = repository.findStagnantVariants(cutoff, now);
            assertEquals(List.of(40, 41, 46, 48), stagnant.stream().map(row -> row.size()).toList());
            assertEquals(18, stagnant.stream().mapToInt(row -> row.stock()).sum());
            var rows = repository.findSalesByProductSince(now.minusDays(60), now);
            assertEquals(1, rows.size());
            assertEquals(3, rows.getFirst().totalSold());
            assertEquals(0, rows.getFirst().revenue().compareTo(new java.math.BigDecimal("30.00")));
            assertTrue(repository.findSalesByProductSince(now.minusDays(7), now).isEmpty());
            assertEquals(stagnant, repository.findStagnantVariants(cutoff, now));
            jdbc.update("update users set active = true, full_name = 'Administrador ficticio', password_hash = ? where id = 101",
                    app.getBean(PasswordEncoder.class).encode("Fixture-analytics-2026"));
            var mvc = MockMvcBuilders.webAppContextSetup((WebApplicationContext) app)
                    .addFilters(app.getBean("springSecurityFilterChain", Filter.class)).build();
            mvc.perform(get("/api/analytics/pareto")).andExpect(status().isUnauthorized());
            var anonymous = new MockHttpSession();
            var csrf = mvc.perform(get("/api/auth/csrf").session(anonymous)).andReturn();
            String token = new JsonMapper().readTree(csrf.getResponse().getContentAsString()).get("token").asString();
            var login = mvc.perform(post("/api/auth/login").session(anonymous).header("X-CSRF-TOKEN", token)
                    .contentType("application/json").content("{\"username\":\"analytics-fixture\",\"password\":\"Fixture-analytics-2026\"}"))
                    .andExpect(status().isOk()).andReturn();
            var admin = (MockHttpSession) login.getRequest().getSession(false);
            mvc.perform(get("/api/analytics/pareto").param("days", "60").session(admin))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.totalRevenue").value(40.0))
                    .andExpect(jsonPath("$.models[0].classification").value("CLASS_A"))
                    .andExpect(jsonPath("$.models[0].colorId").value(1));
        }
    }

    private void sale(JdbcTemplate jdbc, int id, int variant, LocalDateTime date, String status) {
        jdbc.update("insert into sales (id, user_id, total, payment_type, status, created_at) values (?, 101, 10, 'CASH', ?, ?)", id, status, date);
        jdbc.update("insert into sale_items (sale_id, variant_id, unit_price, quantity, subtotal) values (?, ?, 10, 1, 10)", id, variant);
    }
}
