package com.restaurant.platform.config;

import com.restaurant.platform.security.JwtService;
import com.restaurant.platform.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final com.restaurant.platform.modules.auth.repository.UserRepository userRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // enable both topic (broadcast) and queue (user-specific) destinations
        config.enableSimpleBroker("/topic", "/queue");
        config.setUserDestinationPrefix("/user");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new JwtHandshakeInterceptor(jwtService))
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        // Register interceptor to authenticate STOMP CONNECT frames and attach Principal
        registration.interceptors(new WebSocketAuthChannelInterceptor(jwtService, userDetailsService, userRepository));
    }

    public static class JwtHandshakeInterceptor implements HandshakeInterceptor {

        private final JwtService jwtService;

        public JwtHandshakeInterceptor(JwtService jwtService) {
            this.jwtService = jwtService;
        }

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            String query = request.getURI().getQuery();
            if (query != null && query.contains("token=")) {
                String token = query.substring(query.indexOf("token=") + 6);
                if (jwtService.validateToken(token)) {
                    attributes.put("user", jwtService.extractUsername(token));
                    return true;
                }
            }
            return false;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
        }
    }
}