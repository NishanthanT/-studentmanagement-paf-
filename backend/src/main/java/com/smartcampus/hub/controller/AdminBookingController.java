package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.request.RejectionRequest;
import com.smartcampus.hub.dto.response.BookingResponse;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.service.AdminBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(adminBookingService.getAllBookings());
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookingResponse>> searchBookings(@RequestParam String query) {
        return ResponseEntity.ok(adminBookingService.searchBookings(query));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<BookingResponse>> filterBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String userName) {
        return ResponseEntity.ok(adminBookingService.filterBookings(status, resourceId, date, userEmail, userName));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(adminBookingService.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable Long id, @Valid @RequestBody RejectionRequest request) {
        return ResponseEntity.ok(adminBookingService.rejectBooking(id, request.getReason()));
    }
}
