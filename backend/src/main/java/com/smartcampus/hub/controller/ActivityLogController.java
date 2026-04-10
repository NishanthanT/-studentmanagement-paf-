package com.smartcampus.hub.controller;

import com.smartcampus.hub.entity.ActivityLog;
import com.smartcampus.hub.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getAllLogs() {
        List<ActivityLogResponse> logs = activityLogService.getAllLogs().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userName(log.getUser() != null ? log.getUser().getFullName() : "System")
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "N/A")
                .action(log.getAction())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class ActivityLogResponse {
        private Long id;
        private String userName;
        private String userEmail;
        private String action;
        private String details;
        private java.time.LocalDateTime timestamp;
    }
}
