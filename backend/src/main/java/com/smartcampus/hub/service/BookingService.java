package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.request.BookingRequest;
import com.smartcampus.hub.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    /**
     * Create a new booking request for the current user.
     * @param request Booking details
     * @return Created booking response
     */
    BookingResponse createBooking(BookingRequest request);

    /**
     * Get all bookings for the current user.
     * @return List of bookings
     */
    List<BookingResponse> getMyBookings();

    /**
     * Cancel a booking by ID for the current user.
     * @param id Booking ID
     * @return Updated booking response
     */
    BookingResponse cancelBooking(Long id);

    /**
     * Update an existing booking request for the current user.
     * @param id Booking ID
     * @param request Updated booking details
     * @return Updated booking response
     */
    BookingResponse updateBooking(Long id, BookingRequest request);
}
