-- Adds attempt counter to prevent OTP brute-force.
-- Incremented on each failed OTP check in AuthService.verifyOtp();
-- token is force-invalidated (used=true) once attempts >= 5,
-- forcing the user to request a new OTP via /auth/forgot-password.
ALTER TABLE password_reset_tokens
ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
