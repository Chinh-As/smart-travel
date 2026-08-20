package com.smarttravel.auth.dto;

/**
 * Response returned after successful OTP verification.
 * The {@code resetToken} is short-lived and must be sent back in /auth/reset-password.
 */
public record VerifyOtpResponse(String resetToken) {}
