package com.smarttravel.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.smarttravel.common.enums.Role;

public record UserAdminResponse(
        UUID id,
        String email,
        String name,
        Role role,
        OffsetDateTime createdAt,
        Boolean isActive
) {}
