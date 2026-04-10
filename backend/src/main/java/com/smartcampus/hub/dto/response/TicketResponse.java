package com.smartcampus.hub.dto.response;

import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long resourceId;
    private String resourceName;
    private String location;
    private String category;
    private String description;
    private TicketPriority priority;
    private String preferredContact;
    private TicketStatus status;
    private Long technicianId;
    private String technicianName;
    private String resolutionNotes;
    private List<AttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class AttachmentResponse {
        private Long id;
        private String filePath;
        private String fileName;
    }
}
