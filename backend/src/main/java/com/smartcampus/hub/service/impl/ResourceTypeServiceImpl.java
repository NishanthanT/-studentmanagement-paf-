package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.entity.ResourceType;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.ResourceTypeRepository;
import com.smartcampus.hub.service.ResourceTypeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceTypeServiceImpl implements ResourceTypeService {

    private final ResourceTypeRepository resourceTypeRepository;

    public ResourceTypeServiceImpl(ResourceTypeRepository resourceTypeRepository) {
        this.resourceTypeRepository = resourceTypeRepository;
    }

    @Override
    public List<ResourceType> getAllResourceTypes() {
        return resourceTypeRepository.findAll();
    }

    @Override
    public ResourceType getResourceTypeById(Long id) {
        return resourceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource Type not found with id: " + id));
    }

    @Override
    public ResourceType createResourceType(ResourceType resourceType) {
        return resourceTypeRepository.save(resourceType);
    }

    @Override
    public ResourceType updateResourceType(Long id, ResourceType resourceType) {
        ResourceType existingType = getResourceTypeById(id);
        existingType.setName(resourceType.getName());
        existingType.setDescription(resourceType.getDescription());
        existingType.setLocations(resourceType.getLocations());
        return resourceTypeRepository.save(existingType);
    }

    @Override
    public void deleteResourceType(Long id) {
        ResourceType existingType = getResourceTypeById(id);
        resourceTypeRepository.delete(existingType);
    }
}
