package com.smartcampus.hub.dto.request;

import com.smartcampus.hub.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {
    private TicketStatus status;
    private String resolutionNotes;
}
