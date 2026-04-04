package com.restaurant.platform.config;

import java.security.Principal;

/**
 * Lightweight Principal implementation used for STOMP sessions.
 */
public class StompPrincipal implements Principal {

    private final String name;

    public StompPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}
