package com.smartcampus.hub.service;

import com.smartcampus.hub.entity.ActivityLog;
import com.smartcampus.hub.entity.User;

import java.util.List;

public interface ActivityLogService {
    void log(User user, String action, String details);
    List<ActivityLog> getAllLogs();
}
