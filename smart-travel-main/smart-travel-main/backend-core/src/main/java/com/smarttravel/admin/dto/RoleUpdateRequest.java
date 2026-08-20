package com.smarttravel.admin.dto;

import com.smarttravel.common.enums.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(
        @NotNull(message = "Role cannot be null")
        Role role
) {
}
