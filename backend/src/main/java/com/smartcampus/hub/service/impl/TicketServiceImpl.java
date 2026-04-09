package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.request.*;
import com.smartcampus.hub.dto.response.TicketCommentResponse;
import com.smartcampus.hub.dto.response.TicketResponse;
import com.smartcampus.hub.entity.*;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.exception.BadRequestException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.*;
import com.smartcampus.hub.service.TicketService;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;
    private final com.smartcampus.hub.service.ActivityLogService activityLogService;

    private static final String UPLOAD_DIR = "uploads/tickets";

    @Override
    @Transactional
    public TicketResponse createTicket(TicketRequest request, List<MultipartFile> attachments, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (attachments != null && attachments.size() > 3) {
            throw new BadRequestException("Maximum 3 attachments allowed.");
        }

        Resource resource = null;
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        }

        Ticket ticket = Ticket.builder()
                .user(user)
                .resource(resource)
                .location(request.getLocation())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .preferredContact(request.getPreferredContact())
                .status(TicketStatus.OPEN)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        if (attachments != null) {
            saveAttachments(savedTicket, attachments);
        }

        activityLogService.log(user, "TICKET_CREATED", "Created ticket #" + savedTicket.getId() + ": " + savedTicket.getCategory());

        return mapToResponse(savedTicket);
    }

    @Override
    public List<TicketResponse> getMyTickets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ticketRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponse getTicketById(Long id, String userEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole() == Role.USER && !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Access denied to this ticket.");
        }

        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public TicketCommentResponse addComment(Long ticketId, TicketCommentRequest request, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .user(user)
                .commentText(request.getCommentText())
                .build();

        TicketComment savedComment = commentRepository.save(comment);

        User recipient = (ticket.getTechnician() != null && user.getId().equals(ticket.getUser().getId())) 
                ? ticket.getTechnician() : ticket.getUser();
        
        if (recipient != null && !recipient.getId().equals(user.getId())) {
            notificationService.createNotification(
                    recipient,
                    "New comment on ticket #" + ticket.getId() + " from " + user.getFullName(),
                    NotificationType.NEW_TICKET_COMMENT,
                    ticket.getId()
            );
        }

        return mapToCommentResponse(savedComment);
    }

    @Override
    @Transactional
    public TicketCommentResponse editComment(Long commentId, TicketCommentRequest request, String userEmail) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own comments.");
        }

        comment.setCommentText(request.getCommentText());
        return mapToCommentResponse(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String userEmail) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> searchTickets(String query) {
        return ticketRepository.searchTickets(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> filterTickets(TicketStatus status, TicketPriority priority, Long technicianId, String userEmail, String userName, String category, Long resourceId, LocalDate date) {
        return ticketRepository.filterTickets(status, priority, technicianId, userEmail, userName, category, resourceId, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponse assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new BadRequestException("Assigned user must be a Technician.");
        }

        ticket.setTechnician(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket savedTicket = ticketRepository.save(ticket);

        notificationService.createNotification(
                technician,
                "New maintenance ticket #" + savedTicket.getId() + " has been assigned to you.",
                NotificationType.TICKET_ASSIGNED,
                savedTicket.getId()
        );

        logActivity("TICKET_ASSIGNED", "Assigned ticket #" + savedTicket.getId() + " to " + technician.getFullName());

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ticket.setStatus(request.getStatus());
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        Ticket savedTicket = ticketRepository.save(ticket);

        notificationService.createNotification(
                savedTicket.getUser(),
                "Your ticket #" + savedTicket.getId() + " status has been updated to " + savedTicket.getStatus(),
                NotificationType.TICKET_STATUS_UPDATED,
                savedTicket.getId()
        );

        logActivity("TICKET_STATUS_UPDATED", "Updated ticket #" + savedTicket.getId() + " status to " + savedTicket.getStatus());

        return mapToResponse(savedTicket);
    }

    @Override
    public List<TicketResponse> getAssignedTickets(String technicianEmail) {
        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        return ticketRepository.findByTechnicianId(tech.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponse updateTechnicianStatus(Long ticketId, TicketStatusUpdateRequest request, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (ticket.getTechnician() == null || !ticket.getTechnician().getId().equals(tech.getId())) {
            throw new BadRequestException("You can only update tickets assigned to you.");
        }

        ticket.setStatus(request.getStatus());
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        Ticket savedTicket = ticketRepository.save(ticket);

        notificationService.createNotification(
                savedTicket.getUser(),
                "Technician updated ticket #" + savedTicket.getId() + " to " + savedTicket.getStatus(),
                NotificationType.TICKET_STATUS_UPDATED,
                savedTicket.getId()
        );

        logActivity("TICKET_TECH_UPDATE", "Technician updated ticket #" + savedTicket.getId() + " status to " + savedTicket.getStatus());

        return mapToResponse(savedTicket);
    }

    @Override
    public com.smartcampus.hub.dto.response.TechnicianStatsResponse getTechnicianStats(String technicianEmail) {
        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        
        long pending = ticketRepository.countByTechnicianIdAndStatus(tech.getId(), TicketStatus.OPEN);
        long inProgress = ticketRepository.countByTechnicianIdAndStatus(tech.getId(), TicketStatus.IN_PROGRESS);
        long completed = ticketRepository.countByTechnicianIdAndStatus(tech.getId(), TicketStatus.RESOLVED);
        long total = ticketRepository.countByTechnicianId(tech.getId());

        return com.smartcampus.hub.dto.response.TechnicianStatsResponse.builder()
                .pendingCount(pending)
                .inProgressCount(inProgress)
                .completedCount(completed)
                .totalAssigned(total)
                .build();
    }

    private void logActivity(String action, String details) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
            userRepository.findByEmail(email).ifPresent(user -> activityLogService.log(user, action, details));
        }
    }

    private void saveAttachments(Ticket ticket, List<MultipartFile> files) {
        try {
            Path root = Paths.get(UPLOAD_DIR);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String originalFileName = file.getOriginalFilename();
                String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String fileName = UUID.randomUUID().toString() + fileExtension;
                Files.copy(file.getInputStream(), root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

                TicketAttachment attachment = TicketAttachment.builder()
                        .ticket(ticket)
                        .fileName(originalFileName)
                        .filePath(UPLOAD_DIR + "/" + fileName)
                        .build();
                attachmentRepository.save(attachment);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not store files. Error: " + e.getMessage());
        }
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .userId(ticket.getUser().getId())
                .userName(ticket.getUser().getFullName())
                .userEmail(ticket.getUser().getEmail())
                .resourceId(ticket.getResource() != null ? ticket.getResource().getId() : null)
                .resourceName(ticket.getResource() != null ? ticket.getResource().getName() : null)
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .preferredContact(ticket.getPreferredContact())
                .status(ticket.getStatus())
                .technicianId(ticket.getTechnician() != null ? ticket.getTechnician().getId() : null)
                .technicianName(ticket.getTechnician() != null ? ticket.getTechnician().getFullName() : null)
                .resolutionNotes(ticket.getResolutionNotes())
                .attachments(ticket.getAttachments().stream()
                        .map(a -> TicketResponse.AttachmentResponse.builder()
                                .id(a.getId())
                                .fileName(a.getFileName())
                                .filePath(a.getFilePath())
                                .build())
                        .collect(Collectors.toList()))
                .comments(ticket.getComments().stream()
                        .map(this::mapToCommentResponse)
                        .collect(Collectors.toList()))
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private TicketCommentResponse mapToCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .commentText(comment.getCommentText())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
