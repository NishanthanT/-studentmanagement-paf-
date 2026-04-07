package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.response.ResourceResponse;
import com.smartcampus.hub.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type) {
        
        if (keyword != null || type != null) {
            return ResponseEntity.ok(resourceService.searchResources(keyword, type));
        }
        
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }
}
