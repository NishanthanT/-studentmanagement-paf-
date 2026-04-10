package com.smartcampus.hub.dto.response;

import com.smartcampus.hub.enums.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourceResponse {
    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String availabilityWindow;
    private LocalDate availableStartDate;
    private LocalDate availableEndDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ResourceStatus status;
    private LocalDateTime createdAt;
}
