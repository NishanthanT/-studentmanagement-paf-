package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.response.BookingResponse;
import com.smartcampus.hub.enums.BookingStatus;

import java.time.LocalDate;
import java.util.List;

public interface AdminBookingService {
    List<BookingResponse> getAllBookings();
    List<BookingResponse> searchBookings(String query);
    List<BookingResponse> filterBookings(BookingStatus status, Long resourceId, LocalDate date, String userEmail, String userName);
    BookingResponse approveBooking(Long id);
    BookingResponse rejectBooking(Long id, String reason);
}
