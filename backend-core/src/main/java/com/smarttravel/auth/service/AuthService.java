package com.smarttravel.auth.service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttravel.auth.dto.AuthResponse;
import com.smarttravel.auth.dto.AuthResult;
import com.smarttravel.auth.dto.ChangePasswordRequest;
import com.smarttravel.auth.dto.ForgotPasswordRequest;
import com.smarttravel.auth.dto.LoginRequest;
import com.smarttravel.auth.dto.RegisterRequest;
import com.smarttravel.auth.dto.ResetPasswordRequest;
import com.smarttravel.auth.dto.VerifyOtpRequest;
import com.smarttravel.auth.dto.VerifyOtpResponse;
import com.smarttravel.auth.entity.PasswordResetToken;
import com.smarttravel.auth.entity.RefreshToken;
import com.smarttravel.auth.entity.UserAuth;
import com.smarttravel.auth.enums.AuthProvider;
import com.smarttravel.auth.repository.PasswordResetTokenRepository;
import com.smarttravel.auth.repository.RefreshTokenRepository;
import com.smarttravel.auth.repository.UserAuthRepository;
import com.smarttravel.common.enums.Role;
import com.smarttravel.common.exception.BadRequestException;
import com.smarttravel.common.service.EmailService;
import com.smarttravel.user.entity.User;
import com.smarttravel.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    @Value("${app.otp.request-cooldown-seconds}")
    private int otpRequestCooldownSeconds;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // =========================================================================
    // Register / Login / Refresh / Logout (unchanged)
    // =========================================================================

    @Transactional
    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }

        User user = userRepository.save(User.builder()
                .email(request.email())
                .name(request.name())
                .build());

        userAuthRepository.save(UserAuth.builder()
                .user(user)
                .passwordHash(passwordEncoder.encode(request.password()))
                .authProvider(AuthProvider.LOCAL)
                .role(Role.USER)
                .build());

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), Role.USER.name());
        String refreshToken = createRefreshToken(user);

        AuthResponse response = new AuthResponse(accessToken, user.getId(), user.getName(), user.getEmail(), Role.USER);
        return new AuthResult(response, refreshToken);
    }

    @Transactional
    public AuthResult login(LoginRequest request) {
        UserAuth userAuth = userAuthRepository.findByUserEmailWithUser(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), userAuth.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userAuth.getUser();
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), userAuth.getRole().name());
        String refreshToken = createRefreshToken(user);

        AuthResponse response = new AuthResponse(accessToken, user.getId(), user.getName(), user.getEmail(), userAuth.getRole());
        return new AuthResult(response, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (stored.getRevoked() || stored.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Refresh token expired or revoked");
        }

        User user = stored.getUser();
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }
        UserAuth userAuth = userAuthRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("User auth not found"));

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), userAuth.getRole().name());
        return new AuthResponse(newAccessToken, user.getId(), user.getName(), user.getEmail(), userAuth.getRole());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    // =========================================================================
    // Change Password (authenticated user)
    // =========================================================================

    /**
     * Changes the password of an authenticated user.
     * Verifies the old password before applying the new one.
     *
     * @param userId  UUID from JWT principal
     * @param request { oldPassword, newPassword }
     * @throws BadRequestException if oldPassword doesn't match or user has no local auth
     */
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        UserAuth userAuth = userAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin xác thực"));

        if (!AuthProvider.LOCAL.equals(userAuth.getAuthProvider())) {
            throw new BadRequestException("Tài khoản mạng xã hội không thể đổi mật khẩu tại đây");
        }

        if (!passwordEncoder.matches(request.oldPassword(), userAuth.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }

        if (passwordEncoder.matches(request.newPassword(), userAuth.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        userAuth.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userAuthRepository.save(userAuth);

        // Revoke all existing refresh tokens to force re-login on all devices
        refreshTokenRepository.revokeAllByUserId(userId);

        // Invalidate any pending OTP / reset tokens for this user.
        // Prevents a resetToken (obtained before this change) from overwriting the new password.
        passwordResetTokenRepository.invalidateAllForUser(userId);

        log.info("Password changed for userId={}", userId);
    }

    // =========================================================================
    // Forgot Password — Step 1: send OTP
    // =========================================================================

    /**
     * Generates a 6-digit OTP, stores its bcrypt hash in DB, and emails it.
     * If the email doesn't exist, returns silently (no user enumeration).
     *
     * @param request { email }
     */
    @Transactional
    public void sendForgotPasswordOtp(ForgotPasswordRequest request) {
        String email = request.email().toLowerCase().trim();

        userRepository.findByEmail(email).ifPresent(user -> {
            if (Boolean.FALSE.equals(user.getIsActive())) {
                return; // Silently ignore if user is inactive/banned
            }

            // Rate limit: reject if last request was within the cooldown window
            if (user.getLastOtpRequestedAt() != null &&
                    user.getLastOtpRequestedAt().isAfter(
                            OffsetDateTime.now().minusSeconds(otpRequestCooldownSeconds))) {
                // Still return silently — no user enumeration
                log.warn("OTP request rate-limited for email={}", email);
                return;
            }

            // Invalidate any previous pending tokens for this user
            passwordResetTokenRepository.invalidateAllForUser(user.getId());

            // Generate 6-digit OTP
            String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
            String otpHash = passwordEncoder.encode(otp);

            // Persist
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .otpHash(otpHash)
                    .expiresAt(OffsetDateTime.now().plusMinutes(otpExpiryMinutes))
                    .build());

            // Update the timestamp so subsequent requests within cooldown are rejected
            user.setLastOtpRequestedAt(OffsetDateTime.now());
            userRepository.save(user);

            // Send email (async — won't block response)
            emailService.sendOtpEmail(email, otp);
            log.info("OTP issued for email={}", email);
        });
        // Always return 200 even if email not found or rate-limited — prevents user enumeration
    }

    // =========================================================================
    // Forgot Password — Step 2: verify OTP → return resetToken
    // =========================================================================

    /**
     * Verifies the OTP submitted by the user.
     * On success, generates a single-use reset token and returns it.
     *
     * @param request { email, otp }
     * @return VerifyOtpResponse containing the resetToken
     * @throws BadRequestException on invalid/expired OTP
     */
    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.email().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("OTP không hợp lệ hoặc đã hết hạn"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }

        PasswordResetToken token = passwordResetTokenRepository
                .findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new BadRequestException("OTP không hợp lệ hoặc đã hết hạn"));

        if (token.getAttempts() >= 5) {
            token.setUsed(true);
            passwordResetTokenRepository.save(token);
            throw new BadRequestException("Bạn đã nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới.");
        }

        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("OTP đã hết hạn. Vui lòng yêu cầu mã mới");
        }

        if (!passwordEncoder.matches(request.otp(), token.getOtpHash())) {
            token.setAttempts(token.getAttempts() + 1);
            passwordResetTokenRepository.save(token);
            throw new BadRequestException("OTP không đúng");
        }

        // OTP valid — generate a single-use reset token (UUID + random suffix)
        String resetToken = UUID.randomUUID().toString() + "-" + SECURE_RANDOM.nextLong(Long.MAX_VALUE);
        token.setResetToken(resetToken);
        // Keep used=false until password is actually reset
        // Extend expiry by 10 more minutes for the reset step
        token.setExpiresAt(OffsetDateTime.now().plusMinutes(10));
        passwordResetTokenRepository.save(token);

        log.info("OTP verified for email={}", email);
        return new VerifyOtpResponse(resetToken);
    }

    // =========================================================================
    // Forgot Password — Step 3: reset password
    // =========================================================================

    /**
     * Sets a new password using the resetToken obtained after OTP verification.
     *
     * @param request { resetToken, newPassword }
     * @throws BadRequestException on invalid/expired/already-used resetToken
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository
                .findByResetTokenAndUsedFalse(request.resetToken())
                .orElseThrow(() -> new BadRequestException("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng"));

        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng bắt đầu lại");
        }

        User user = token.getUser();
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }

        UserAuth userAuth = userAuthRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin xác thực"));

        if (passwordEncoder.matches(request.newPassword(), userAuth.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        userAuth.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userAuthRepository.save(userAuth);

        // Mark token as used
        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        // Revoke all existing refresh tokens to force re-login on all devices
        refreshTokenRepository.revokeAllByUserId(user.getId());

        log.info("Password reset completed for userId={}", user.getId());
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(OffsetDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .build());
        return token;
    }
}
