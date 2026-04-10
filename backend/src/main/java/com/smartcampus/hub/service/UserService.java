package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.request.CreateTechnicianRequest;
import com.smartcampus.hub.dto.request.UpdateProfileRequest;
import com.smartcampus.hub.dto.request.UpdateUserRoleRequest;
import com.smartcampus.hub.dto.request.UpdateUserStatusRequest;
import com.smartcampus.hub.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getCurrentUserProfile(String email);
    com.smartcampus.hub.dto.response.UserDetailedProfileResponse getUserDetailedProfile(Long userId);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    void createTechnician(CreateTechnicianRequest request);
    void updateUserRole(Long userId, UpdateUserRoleRequest request);
    void updateUserStatus(Long userId, UpdateUserStatusRequest request);
    java.util.List<UserProfileResponse> getAllUsers();
    java.util.List<UserProfileResponse> searchUsers(String searchTerm, com.smartcampus.hub.enums.Role role, com.smartcampus.hub.enums.AccountStatus status);
    void deleteUser(Long userId, String currentAdminEmail, String reason);
    byte[] exportUsersToPdf(String searchTerm, com.smartcampus.hub.enums.Role role, com.smartcampus.hub.enums.AccountStatus status);
}
