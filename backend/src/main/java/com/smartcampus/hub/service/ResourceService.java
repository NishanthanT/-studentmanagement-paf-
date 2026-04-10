package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.request.ResourceRequest;
import com.smartcampus.hub.dto.response.ResourceResponse;
import java.util.List;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);
    ResourceResponse updateResource(Long id, ResourceRequest request);
    void deleteResource(Long id);
    ResourceResponse getResourceById(Long id);
    List<ResourceResponse> getAllResources();
    List<ResourceResponse> searchResources(String keyword, String type);
}
