package com.hospital.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String uploadLocation;

    public WebConfig(@Value("${file.upload-dir:uploads}") String uploadDir) {
        String location = Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        this.uploadLocation = location.endsWith("/") ? location : location + "/";
    }

    @Override
    public void addResourceHandlers(@org.springframework.lang.NonNull ResourceHandlerRegistry registry) {
        // Map /uploads/** URL to file system location
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }

}
