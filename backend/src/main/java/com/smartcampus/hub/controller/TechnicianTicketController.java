package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.request.TicketStatusUpdateRequest;
import com.smartcampus.hub.dto.response.TicketResponse;
import com.smartcampus.hub.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TECHNICIAN')")
@CrossOrigin(origins = "*")
public class TechnicianTicketController {

    private final TicketService ticketService;

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(userDetails.getUsername()));
    }

    @GetMapping("/stats")
    public ResponseEntity<com.smartcampus.hub.dto.response.TechnicianStatsResponse> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getTechnicianStats(userDetails.getUsername()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody TicketStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.updateTechnicianStatus(id, request, userDetails.getUsername()));
    }
}
