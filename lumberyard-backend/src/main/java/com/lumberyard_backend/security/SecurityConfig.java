package com.lumberyard_backend.security;

import com.lumberyard_backend.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/h2-console/**");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/api/users/test").permitAll()
                .requestMatchers("/api/users/register", "/api/users/all").hasRole("ADMIN")
                // Inventory endpoints - Admin and Inventory Operations Manager
                .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "INVENTORY_OPERATIONS_MANAGER")
                .requestMatchers("/api/timber/**", "/api/logs/**", "/api/chemical/**").hasAnyRole("ADMIN", "INVENTORY_OPERATIONS_MANAGER")
                // Treatment endpoints - Admin and Inventory Operations Manager
                .requestMatchers("/api/treatment/**").hasAnyRole("ADMIN", "INVENTORY_OPERATIONS_MANAGER")
                // Production endpoints - Admin and Inventory Operations Manager
                .requestMatchers("/api/production/**").hasAnyRole("ADMIN", "INVENTORY_OPERATIONS_MANAGER")
                // Labor endpoints - Admin and Labor Manager
                .requestMatchers("/api/labor/**", "/api/workers/**", "/api/jobs/**", "/api/attendance/**").hasAnyRole("ADMIN", "LABOR_MANAGER")
                // Attendance endpoints - Admin, Labor Manager (record/view), Finance Manager (salary only)
                .requestMatchers("/api/attendance/record", "/api/attendance/update/**").hasAnyRole("ADMIN", "LABOR_MANAGER")
                .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "LABOR_MANAGER", "FINANCE_MANAGER")
                // Finance endpoints - Admin and Finance Manager
                .requestMatchers("/api/finance/**").hasAnyRole("ADMIN", "FINANCE_MANAGER")
                // Salary reports endpoints
                .requestMatchers("/api/salary/reports/**", "/api/salary-reports/**").hasAnyRole("ADMIN", "LABOR_MANAGER", "FINANCE_MANAGER")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsConfigurationSource));
        
        // Allow H2 Console to be displayed in a frame
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
