package com.smartcampus.hub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailedProfileResponse {
    private UserProfileResponse profile;
    private List<TicketResponse> recentTickets;
    private List<BookingResponse> recentBookings;
    private List<ActivityLogResponse> activityLogs;
}
