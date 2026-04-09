package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResourceTypeRepository extends JpaRepository<ResourceType, Long> {
    Optional<ResourceType> findByName(String name);
}
