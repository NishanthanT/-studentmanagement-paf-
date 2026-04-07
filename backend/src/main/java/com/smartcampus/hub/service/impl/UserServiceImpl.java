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
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.UserService;
import com.smartcampus.hub.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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
    public void deleteUser(Long userId, String currentAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new BadRequestException("Action denied. You cannot delete your own active Admin session account.");
        }
        
        userRepository.delete(user);
        
        emailService.sendEmail(user.getEmail(), 
            "Smart Campus Hub - Account Deleted", 
            "Hello " + user.getFullName() + ",\n\nYour account has been officially deleted from the Smart Campus Operations Hub by an Administrator.\n\nRegards,\nSmart Campus Team");
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
}
