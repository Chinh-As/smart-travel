package com.smarttravel.auth.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.smarttravel.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Stores OTP hashes and reset tokens for the forgot-password flow.
 *
 * <p>Lifecycle:
 * <ol>
 *   <li>POST /auth/forgot-password  → row created with {@code otpHash}, {@code resetToken=null}</li>
 *   <li>POST /auth/verify-otp       → {@code resetToken} filled in after OTP match</li>
 *   <li>POST /auth/reset-password   → {@code used=true} after password change</li>
 * </ol>
 */
@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** BCrypt hash of the 6-digit numeric OTP sent by email. */
    @Column(name = "otp_hash")
    private String otpHash;

    /** Secure random token returned to the client after OTP verification. */
    @Column(name = "reset_token", unique = true)
    private String resetToken;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean used = false;

    @Builder.Default
    @Column(nullable = false)
    private Integer attempts = 0;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
