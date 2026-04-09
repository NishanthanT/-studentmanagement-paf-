package com.smartcampus.hub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Map the /uploads/** HTTP path to the local file system "uploads" directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
