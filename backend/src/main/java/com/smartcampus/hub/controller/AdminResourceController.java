package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.request.ResourceRequest;
import com.smartcampus.hub.dto.response.ResourceResponse;
import com.smartcampus.hub.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceController {

    private final ResourceService resourceService;

    public AdminResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ResourceResponse> createResource(
            @RequestPart("resource") @Valid ResourceRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return new ResponseEntity<>(resourceService.createResource(request, image), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @RequestPart("resource") @Valid ResourceRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(resourceService.updateResource(id, request, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }
}
