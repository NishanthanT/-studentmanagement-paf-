package com.smartcampus.hub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianStatsResponse {
    private long pendingCount;
    private long inProgressCount;
    private long completedCount;
    private long totalAssigned;
}
