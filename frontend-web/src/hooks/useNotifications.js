import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/notifications?size=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.content || []);
      }
      
      // Fetch unread count
      const countRes = await fetch(
        `${API_BASE_URL}/api/v1/admin/notifications/unread-count`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.unread || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      if (response.ok) {
        fetchNotifications(); // Refresh
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/notifications/read-all`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        }
      );
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, loading };
};
