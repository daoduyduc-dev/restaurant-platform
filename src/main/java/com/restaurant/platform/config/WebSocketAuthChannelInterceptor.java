package com.restaurant.platform.config;

import com.restaurant.platform.security.JwtService;
import com.restaurant.platform.security.UserDetailsServiceImpl;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import com.restaurant.platform.modules.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

/**
 * Interceptor for STOMP CONNECT: validate JWT and attach Principal to the session so
 * that SimpMessageHeaderAccessor.getUser() is populated for subsequent messages.
 */
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Try Authorization header first
            List<String> auth = accessor.getNativeHeader("Authorization");
            String token = null;
            if (auth != null && !auth.isEmpty()) {
                String header = auth.get(0);
                if (header != null && header.startsWith("Bearer ")) {
                    token = header.substring(7);
                }
            }

            // fallback to token header (some clients use token query param or header)
            if (token == null) {
                List<String> tokenHeader = accessor.getNativeHeader("token");
                if (tokenHeader != null && !tokenHeader.isEmpty()) {
                    token = tokenHeader.get(0);
                }
            }

            if (token != null && jwtService.validateToken(token)) {
                try {
                    String username = jwtService.extractUsername(token);
                    UserDetails user = userDetailsService.loadUserByUsername(username);
                    // Try to resolve full User entity to get stable principal (user id)
                    User uEntity = userRepository.findByEmail(user.getUsername()).orElse(null);
                    String principalName = (uEntity != null && uEntity.getId() != null) ? uEntity.getId().toString() : user.getUsername();
                    StompPrincipal principal = new StompPrincipal(principalName);
                    accessor.setUser(principal);
                } catch (Exception ex) {
                    // If anything fails, leave unauthenticated (CONNECT will still proceed but no Principal)
                }
            }
        }

        return message;
    }
}
