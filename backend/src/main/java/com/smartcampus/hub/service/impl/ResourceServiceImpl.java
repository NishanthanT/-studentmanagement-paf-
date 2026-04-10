package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.request.ResourceRequest;
import com.smartcampus.hub.dto.response.ResourceResponse;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.service.ResourceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final com.smartcampus.hub.repository.UserRepository userRepository;
    private final com.smartcampus.hub.service.ActivityLogService activityLogService;
    private final com.smartcampus.hub.repository.ResourceTypeRepository resourceTypeRepository;
    private static final String RESOURCE_UPLOAD_DIR = "uploads/resources";

    public ResourceServiceImpl(ResourceRepository resourceRepository,
            com.smartcampus.hub.repository.UserRepository userRepository,
            com.smartcampus.hub.service.ActivityLogService activityLogService,
            com.smartcampus.hub.repository.ResourceTypeRepository resourceTypeRepository) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
        this.resourceTypeRepository = resourceTypeRepository;
    }

    @Override
    @Transactional
    public ResourceResponse createResource(ResourceRequest request, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityWindow(request.getAvailabilityWindow())
                .status(request.getStatus())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .everyDay(request.getStartDate() == null)
                .imageUrl(imageUrl)
                .build();

        resource = resourceRepository.save(resource);
        logActivity("RESOURCE_CREATED", "Created resource: " + resource.getName() + " (" + resource.getType() + ")");
        return mapToResponse(resource);
    }

    @Override
    @Transactional
    public ResourceResponse updateResource(Long id, ResourceRequest request, MultipartFile image) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        if (image != null && !image.isEmpty()) {
            String imageUrl = saveImage(image);
            resource.setImageUrl(imageUrl);
        }

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityWindow(request.getAvailabilityWindow());
        resource.setStatus(request.getStatus());
        resource.setStartDate(request.getStartDate());
        resource.setEndDate(request.getEndDate());
        resource.setEveryDay(request.getStartDate() == null);

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
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal())
                    .getUsername();
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
        String description = resourceTypeRepository.findByName(resource.getType())
                .map(com.smartcampus.hub.entity.ResourceType::getDescription)
                .orElse("");

        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .typeDescription(description)
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availabilityWindow(resource.getAvailabilityWindow())
                .status(resource.getStatus())
                .startDate(resource.getStartDate())
                .endDate(resource.getEndDate())
                .everyDay(resource.getEveryDay())
                .imageUrl(resource.getImageUrl())
                .createdAt(resource.getCreatedAt())
                .build();
    }

    private String saveImage(MultipartFile file) {
        try {
            Path root = Paths.get(RESOURCE_UPLOAD_DIR);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Files.copy(file.getInputStream(), root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            return RESOURCE_UPLOAD_DIR + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store image. Error: " + e.getMessage());
        }
    }
}
