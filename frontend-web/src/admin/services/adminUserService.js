import { mockUsers } from '../mock/mockUsers';
import { getAccessToken } from '../../context/AuthContext.jsx';
import { CORE_API_URL } from '../../services/apiConfig.js';

let memoryUsers = [...mockUsers];

const API_BASE_URL = CORE_API_URL;

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const adminUserService = {
  getAllUsers: async (keyword = '', page = 0, size = 10) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/users?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể lấy danh sách người dùng');
    return await res.json();
  },

  updateUserStatus: async (id, active) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ active })
    });
    if (!res.ok) throw new Error('Không thể cập nhật trạng thái người dùng');
    return true;
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return await res.json(); // { totalPlaces, totalUsers, totalItineraries, totalFavorites }
  },

  updateUserRole: async (id, role) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Không thể cập nhật quyền người dùng');
    return true;
  }
};
