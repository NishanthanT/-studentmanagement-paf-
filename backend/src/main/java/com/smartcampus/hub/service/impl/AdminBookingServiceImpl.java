package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.response.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.exception.BadRequestException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.service.AdminBookingService;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminBookingServiceImpl implements AdminBookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final com.smartcampus.hub.repository.UserRepository userRepository;
    private final com.smartcampus.hub.service.ActivityLogService activityLogService;

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> searchBookings(String query) {
        return bookingRepository.searchBookings(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> filterBookings(BookingStatus status, Long resourceId, LocalDate date, String userEmail, String userName) {
        return bookingRepository.filterBookings(status, resourceId, date, userEmail, userName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved.");
        }

        // Overlap checking logic
        long overlapCount = bookingRepository.countOverlappingApprovedBookings(
                booking.getResource().getId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (overlapCount > 0) {
            throw new BadRequestException("Conflict detected: This resource is already booked for the specified time slot.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                savedBooking.getUser(),
                "Your booking for " + savedBooking.getResource().getName() + " has been APPROVED.",
                NotificationType.BOOKING_APPROVED,
                savedBooking.getId()
        );

        logActivity("BOOKING_APPROVED", "Approved booking ID " + savedBooking.getId() + " for " + savedBooking.getUser().getFullName());

        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled bookings cannot be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                savedBooking.getUser(),
                "Your booking for " + savedBooking.getResource().getName() + " has been REJECTED. Reason: " + reason,
                NotificationType.BOOKING_REJECTED,
                savedBooking.getId()
        );

        logActivity("BOOKING_REJECTED", "Rejected booking ID " + savedBooking.getId() + " for " + savedBooking.getUser().getFullName() + ". Reason: " + reason);

        return mapToResponse(savedBooking);
    }

    private void logActivity(String action, String details) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            userRepository.findByEmail(email).ifPresent(user -> activityLogService.log(user, action, details));
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getFullName())
                .userEmail(booking.getUser().getEmail())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceType(booking.getResource().getType())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
