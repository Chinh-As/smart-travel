import { getAccessToken } from './authApi.js';
import { CORE_API_URL } from './apiConfig.js';

const API_BASE = CORE_API_URL;

const getHeaders = (userId) => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {}),
  };
};

export const favoriteService = {
  getUserFavorites: async (userId) => {
    const res = await fetch(`${API_BASE}/api/favorites`, {
      method: 'GET',
      headers: getHeaders(userId),
    });
    if (!res.ok) {
      throw new Error(`Lỗi tải danh sách yêu thích (${res.status})`);
    }
    return res.json();
  },

  addFavorite: async (userId, placeId) => {
    const res = await fetch(`${API_BASE}/api/favorites`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ placeId }),
    });
    if (!res.ok) {
      // If it's a duplicate (409 or 400), don't throw - treat as success
      if (res.status === 409 || res.status === 400) {
        console.warn('[favoriteService] addFavorite: already exists or bad request', res.status);
        return null;
      }
      throw new Error(`Lỗi thêm yêu thích (${res.status})`);
    }
    return res.json();
  },

  removeFavorite: async (userId, placeId) => {
    const res = await fetch(`${API_BASE}/api/favorites/${placeId}`, {
      method: 'DELETE',
      headers: getHeaders(userId),
    });
    if (!res.ok) {
      // If not found (404), don't throw - treat as already removed
      if (res.status === 404) {
        console.warn('[favoriteService] removeFavorite: not found, already removed');
        return true;
      }
      throw new Error(`Lỗi xóa yêu thích (${res.status})`);
    }
    return true;
  },
};
