package com.smartcampus.hub.dto.response;

import com.smartcampus.hub.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private Long targetId;
    private LocalDateTime createdAt;
}
