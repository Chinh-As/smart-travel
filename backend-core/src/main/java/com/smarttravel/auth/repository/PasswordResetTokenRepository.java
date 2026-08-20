package com.smarttravel.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smarttravel.auth.entity.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    /** Find an active (not used) token by resetToken value. */
    Optional<PasswordResetToken> findByResetTokenAndUsedFalse(String resetToken);

    /**
     * Find the latest active OTP record for a given user (not used, created most recently).
     * Used during OTP verification.
     */
    Optional<PasswordResetToken> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(UUID userId);

    /**
     * Invalidate all previous unused tokens for a user before issuing a new one.
     * Prevents OTP accumulation from repeated forgot-password requests.
     */
    @Modifying
    @Query("UPDATE PasswordResetToken p SET p.used = true WHERE p.user.id = :userId AND p.used = false")
    void invalidateAllForUser(@Param("userId") UUID userId);
}
