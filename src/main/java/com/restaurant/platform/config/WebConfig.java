package com.restaurant.platform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ========================
    // 2. Static resource (optional)
    // ========================
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    // ========================
    // 3. Interceptor (optional)
    // ========================
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Sau này thêm logging/audit thì dùng
        // registry.addInterceptor(new LoggingInterceptor());
    }
}