package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.request.BookingRequest;
import com.smartcampus.hub.dto.response.BookingResponse;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Resource;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.exception.BadRequestException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.ActivityLogService;
import com.smartcampus.hub.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = getCurrentUser();
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));

        if (resource.getStatus() != com.smartcampus.hub.enums.ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking.");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time.");
        }

        // Preliminary conflict check (only for approved bookings)
        long overlapCount = bookingRepository.countOverlappingApprovedBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (overlapCount > 0) {
            throw new BadRequestException("Conflict: Resource is already booked for the selected time slot.");
        }

        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        activityLogService.log(user, "BOOKING_CREATED", "Requested booking for " + resource.getName() + " on " + request.getDate());

        return mapToResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getMyBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByUserEmail(user.getEmail()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a booking that is already " + booking.getStatus());
        }

        // Only PENDING bookings can be cancelled by the user? 
        // Admin approval logic might differ, but the user requested: 
        // "APPROVED ANA PIRAKU CANCEL PANELA SO BUTTON DISABLE PANU"
        // This implies the USER shouldn't cancel approved ones.
        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new BadRequestException("Cannot cancel an approved booking. Please contact support.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);
        activityLogService.log(user, "BOOKING_CANCELLED", "Cancelled booking ID " + id + " for " + booking.getResource().getName());

        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to update this booking.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be edited.");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time.");
        }

        // Conflict check excluding current booking
        long overlapCount = bookingRepository.countOverlappingApprovedBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (overlapCount > 0) {
            throw new BadRequestException("Conflict: Resource is already booked for the selected time slot.");
        }

        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        Booking savedBooking = bookingRepository.save(booking);
        activityLogService.log(user, "BOOKING_UPDATED", "Updated booking ID " + id + " for " + booking.getResource().getName());

        return mapToResponse(savedBooking);
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
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
