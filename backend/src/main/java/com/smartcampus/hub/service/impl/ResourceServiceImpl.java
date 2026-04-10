package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.request.ResourceRequest;
import com.smartcampus.hub.dto.response.ResourceResponse;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.service.ResourceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final com.smartcampus.hub.repository.UserRepository userRepository;
    private final com.smartcampus.hub.service.ActivityLogService activityLogService;

    public ResourceServiceImpl(ResourceRepository resourceRepository, 
                               com.smartcampus.hub.repository.UserRepository userRepository,
                               com.smartcampus.hub.service.ActivityLogService activityLogService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityWindow(request.getAvailabilityWindow())
                .availableStartDate(request.getAvailableStartDate())
                .availableEndDate(request.getAvailableEndDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus())
                .build();
        
        resource = resourceRepository.save(resource);
        logActivity("RESOURCE_CREATED", "Created resource: " + resource.getName() + " (" + resource.getType() + ")");
        return mapToResponse(resource);
    }

    @Override
    @Transactional
    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityWindow(request.getAvailabilityWindow());
        resource.setAvailableStartDate(request.getAvailableStartDate());
        resource.setAvailableEndDate(request.getAvailableEndDate());
        resource.setStartTime(request.getStartTime());
        resource.setEndTime(request.getEndTime());
        resource.setStatus(request.getStatus());

        resource = resourceRepository.save(resource);
        logActivity("RESOURCE_UPDATED", "Updated resource ID " + id + ": " + resource.getName());
        return mapToResponse(resource);
    }

    @Override
    @Transactional
    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        resourceRepository.delete(resource);
        logActivity("RESOURCE_DELETED", "Deleted resource: " + resource.getName() + " (ID: " + id + ")");
    }

    private void logActivity(String action, String details) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            userRepository.findByEmail(email).ifPresent(user -> activityLogService.log(user, action, details));
        }
    }

    @Override
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return mapToResponse(resource);
    }

    @Override
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> searchResources(String keyword, String type) {
        List<Resource> resources;
        if (type != null && !type.isEmpty()) {
            resources = resourceRepository.findByTypeContainingIgnoreCase(type);
        } else if (keyword != null && !keyword.isEmpty()) {
            resources = resourceRepository.findByNameContainingIgnoreCase(keyword);
        } else {
            resources = resourceRepository.findAll();
        }
        
        return resources.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availabilityWindow(resource.getAvailabilityWindow())
                .availableStartDate(resource.getAvailableStartDate())
                .availableEndDate(resource.getAvailableEndDate())
                .startTime(resource.getStartTime())
                .endTime(resource.getEndTime())
                .status(resource.getStatus())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
