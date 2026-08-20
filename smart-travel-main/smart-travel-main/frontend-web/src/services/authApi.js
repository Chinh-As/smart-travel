/**
 * authApi.js — Service layer for Smart Travel Backend Core API
 *
 * Handles:
 *  - Authentication: login, register, refresh, logout
 *  - User Profile: getMyProfile, updateMyProfile
 *
 * Base URL: VITE_BACKEND_URL (defaults to http://localhost:8000)
 *
 * Token strategy:
 *  - Access token stored in memory (module-level variable) → not in localStorage
 *    to mitigate XSS risks on sensitive token.
 *  - Refresh token is HttpOnly cookie managed by backend automatically.
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// In-memory access token store (cleared on page reload — intentional)
// ---------------------------------------------------------------------------
let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include', // include cookies for refresh token
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errorMsg = errBody.message || errBody.error || errorMsg;
      } catch (_) {
        // ignore json parse errors on error body
      }
      const err = new Error(errorMsg);
      err.status = response.status;
      throw err;
    }

    // 204 No Content
    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

/**
 * Register a new account.
 * @param {{ name: string, email: string, password: string }} data
 * @returns AuthResponse { accessToken, tokenType, userId, name, email, role }
 */
export async function apiRegister({ name, email, password }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

/**
 * Login with email + password.
 * @param {{ email: string, password: string }} credentials
 * @returns AuthResponse
 */
export async function apiLogin({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

/**
 * Refresh access token using HttpOnly refresh cookie.
 * @returns AuthResponse with new accessToken
 */
export async function apiRefreshToken() {
  const data = await apiFetch('/auth/refresh', { method: 'POST' });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

/**
 * Logout — clears server-side refresh token and cookie.
 */
export async function apiLogout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}

// ---------------------------------------------------------------------------
// User Profile API
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/users/me — Returns the current user's full profile.
 * Requires a valid access token (set via setAccessToken after login).
 *
 * @returns {Promise<UserProfile>} { id, name, username, email, phone, bio, hasCompletedOnboarding, createdAt }
 */
export async function apiGetMyProfile() {
  return apiFetch('/api/v1/users/me');
}

/**
 * PUT /api/v1/users/me — Partially updates the current user's profile.
 * Only non-null fields in the payload are applied by the backend.
 *
 * @param {{ name?: string, username?: string, email?: string, phone?: string, bio?: string }} updates
 * @returns {Promise<UserProfile>} Updated profile
 */
export async function apiUpdateMyProfile(updates) {
  // Remove undefined keys so we only send fields the caller explicitly provides
  const payload = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  );
  return apiFetch('/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * PUT /api/v1/users/me/preferences — Saves onboarding interests + budget tier.
 * Marks the user's onboarding as completed on the backend.
 *
 * @param {{ interests: string[], budget: 'save'|'mid'|'high' }} payload
 * @returns {Promise<{ interests: string[], budget: string }>}
 */
export async function apiUpdateMyPreferences({ interests, budget }) {
  return apiFetch('/api/v1/users/me/preferences', {
    method: 'PUT',
    body: JSON.stringify({ interests, budget }),
  });
}

// ---------------------------------------------------------------------------
// Change Password API (authenticated)
// ---------------------------------------------------------------------------

/**
 * PUT /api/v1/users/me/password
 * Changes the current user's password.
 * Requires a valid access token.
 *
 * @param {{ oldPassword: string, newPassword: string }} payload
 * @returns {Promise<null>} 204 No Content on success
 * @throws on wrong old password or validation errors
 */
export async function apiChangePassword({ oldPassword, newPassword }) {
  return apiFetch('/api/v1/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

// ---------------------------------------------------------------------------
// Forgot Password — 3-step flow
// ---------------------------------------------------------------------------

/**
 * POST /auth/forgot-password
 * Triggers OTP email to the given address.
 * Always resolves (never throws on unknown email — server hides that).
 *
 * @param {string} email
 */
export async function apiForgotPassword(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /auth/verify-otp
 * Validates the 6-digit OTP.
 *
 * @param {{ email: string, otp: string }} payload
 * @returns {{ resetToken: string }} resetToken to use in step 3
 * @throws if OTP is wrong or expired
 */
export async function apiVerifyOtp({ email, otp }) {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

/**
 * POST /auth/reset-password
 * Sets a new password using the resetToken from step 2.
 *
 * @param {{ resetToken: string, newPassword: string }} payload
 * @returns {Promise<null>} 204 No Content on success
 * @throws if resetToken is invalid/expired
 */
export async function apiResetPassword({ resetToken, newPassword }) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword }),
  });
}
