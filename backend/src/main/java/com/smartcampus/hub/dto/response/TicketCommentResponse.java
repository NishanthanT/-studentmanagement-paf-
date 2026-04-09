package com.smartcampus.hub.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String commentText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
