package com.hospital.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Security Configuration
 * Configures Spring Security for REST API with CORS, CSRF protection, and JWT
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final ObjectMapper objectMapper;
    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            RateLimitingFilter rateLimitingFilter,
            ObjectMapper objectMapper,
            @Value("${cors.allowed-origins:http://localhost:*,http://127.0.0.1:*,https://*.railway.app}") String allowedOrigins) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.objectMapper = objectMapper;
        List<String> configuredOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .collect(Collectors.toCollection(ArrayList::new));
        if (configuredOrigins.isEmpty()) {
            configuredOrigins.add("http://localhost:*");
            configuredOrigins.add("http://127.0.0.1:*");
        }
        this.allowedOriginPatterns = configuredOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Disabled for API, use stateless JWT instead
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers(
                                "/api", "/api/", "/api/health", "/health", "/ready",
                                "/actuator/health", "/actuator/health/**",
                                "/", "/index.html", "/favicon.ico", "/rahul.jpg", "/vite.svg", "/assets/**",
                                "/login", "/register", "/patient/**", "/doctor/**", "/admin/**", "/telehealth", "/telehealth/**",
                                "/api/auth/**", "/auth/**", "/login/**", "/oauth2/**",
                                "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**")
                        .permitAll()
                        // Public doctor listing endpoint
                        .requestMatchers("/api/doctors/**", "/doctors/**").permitAll()
                        // Public SockJS/STOMP handshake endpoint; subscriptions are scoped client-side.
                        .requestMatchers("/ws/**").permitAll()
                        // H2 console (dev only)
                        .requestMatchers("/h2-console", "/h2-console/**").permitAll()
                        // All other requests require authentication (for production)
                        .anyRequest().authenticated())
                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // Exception Handling
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            writeApiError(response, request, HttpStatus.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED",
                                    "Authentication is required to access this resource.");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            writeApiError(response, request, HttpStatus.FORBIDDEN, "Access denied", "FORBIDDEN",
                                    "You do not have permission to access this resource.");
                        }));

        // Allow H2 console frames
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allowed origins are configurable for production hardening.
        configuration.setAllowedOriginPatterns(allowedOriginPatterns);

        // Allow HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials
        configuration.setAllowCredentials(true);

        // Cache pre-flight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeApiError(HttpServletResponse response, HttpServletRequest request, HttpStatus status,
                               String message, String code, String details) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        Object requestId = request.getAttribute(RequestCorrelationFilter.REQUEST_ID_KEY);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .error(ApiResponse.ErrorPayload.builder().code(code).details(details).build())
                .requestId(requestId != null ? String.valueOf(requestId) : "n/a")
                .build();
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
