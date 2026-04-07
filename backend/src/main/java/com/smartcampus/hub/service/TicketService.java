package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.request.*;
import com.smartcampus.hub.dto.response.TicketCommentResponse;
import com.smartcampus.hub.dto.response.TicketResponse;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface TicketService {
    
    // User functions
    TicketResponse createTicket(TicketRequest request, List<MultipartFile> attachments, String userEmail);
    List<TicketResponse> getMyTickets(String userEmail);
    TicketResponse getTicketById(Long id, String userEmail);
    TicketCommentResponse addComment(Long ticketId, TicketCommentRequest request, String userEmail);
    TicketCommentResponse editComment(Long commentId, TicketCommentRequest request, String userEmail);
    void deleteComment(Long commentId, String userEmail);

    // Admin functions
    List<TicketResponse> getAllTickets();
    List<TicketResponse> searchTickets(String query);
    List<TicketResponse> filterTickets(TicketStatus status, TicketPriority priority, 
                                      Long technicianId, String userEmail, String userName,
                                      String category, Long resourceId, LocalDate date);
    TicketResponse assignTechnician(Long ticketId, Long technicianId);
    TicketResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request);

    // Technician functions
    List<TicketResponse> getAssignedTickets(String technicianEmail);
    TicketResponse updateTechnicianStatus(Long ticketId, TicketStatusUpdateRequest request, String technicianEmail);
    com.smartcampus.hub.dto.response.TechnicianStatsResponse getTechnicianStats(String technicianEmail);
}
