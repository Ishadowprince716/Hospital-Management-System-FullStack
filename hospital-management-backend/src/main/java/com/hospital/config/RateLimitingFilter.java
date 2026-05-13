package com.hospital.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.common.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    private final Bandwidth loginLimit;
    private final Bandwidth apiLimit;

    public RateLimitingFilter(
            ObjectMapper objectMapper,
            @Value("${rate-limit.auth.requests-per-minute:30}") long authRequestsPerMinute,
            @Value("${rate-limit.api.requests-per-minute:300}") long apiRequestsPerMinute) {
        this.objectMapper = objectMapper;
        this.loginLimit = Bandwidth.classic(authRequestsPerMinute,
                Refill.intervally(authRequestsPerMinute, Duration.ofMinutes(1)));
        this.apiLimit = Bandwidth.classic(apiRequestsPerMinute,
                Refill.intervally(apiRequestsPerMinute, Duration.ofMinutes(1)));
    }

    private Bucket resolveBucket(String ip, String requestURI) {
        boolean authEndpoint = isAuthEndpoint(requestURI);
        String key = ip + "-" + (authEndpoint ? "AUTH" : "API");
        
        return cache.computeIfAbsent(key, k -> {
            if (authEndpoint) {
                return Bucket.builder().addLimit(loginLimit).build();
            } else {
                return Bucket.builder().addLimit(apiLimit).build();
            }
        });
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        if (shouldSkip(request, requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);

        Bucket bucket = resolveBucket(ip, requestURI);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            ApiResponse<Void> body = ApiResponse.error(
                    "Too many requests. Please try again later.",
                    "RATE_LIMITED",
                    "Request volume exceeded the current throttling policy."
            );
            response.getWriter().write(objectMapper.writeValueAsString(body));
        }
    }

    private boolean shouldSkip(HttpServletRequest request, String requestURI) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        if (!requestURI.startsWith("/api/")) {
            return true;
        }
        return requestURI.equals("/api/health") || requestURI.startsWith("/api/telehealth/ice-config");
    }

    private boolean isAuthEndpoint(String requestURI) {
        String normalizedUri = requestURI.toLowerCase(Locale.ROOT);
        return normalizedUri.contains("/login")
                || normalizedUri.contains("/register")
                || normalizedUri.contains("/verify-otp");
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
