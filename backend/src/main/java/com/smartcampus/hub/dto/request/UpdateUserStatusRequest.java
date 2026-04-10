package com.smartcampus.hub.dto.request;

import com.smartcampus.hub.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "Status is required")
    private AccountStatus status;
}
