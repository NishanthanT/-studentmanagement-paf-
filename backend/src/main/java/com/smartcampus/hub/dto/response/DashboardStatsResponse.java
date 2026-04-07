package com.smartcampus.hub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalTechnicians;
    private long totalResources;
    private long activeResources;
    private long outOfServiceResources;
    private long pendingBookings;
    private long openTickets;
    private long resolvedTickets;

    // For charts
    private Map<String, Long> resourceTypeDistribution;
    private Map<String, Long> ticketPriorityDistribution;
    private Map<String, Long> bookingStatusDistribution;
    private Map<String, Long> bookingTrends; // Date -> Count
}
