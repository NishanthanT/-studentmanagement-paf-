package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.request.TicketCommentRequest;
import com.smartcampus.hub.dto.request.TicketRequest;
import com.smartcampus.hub.dto.response.TicketCommentResponse;
import com.smartcampus.hub.dto.response.TicketResponse;
import com.smartcampus.hub.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestPart("ticket") TicketRequest request,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.createTicket(request, attachments, userDetails.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getMyTickets(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getTicketById(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.addComment(id, request, userDetails.getUsername()));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<TicketCommentResponse> editComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.editComment(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        ticketService.deleteComment(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
