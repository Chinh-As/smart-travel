package com.smarttravel.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Request body for POST /auth/verify-otp */
public record VerifyOtpRequest(

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "OTP không được để trống")
        @Pattern(regexp = "\\d{6}", message = "OTP phải là 6 chữ số")
        String otp

) {}
