package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.request.TicketAssignmentRequest;
import com.smartcampus.hub.dto.request.TicketStatusUpdateRequest;
import com.smartcampus.hub.dto.response.TicketResponse;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminTicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/search")
    public ResponseEntity<List<TicketResponse>> searchTickets(@RequestParam String query) {
        return ResponseEntity.ok(ticketService.searchTickets(query));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TicketResponse>> filterTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ticketService.filterTickets(status, priority, technicianId, userEmail, userName, category, resourceId, date));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable Long id,
            @RequestBody TicketAssignmentRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.getTechnicianId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }
}
