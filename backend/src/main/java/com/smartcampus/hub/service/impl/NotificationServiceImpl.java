package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.response.NotificationResponse;
import com.smartcampus.hub.entity.Notification;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.NotificationType;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createNotification(User user, String message, NotificationType type, Long targetId) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .targetId(targetId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteAllByUserId(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.deleteByUserId(user.getId());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .targetId(notification.getTargetId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
