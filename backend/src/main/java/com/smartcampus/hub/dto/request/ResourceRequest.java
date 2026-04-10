package com.smartcampus.hub.dto.request;

import com.smartcampus.hub.enums.ResourceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Availability window is required")
    private String availabilityWindow;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String startDate;
    private String endDate;
    private Boolean everyDay;
}
