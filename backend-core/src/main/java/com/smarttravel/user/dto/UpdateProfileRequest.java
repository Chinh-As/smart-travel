package com.smarttravel.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request body for PUT /api/v1/users/me
 * All fields are optional — only non-null values will be applied.
 */
public record UpdateProfileRequest(

        @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
        String name,

        @Size(max = 50, message = "Username must not exceed 50 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_.-]*$", message = "Username can only contain letters, digits, underscores, hyphens, and dots")
        String username,

        @Email(message = "Invalid email format")
        String email,

        @Pattern(regexp = "^[+]?[0-9\\s\\-().]{7,20}$", message = "Invalid phone number format")
        String phone,

        @Size(max = 500, message = "Bio must not exceed 500 characters")
        String bio

) {}
