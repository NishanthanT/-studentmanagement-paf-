package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    List<User> findByStatus(AccountStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
            "(:searchTerm IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:status IS NULL OR u.status = :status)")
    List<User> searchUsers(
            @org.springframework.data.repository.query.Param("searchTerm") String searchTerm,
            @org.springframework.data.repository.query.Param("role") Role role,
            @org.springframework.data.repository.query.Param("status") AccountStatus status
    );
}
