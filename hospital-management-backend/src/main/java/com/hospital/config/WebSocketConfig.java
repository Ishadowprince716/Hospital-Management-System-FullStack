package com.hospital.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final List<String> allowedOriginPatterns;

    public WebSocketConfig(@Value("${cors.allowed-origins:http://localhost:*,http://127.0.0.1:*,https://*.railway.app}") String allowedOrigins) {
        List<String> configuredOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
        if (configuredOrigins.isEmpty()) {
            this.allowedOriginPatterns = List.of("http://localhost:*", "http://127.0.0.1:*");
            return;
        }
        this.allowedOriginPatterns = configuredOrigins;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry the messages back to the client on destinations prefixed with /topic
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages that are bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        // Specific user prefix for private messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint that clients will use to connect to our WebSocket server
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
                .withSockJS();
    }
}
