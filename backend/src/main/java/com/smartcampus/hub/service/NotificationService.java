package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.response.NotificationResponse;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String message, NotificationType type, Long targetId);
    List<NotificationResponse> getUserNotifications(String userEmail);
    long getUnreadCount(String userEmail);
    void markAsRead(Long id);
    void markAllAsRead(String userEmail);
    void deleteAllByUserId(String userEmail);
}
