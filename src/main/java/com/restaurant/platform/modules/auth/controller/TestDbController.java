package com.restaurant.platform.modules.auth.controller;

import com.restaurant.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test-db")
@RequiredArgsConstructor
public class TestDbController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public List<String> getUsers() {
        return userRepository.findAll().stream()
                .map(u -> u.getEmail() + " | active=" + u.isActive() + " | roles=" + u.getRoles().size())
                .collect(Collectors.toList());
    }

    @GetMapping("/check-email")
    public String checkAdmin() {
        return userRepository.findByEmail("admin@servegenius.com")
            .map(u -> "Found: " + u.getId() + ", deleted=" + u.getDeleted())
            .orElse("NOT_FOUND");
    }
}
