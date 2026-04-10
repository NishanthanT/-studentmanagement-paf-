package com.smartcampus.hub.controller;

import com.smartcampus.hub.entity.ResourceType;
import com.smartcampus.hub.service.ResourceTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resource-types")
public class ResourceTypeController {

    private final ResourceTypeService resourceTypeService;

    public ResourceTypeController(ResourceTypeService resourceTypeService) {
        this.resourceTypeService = resourceTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceType>> getAllResourceTypes() {
        return ResponseEntity.ok(resourceTypeService.getAllResourceTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceType> getResourceTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceTypeService.getResourceTypeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceType> createResourceType(@RequestBody ResourceType resourceType) {
        return new ResponseEntity<>(resourceTypeService.createResourceType(resourceType), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceType> updateResourceType(@PathVariable Long id, @RequestBody ResourceType resourceType) {
        return ResponseEntity.ok(resourceTypeService.updateResourceType(id, resourceType));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteResourceType(@PathVariable Long id) {
        resourceTypeService.deleteResourceType(id);
        return ResponseEntity.ok(Map.of("message", "Resource type deleted successfully"));
    }
}
