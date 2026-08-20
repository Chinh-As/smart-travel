package com.smarttravel.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReviewAdminResponse(
        UUID id,
        String userEmail,
        String placeName,
        Double rating,
        String comment,
        String status,
        OffsetDateTime createdAt
) {}
