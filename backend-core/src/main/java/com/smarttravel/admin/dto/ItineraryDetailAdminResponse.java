package com.smarttravel.admin.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ItineraryDetailAdminResponse(
        UUID id,
        UUID userId,
        String userEmail,
        OffsetDateTime createdAt,
        String status,
        int slotCount,
        List<ItineraryActivityDetail> activities
) {}
