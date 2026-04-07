package com.smartcampus.hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartCampusHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusHubApplication.class, args);
    }
}
