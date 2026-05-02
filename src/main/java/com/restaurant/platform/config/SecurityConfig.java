package com.restaurant.platform.config;

import com.restaurant.platform.security.JwtAuthenticationFilter;
import com.restaurant.platform.security.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JwtAuthenticationEntryPoint entryPoint;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // 🔥 1. Disable CSRF
                .csrf(csrf -> csrf.disable())

                // 🔥 2. Enable CORS
                .cors(Customizer.withDefaults())

                // 🔥 3. Stateless (QUAN TRỌNG NHẤT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 🔥 4. Authorization - Role-based URL access (THEO NGHIỆP VỤ THỰC TẾ)
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/test-db/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // Profile - Any authenticated user
                        .requestMatchers("/api/v1/profile/**").authenticated()

                        // Dashboard - ADMIN, MANAGER only (staff dashboards are frontend-only)
                        .requestMatchers("/api/v1/dashboard/**").hasAnyRole("ADMIN", "MANAGER")

                        // Menu - CUSTOMER/STAFF can view, ADMIN/MANAGER can manage
                        .requestMatchers("/api/v1/menu").authenticated()
                        .requestMatchers("/api/v1/menu/**").authenticated()
                        .requestMatchers("/api/v1/categories").authenticated()

                        // Tables - All authenticated can view, only ADMIN can manage (tables are fixed)
                        .requestMatchers("/api/v1/tables").authenticated()
                        .requestMatchers("/api/v1/tables/**").hasRole("ADMIN")

                        // Orders - CUSTOMER can only view their own, STAFF can create/update
                        .requestMatchers("/api/v1/orders").authenticated()
                        .requestMatchers("/api/v1/orders/**").authenticated()

                        // Reservations - CUSTOMER can create/view own, STAFF can manage all
                        .requestMatchers("/api/v1/reservations").authenticated()
                        .requestMatchers("/api/v1/reservations/**").authenticated()

                        // Payments - All authenticated (CUSTOMER for self-checkout)
                        .requestMatchers("/api/v1/payments/**").authenticated()

                        // Loyalty - CUSTOMER can view/redeem own, ADMIN/MANAGER can view all
                        .requestMatchers("/api/v1/loyalty/me").authenticated()
                        .requestMatchers("/api/v1/loyalty/history").authenticated()
                        .requestMatchers("/api/v1/loyalty/redeem").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/loyalty/all").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/v1/loyalty/**").authenticated()

                        // Reports - All authenticated (role-specific data filtered in controller)
                        .requestMatchers("/api/v1/reports/**").authenticated()

                        // Notifications - Any authenticated user
                        .requestMatchers("/api/v1/notifications/**").authenticated()

                        // User management - ADMIN/MANAGER only
                        .requestMatchers("/api/v1/users/**").hasAnyRole("ADMIN", "MANAGER")

                        // Role management - ADMIN only
                        .requestMatchers("/api/v1/roles/**").hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // 🔥 5. Exception handling
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(entryPoint)
                )

                // 🔥 6. Provider
                .authenticationProvider(authenticationProvider)

                // 🔥 7. JWT filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}
