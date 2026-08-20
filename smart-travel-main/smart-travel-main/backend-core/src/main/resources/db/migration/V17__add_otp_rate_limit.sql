-- Adds rate limiting for /auth/forgot-password endpoint.
-- Records the last time a user requested an OTP.
-- AuthService checks this value and rejects requests more frequent
-- than the configured cooldown window (e.g. 1 request per minute per email).
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_otp_requested_at TIMESTAMPTZ;
