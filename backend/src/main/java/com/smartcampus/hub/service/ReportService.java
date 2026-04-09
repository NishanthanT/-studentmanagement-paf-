package com.smartcampus.hub.service;

import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;

import java.time.LocalDate;

public interface ReportService {
    byte[] exportUsersToPdf(String searchTerm, Role role, AccountStatus status);
    byte[] exportBookingsToPdf(BookingStatus status, Long resourceId, LocalDate date, String userEmail, String userName);
    byte[] exportTicketsToPdf(TicketStatus status, TicketPriority priority, Long technicianId, String userEmail, String userName, String category, Long resourceId, LocalDate date);
}
