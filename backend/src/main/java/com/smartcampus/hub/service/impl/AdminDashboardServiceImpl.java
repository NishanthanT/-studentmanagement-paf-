package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.response.DashboardStatsResponse;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        Map<String, Long> resourceTypeDistribution = new HashMap<>();
        resourceRepository.countResourcesByType().forEach(objs -> 
            resourceTypeDistribution.put(String.valueOf(objs[0]), (Long) objs[1])
        );

        Map<String, Long> ticketPriorityDistribution = new HashMap<>();
        ticketRepository.countTicketsByPriority().forEach(objs -> 
            ticketPriorityDistribution.put(String.valueOf(objs[0]), (Long) objs[1])
        );

        Map<String, Long> bookingStatusDistribution = new HashMap<>();
        bookingRepository.countBookingsByStatus().forEach(objs -> 
            bookingStatusDistribution.put(String.valueOf(objs[0]), (Long) objs[1])
        );

        Map<String, Long> bookingTrends = new HashMap<>();
        bookingRepository.countBookingsByDate(java.time.LocalDate.now().minusDays(7)).forEach(objs -> 
            bookingTrends.put(String.valueOf(objs[0]), (Long) objs[1])
        );

        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalTechnicians(userRepository.countByRole(Role.TECHNICIAN))
                .totalResources(resourceRepository.count())
                .activeResources(resourceRepository.countByStatus(ResourceStatus.ACTIVE))
                .outOfServiceResources(resourceRepository.countByStatus(ResourceStatus.OUT_OF_SERVICE))
                .pendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING))
                .openTickets(ticketRepository.countByStatus(TicketStatus.OPEN))
                .resolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED))
                .resourceTypeDistribution(resourceTypeDistribution)
                .ticketPriorityDistribution(ticketPriorityDistribution)
                .bookingStatusDistribution(bookingStatusDistribution)
                .bookingTrends(bookingTrends)
                .build();
    }
}
