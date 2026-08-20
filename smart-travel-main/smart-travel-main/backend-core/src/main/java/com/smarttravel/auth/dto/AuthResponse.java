package com.smarttravel.auth.dto;

import java.util.UUID;

import com.smarttravel.common.enums.Role;

public record AuthResponse(

        String accessToken,
        String tokenType,
        UUID userId,
        String name,
        String email,
        Role role

) {
    public AuthResponse(String accessToken, UUID userId, String name, String email, Role role) {
        this(accessToken, "Bearer", userId, name, email, role);
    }
}
