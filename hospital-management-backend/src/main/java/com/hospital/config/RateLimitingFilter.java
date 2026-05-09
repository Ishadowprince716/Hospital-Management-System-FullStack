package com.hospital.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private final Bandwidth loginLimit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
    private final Bandwidth apiLimit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));

    private Bucket resolveBucket(String ip, String requestURI) {
        String key = ip + "-" + (requestURI.contains("/login") ? "LOGIN" : "API");
        
        return cache.computeIfAbsent(key, k -> {
            if (requestURI.contains("/login") || requestURI.contains("/register")) {
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
        if (!requestURI.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }

        Bucket bucket = resolveBucket(ip, requestURI);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
        }
    }
}
