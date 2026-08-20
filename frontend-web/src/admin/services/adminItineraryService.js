import { getAccessToken } from '../../context/AuthContext.jsx';
import { CORE_API_URL } from '../../services/apiConfig.js';

const API_BASE_URL = CORE_API_URL;

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const adminItineraryService = {
  getItineraries: async (keyword = '', page = 0, size = 10) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/itineraries?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể lấy danh sách lịch trình');
    return await res.json();
  },
  getItineraryDetails: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/itineraries/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể lấy chi tiết lịch trình');
    return await res.json();
  }
};
