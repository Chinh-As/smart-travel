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

export const adminReviewService = {
  getAllReviews: async (status = '', keyword = '', page = 0, size = 10) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews?status=${status}&keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể lấy danh sách đánh giá');
    return await res.json();
  },
  
  updateReviewStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Không thể cập nhật trạng thái đánh giá');
    return true;
  }
};
