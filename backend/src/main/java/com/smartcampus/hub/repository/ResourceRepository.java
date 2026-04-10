package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.enums.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByTypeContainingIgnoreCase(String type);
    List<Resource> findByNameContainingIgnoreCase(String name);
    long countByStatus(ResourceStatus status);

    @Query("SELECT r.type, COUNT(r) FROM Resource r GROUP BY r.type")
    List<Object[]> countResourcesByType();
}
