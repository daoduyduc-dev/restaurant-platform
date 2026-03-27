package com.restaurant.platform.security;

import com.restaurant.platform.modules.auth.entity.User;
import com.restaurant.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository.findWithRolesAndPermissions(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 🔥 Validate user (best practice)
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new UsernameNotFoundException("User is deleted");
        }

        if (Boolean.FALSE.equals(user.isActive())) {
            throw new UsernameNotFoundException("User is inactive");
        }

        var authorities = buildAuthorities(user);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    // 🔥 Tách riêng logic (clean + reusable)
    private List<SimpleGrantedAuthority> buildAuthorities(User user) {

        return user.getRoles().stream()
                .flatMap(role -> {

                    // ROLE
                    var roleAuthority = new SimpleGrantedAuthority("ROLE_" + role.getName());

                    // PERMISSIONS
                    var permissionAuthorities = role.getPermissions().stream()
                            .map(permission -> new SimpleGrantedAuthority(permission.getCode()));

                    return Stream.concat(Stream.of(roleAuthority), permissionAuthorities);
                })
                .distinct()
                .toList();
    }
}
