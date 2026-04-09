package com.smartcampus.hub.controller;

import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/users")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status) {
        byte[] pdf = reportService.exportUsersToPdf(searchTerm, role, status);
        return createPdfResponse(pdf, "users_report.pdf");
    }

    @GetMapping("/bookings")
    public ResponseEntity<byte[]> exportBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String userName) {
        byte[] pdf = reportService.exportBookingsToPdf(status, resourceId, date, userEmail, userName);
        return createPdfResponse(pdf, "bookings_report.pdf");
    }

    @GetMapping("/tickets")
    public ResponseEntity<byte[]> exportTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        byte[] pdf = reportService.exportTicketsToPdf(status, priority, technicianId, userEmail, userName, category, resourceId, date);
        return createPdfResponse(pdf, "tickets_report.pdf");
    }

    private ResponseEntity<byte[]> createPdfResponse(byte[] pdf, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
