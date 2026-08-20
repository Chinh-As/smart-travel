import { getAccessToken } from './authApi.js';
import { CORE_API_URL } from './apiConfig.js';

const API_BASE = CORE_API_URL;

const getHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const itineraryService = {
  getGenerateCandidates: async ({ keyword = '', size = 10 } = {}) => {
    const params = new URLSearchParams({ size: String(size) });
    if (keyword) params.set('keyword', keyword);
    const res = await fetch(`${API_BASE}/api/v1/places/search?${params}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Lỗi tải địa điểm cho lịch trình (${res.status})`);
    }
    const data = await res.json();
    return data.content || [];
  },

  generateItinerary: async (payload) => {
    const res = await fetch(`${API_BASE}/api/v1/itineraries/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Lỗi tạo lịch trình (${res.status})`);
    }
    return res.json();
  },

  getUserItineraries: async () => {
    const res = await fetch(`${API_BASE}/api/v1/itineraries`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Lỗi tải lịch trình (${res.status})`);
    }
    return res.json();
  },

  saveItinerary: async (payload) => {
    const res = await fetch(`${API_BASE}/api/v1/itineraries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Lỗi lưu lịch trình (${res.status})`);
    }
    return res.json();
  },

  updateItinerary: async (id, payload) => {
    const res = await fetch(`${API_BASE}/api/v1/itineraries/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Lỗi cập nhật lịch trình (${res.status})`);
    }
    return res.json();
  },

  deleteItinerary: async (id) => {
    const res = await fetch(`${API_BASE}/api/v1/itineraries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Lỗi xóa lịch trình (${res.status})`);
    }
    return true;
  }
};
