package com.smarttravel.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ItineraryAdminResponse(
        UUID id,
        UUID userId,
        String userEmail,
        OffsetDateTime createdAt,
        String status,
        int slotCount
) {}
