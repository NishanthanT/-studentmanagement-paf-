package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.request.CreateTechnicianRequest;
import com.smartcampus.hub.dto.request.UpdateProfileRequest;
import com.smartcampus.hub.dto.request.UpdateUserRoleRequest;
import com.smartcampus.hub.dto.request.UpdateUserStatusRequest;
import com.smartcampus.hub.dto.response.UserProfileResponse;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.AuthProvider;
import com.smartcampus.hub.enums.Role;
import com.smartcampus.hub.exception.BadRequestException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.ActivityLogRepository;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.UserService;
import com.smartcampus.hub.service.EmailService;
import jakarta.persistence.EntityManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.hub.dto.response.*;
import com.smartcampus.hub.entity.ActivityLog;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Ticket;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EntityManager entityManager;

    public UserServiceImpl(UserRepository userRepository, ActivityLogRepository activityLogRepository, 
                           BookingRepository bookingRepository, TicketRepository ticketRepository,
                           PasswordEncoder passwordEncoder, EmailService emailService, EntityManager entityManager) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.entityManager = entityManager;
    }

    @Override
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public UserDetailedProfileResponse getUserDetailedProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileResponse profileResponse = mapToResponse(user);

        List<TicketResponse> tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(10) // Only latest 10
                .map(this::mapTicket)
                .collect(Collectors.toList());

        List<BookingResponse> bookings = bookingRepository.findByUserIdOrderByDateDesc(userId)
                .stream()
                .limit(10)
                .map(this::mapBooking)
                .collect(Collectors.toList());

        List<ActivityLogResponse> activityLogs = activityLogRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .limit(20)
                .map(log -> ActivityLogResponse.builder()
                        .id(log.getId())
                        .action(log.getAction())
                        .details(log.getDetails())
                        .timestamp(log.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return UserDetailedProfileResponse.builder()
                .profile(profileResponse)
                .recentTickets(tickets)
                .recentBookings(bookings)
                .activityLogs(activityLogs)
                .build();
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        user = userRepository.save(user);

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void createTechnician(CreateTechnicianRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Error: Email is already registered!");
        }

        User technician = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.TECHNICIAN)
                .provider(AuthProvider.LOCAL)
                .status(AccountStatus.ACTIVE)
                .build();

        userRepository.save(technician);
    }

    @Override
    @Transactional
    public void updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(request.getRole());
        userRepository.save(user);

        emailService.sendEmail(user.getEmail(), 
            "Smart Campus Hub - Role Updated", 
            "Hello " + user.getFullName() + ",\n\nYour account role has been updated by an Administrator to: " + request.getRole().name() + ".\n\nRegards,\nSmart Campus Operations Hub");
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(request.getStatus());
        userRepository.save(user);

        emailService.sendEmail(user.getEmail(), 
            "Smart Campus Hub - Account Status Updated", 
            "Hello " + user.getFullName() + ",\n\nYour account status has been updated by an Administrator to: " + request.getStatus().name() + ".\n\nRegards,\nSmart Campus Operations Hub");
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserProfileResponse> searchUsers(String searchTerm, Role role, AccountStatus status) {
        if (searchTerm != null && searchTerm.trim().isEmpty()) {
            searchTerm = null;
        }
        return userRepository.searchUsers(searchTerm, role, status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String currentAdminEmail, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new BadRequestException("Action denied. You cannot delete your own active Admin session account.");
        }
        
        // Remove foreign key dependencies associated with user specifically the user's activity logs
        activityLogRepository.deleteByUserId(userId);
        
        // Dynamically purge other extensive cascading entities to prevent FK Constraint exceptions 
        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :id").setParameter("id", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM bookings WHERE user_id = :id").setParameter("id", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM ticket_comments WHERE user_id = :id").setParameter("id", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM password_reset_otp WHERE email = :email").setParameter("email", user.getEmail()).executeUpdate();
        
        // Nullify assignment for any Technician user
        entityManager.createNativeQuery("UPDATE tickets SET technician_id = NULL WHERE technician_id = :id").setParameter("id", userId).executeUpdate();
        
        // Force drop attachments and comments of any tickets OWNED by the user, then drop the tickets themselves
        entityManager.createNativeQuery("DELETE FROM ticket_attachments WHERE ticket_id IN (SELECT id FROM tickets WHERE user_id = :id)").setParameter("id", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM ticket_comments WHERE ticket_id IN (SELECT id FROM tickets WHERE user_id = :id)").setParameter("id", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tickets WHERE user_id = :id").setParameter("id", userId).executeUpdate();
        
        userRepository.delete(user);
        
        String customReason = (reason != null && !reason.trim().isEmpty()) ? reason : "Violation of operational security and compliance.";

        emailService.sendEmail(user.getEmail(), 
            "Smart Campus Hub - Account Deleted", 
            "Hello " + user.getFullName() + ",\n\nYour account has been officially deleted from the Smart Campus Operations Hub by an Administrator.\n\nReason for deletion: " + customReason + "\n\nRegards,\nSmart Campus Team");
    }

    @Override
    public byte[] exportUsersToPdf(String searchTerm, Role role, AccountStatus status) {
        List<User> users = userRepository.searchUsers(
            searchTerm != null && !searchTerm.trim().isEmpty() ? searchTerm : null, 
            role, 
            status
        );
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();
            
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph title = new Paragraph("Smart Campus Hub - Users Operations Report", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));
            
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{1.0f, 3.5f, 4.0f, 2.0f, 2.0f, 1.5f});
            
            String[] headers = {"ID", "Name", "Email", "Phone", "Role", "Status"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell();
                cell.setBackgroundColor(java.awt.Color.DARK_GRAY);
                cell.setPadding(6);
                Font font = FontFactory.getFont(FontFactory.HELVETICA);
                font.setColor(java.awt.Color.WHITE);
                cell.setPhrase(new Phrase(header, font));
                table.addCell(cell);
            }
            
            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA);
            rowFont.setSize(10);
            for (User u : users) {
                table.addCell(new Phrase(String.valueOf(u.getId()), rowFont));
                table.addCell(new Phrase(u.getFullName(), rowFont));
                table.addCell(new Phrase(u.getEmail(), rowFont));
                table.addCell(new Phrase(u.getPhoneNumber() != null ? u.getPhoneNumber() : "N/A", rowFont));
                table.addCell(new Phrase(u.getRole().name(), rowFont));
                table.addCell(new Phrase(u.getStatus().name(), rowFont));
            }
            
            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new BadRequestException("Failed to mathematically render PDF ByteArray grid.");
        }
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private TicketResponse mapTicket(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .category(ticket.getCategory())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .build(); // Using partial mapping to avoid heavy load on Drawer
    }

    private BookingResponse mapBooking(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceName(booking.getResource() != null ? booking.getResource().getName() : "Unknown")
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build(); // Partial mapping
    }
}
