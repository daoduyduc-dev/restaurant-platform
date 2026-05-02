package com.restaurant.platform.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class MediaUrlService {

    @Value("${app.api.url:http://localhost:8080}")
    private String apiUrl;

    public String toPublicUrl(String path) {
        if (path == null || path.isBlank()) {
            return path;
        }

        URI uri = URI.create(path);
        if (uri.isAbsolute()) {
            return path;
        }

        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return UriComponentsBuilder.fromUriString(apiUrl)
                .path(normalizedPath)
                .toUriString();
    }
}
