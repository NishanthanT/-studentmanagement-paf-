package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.request.CreateTechnicianRequest;
import com.smartcampus.hub.dto.request.UpdateUserRoleRequest;
import com.smartcampus.hub.dto.request.UpdateUserStatusRequest;
import com.smartcampus.hub.dto.response.UserProfileResponse;
import com.smartcampus.hub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.Role;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}/details")
    public ResponseEntity<com.smartcampus.hub.dto.response.UserDetailedProfileResponse> getUserDetailedProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserDetailedProfile(id));
    }

    @PostMapping("/technicians")
    public ResponseEntity<Map<String, String>> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        userService.createTechnician(request);
        return new ResponseEntity<>(Map.of("message", "Technician created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(@PathVariable Long id, @Valid @RequestBody UpdateUserRoleRequest request) {
        userService.updateUserRole(id, request);
        return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        userService.updateUserStatus(id, request);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserProfileResponse>> searchUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status) {
        return ResponseEntity.ok(userService.searchUsers(searchTerm, role, status));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id, 
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        String currentEmail = userDetails != null ? userDetails.getUsername() : "";
        userService.deleteUser(id, currentEmail, reason);
        return ResponseEntity.ok(Map.of("message", "Account administratively purged from the system. Notification dispatched."));
    }

    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsersPdf(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status) {
        
        byte[] pdfBytes = userService.exportUsersToPdf(searchTerm, role, status);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "users_audit_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
