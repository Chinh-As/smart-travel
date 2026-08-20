/**
 * AuthContext.jsx — Auth + user profile state (connected to real backend)
 *
 * Strategy:
 *  - On login/register: call backend → store accessToken in authApi module,
 *    store user profile in React state.
 *  - On page reload: attempt token refresh (refresh cookie is HttpOnly, sent
 *    automatically). If refresh succeeds, fetch profile; otherwise guest mode.
 *  - updateProfile: calls PUT /api/v1/users/me and updates local state.
 *  - changePassword: placeholder UI — full implementation in future iteration.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiRefreshToken,
  apiGetMyProfile,
  apiUpdateMyProfile,
  apiUpdateMyPreferences,
  apiChangePassword,
  clearAccessToken,
  getAccessToken,
} from '../services/authApi.js';

export { getAccessToken };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // true during initial refresh check
  const initDone = useRef(false);
  const navigate = useNavigate();

  // -----------------------------------------------------------------------
  // On mount: try to restore session via refresh token (HttpOnly cookie)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    (async () => {
      try {
        await apiRefreshToken();
        const profile = await apiGetMyProfile();
        setUser(mapProfile(profile));
        setLoggedIn(true);
      } catch {
        // No valid session — guest mode
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // -----------------------------------------------------------------------
  // Map backend UserProfileResponse → local user object
  // -----------------------------------------------------------------------
  function mapProfile(profile) {
    return {
      id: profile.id,
      fullName: profile.name,
      name: profile.name,
      username: profile.username || '',
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio || '',
      joinedAt: profile.createdAt,
      hasCompletedOnboarding: profile.hasCompletedOnboarding,
      role: profile.role,
    };
  }

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------
  const login = useCallback(async (emailOrCredentials, password) => {
    const credentials =
      typeof emailOrCredentials === 'object'
        ? emailOrCredentials
        : { email: emailOrCredentials, password };

    try {
      const authResp = await apiLogin({
        email: credentials.email,
        password: credentials.password,
      });
      const profile = await apiGetMyProfile();
      const mappedProfile = mapProfile(profile);
      mappedProfile.role = mappedProfile.role || authResp.role;
      setUser(mappedProfile);
      setLoggedIn(true);

      const isAdmin =
        mappedProfile.role === 'ADMIN' || mappedProfile.role === 'ROLE_ADMIN';
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }

      return { ok: true, data: authResp };
    } catch (err) {
      throw new Error(err.message || 'Đăng nhập thất bại');
    }
  }, [navigate]);

  // -----------------------------------------------------------------------
  // Register
  // -----------------------------------------------------------------------
  const register = useCallback(async ({ fullName, email, password }) => {
    try {
      await apiRegister({ name: fullName, email, password });
      const profile = await apiGetMyProfile();
      setUser(mapProfile(profile));
      setLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err.message || 'Đăng ký thất bại' };
    }
  }, []);

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      clearAccessToken();
    }
    setUser(null);
    setLoggedIn(false);
  }, []);

  // -----------------------------------------------------------------------
  // Update Profile — calls PUT /api/v1/users/me
  // -----------------------------------------------------------------------
  const updateProfile = useCallback(async (fields) => {
    // If no access token (e.g. demo mode), just update local state
    if (!getAccessToken()) {
      setUser((prev) => (prev ? { ...prev, ...fields } : prev));
      return { ok: true };
    }

    try {
      // Map frontend field names → backend field names
      const payload = {
        name: fields.fullName ?? fields.name,
        username: fields.username,
        email: fields.email,
        phone: fields.phone,
        bio: fields.bio,
      };
      const updated = await apiUpdateMyProfile(payload);
      setUser(mapProfile(updated));
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: err.message || 'Cập nhật thất bại' };
    }
  }, []);

// -----------------------------------------------------------------------
// Save Onboarding Preferences — calls PUT /api/v1/users/me/preferences
// -----------------------------------------------------------------------
const savePreferences = useCallback(async ({ interests, budget }) => {
  // If no access token (e.g. demo mode), nothing to persist server-side
  if (!getAccessToken()) {
    return { ok: true };
  }

  try {
    await apiUpdateMyPreferences({ interests, budget });
    setUser((prev) => (prev ? { ...prev, hasCompletedOnboarding: true } : prev));
    return { ok: true };
  } catch (err) {
    return { ok: false, msg: err.message || 'Lưu sở thích thất bại' };
  }
}, []);

  // -----------------------------------------------------------------------
  // Change Password — calls PUT /api/v1/users/me/password
  // -----------------------------------------------------------------------
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    // Client-side pre-validation
    if (!oldPassword) return { ok: false, msg: 'Nhập mật khẩu hiện tại' };
    if (!newPassword || newPassword.length < 8)
      return { ok: false, msg: 'Mật khẩu mới tối thiểu 8 ký tự' };

    // Demo mode fallback (no access token)
    if (!getAccessToken()) {
      return { ok: false, msg: 'Bạn đang ở chế độ demo, không thể đổi mật khẩu' };
    }

    try {
      await apiChangePassword({ oldPassword, newPassword });
      return { ok: true, msg: 'Đổi mật khẩu thành công!' };
    } catch (err) {
      return { ok: false, msg: err.message || 'Đổi mật khẩu thất bại' };
    }
  }, []);

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------
  const value = {
    user,
    isLoggedIn,
    authLoading,
    loading: authLoading,
    login,
    register,
    logout,
    updateProfile,
    savePreferences,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
