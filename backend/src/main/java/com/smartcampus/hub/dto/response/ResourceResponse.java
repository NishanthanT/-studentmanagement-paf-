package com.smartcampus.hub.dto.response;

import com.smartcampus.hub.enums.ResourceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourceResponse {
    private Long id;
    private String name;
    private String type;
    private String typeDescription;
    private Integer capacity;
    private String location;
    private String availabilityWindow;
    private ResourceStatus status;
    private String startDate;
    private String endDate;
    private Boolean everyDay;
    private String imageUrl;
    private LocalDateTime createdAt;
}
