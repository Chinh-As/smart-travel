package com.smarttravel.auth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarttravel.auth.dto.AuthResponse;
import com.smarttravel.auth.dto.AuthResult;
import com.smarttravel.auth.dto.ForgotPasswordRequest;
import com.smarttravel.auth.dto.LoginRequest;
import com.smarttravel.auth.dto.RegisterRequest;
import com.smarttravel.auth.dto.ResetPasswordRequest;
import com.smarttravel.auth.dto.VerifyOtpRequest;
import com.smarttravel.auth.dto.VerifyOtpResponse;
import com.smarttravel.auth.service.AuthService;
import com.smarttravel.common.exception.BadRequestException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final AuthService authService;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Value("${app.cookie.secure}")
    private boolean secureCookie;

    // =========================================================================
    // Register / Login / Refresh / Logout
    // =========================================================================

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResult result = authService.register(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshTokenCookie(result.refreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResult result = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshTokenCookie(result.refreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken) {
        if (refreshToken == null) {
            throw new BadRequestException("Refresh token is missing");
        }
        AuthResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, buildClearRefreshTokenCookie().toString())
                .build();
    }

    // =========================================================================
    // Forgot Password — 3-step flow
    // =========================================================================

    /**
     * POST /auth/forgot-password
     * Generates a 6-digit OTP and sends it to the user's email.
     * Always returns 200 (even if email not found) to prevent user enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendForgotPasswordOtp(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /auth/verify-otp
     * Validates the OTP. On success, returns a short-lived resetToken.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        VerifyOtpResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /auth/reset-password
     * Sets a new password using the resetToken from /verify-otp.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Cookie helpers
    // =========================================================================

    /**
     * Tạo HttpOnly cookie chứa refresh token.
     * SameSite=Strict: browser không gửi cookie này trong cross-site request
     * → là lớp bảo vệ CSRF thay thế cho csrf token ở /auth/refresh và /auth/logout.
     * Nếu đổi SameSite sang Lax/None, phải bật lại CSRF protection trong SecurityConfig.
     */
    private ResponseCookie buildRefreshTokenCookie(String token) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(refreshTokenExpirationMs / 1000)
                .build();
    }

    /** Xóa cookie bằng cách set maxAge=0 — browser sẽ xóa ngay lập tức. */
    private ResponseCookie buildClearRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(0)
                .build();
    }
}
