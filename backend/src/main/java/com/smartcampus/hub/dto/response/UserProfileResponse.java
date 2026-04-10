package com.smartcampus.hub.dto.response;

import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private AccountStatus status;
    private String profileImage;
    private LocalDateTime createdAt;
}
