-- Password reset tokens table
-- Stores OTP codes and short-lived reset tokens for the forgot-password flow.
--
-- Flow:
--   1. POST /auth/forgot-password  → generates OTP, stores otp_hash here
--   2. POST /auth/verify-otp       → validates OTP, generates reset_token
--   3. POST /auth/reset-password   → validates reset_token, changes password, marks used=true

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash    VARCHAR(255),                  -- BCrypt hash of the 6-digit OTP
    reset_token VARCHAR(255) UNIQUE,           -- secure random token returned after OTP verified
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_user_id    ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_reset_token ON password_reset_tokens(reset_token);
