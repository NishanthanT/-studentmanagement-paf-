package com.smartcampus.hub.dto.response;

import com.smartcampus.hub.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
