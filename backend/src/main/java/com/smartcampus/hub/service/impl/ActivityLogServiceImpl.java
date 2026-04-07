package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.entity.ActivityLog;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.repository.ActivityLogRepository;
import com.smartcampus.hub.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional
    public void log(User user, String action, String details) {
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .build();
        activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
