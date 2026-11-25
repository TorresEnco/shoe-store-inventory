package com.shoestore.inventory.shared.config;

import com.shoestore.inventory.user.application.ports.in.LoginUseCase;
import com.shoestore.inventory.user.application.ports.out.UserRepositoryPort;
import com.shoestore.inventory.user.domain.exception.InvalidCredentialsException;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.LoginResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Configuration
public class SessionSecurity {
    @Bean
    AuthenticationManager authenticationManager(LoginUseCase login) {
        return credentials -> {
            try {
                var profile = LoginResponse.from(login.login(credentials.getName(), (String) credentials.getCredentials()));
                return UsernamePasswordAuthenticationToken.authenticated(profile, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + profile.role().name())));
            } catch (InvalidCredentialsException ex) {
                throw new BadCredentialsException("Usuario o contraseña incorrectos");
            }
        };
    }

    @Bean
    HttpSessionSecurityContextRepository sessionContexts() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    @Profile("!bootstrap-admin")
    SecurityFilterChain api(HttpSecurity http, HttpSessionSecurityContextRepository contexts,
                            UserRepositoryPort users) throws Exception {
        http.securityContext(context -> context.securityContextRepository(contexts))
            .requestCache(cache -> cache.disable())
            .authorizeHttpRequests(routes -> routes
                .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/{id:[0-9]+}", "/api/customers",
                        "/api/customers/search", "/api/sales/today", "/api/sales/{id:[0-9]+}").hasAnyRole("ADMIN", "CASHIER")
                .requestMatchers(HttpMethod.POST, "/api/sales").hasAnyRole("ADMIN", "CASHIER")
                .requestMatchers(HttpMethod.PATCH, "/api/products/variants/{id}/stock").hasAnyRole("ADMIN", "CASHIER")
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/analytics/pareto").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users", "/api/products").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/users/{id}/toggle-status", "/api/sales/{id}/cancel").hasRole("ADMIN")
                .anyRequest().denyAll())
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((req, res, ex) -> res.setStatus(401))
                .accessDeniedHandler((req, res, ex) -> {
                    boolean anonymous = SecurityContextHolder.getContext().getAuthentication() == null;
                    boolean login = req.getRequestURI().equals(req.getContextPath() + "/api/auth/login");
                    res.setStatus(anonymous && !login ? 401 : 403);
                }))
            .logout(logout -> logout.logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
            .addFilterBefore(new OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                        FilterChain chain) throws IOException, ServletException {
                    var auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getPrincipal() instanceof LoginResponse profile
                            && users.findById(profile.id()).filter(user -> Boolean.TRUE.equals(user.getActive())
                                && user.getRole() == profile.role()).isEmpty()) {
                        req.getSession().invalidate();
                        SecurityContextHolder.clearContext();
                        res.setStatus(401);
                        return;
                    }
                    chain.doFilter(req, res);
                }
            }, AnonymousAuthenticationFilter.class);
        return http.build();
    }
}
