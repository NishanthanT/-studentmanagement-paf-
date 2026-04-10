package com.smartcampus.hub.service;

import com.smartcampus.hub.entity.ResourceType;
import java.util.List;

public interface ResourceTypeService {
    List<ResourceType> getAllResourceTypes();
    ResourceType getResourceTypeById(Long id);
    ResourceType createResourceType(ResourceType resourceType);
    ResourceType updateResourceType(Long id, ResourceType resourceType);
    void deleteResourceType(Long id);
}
