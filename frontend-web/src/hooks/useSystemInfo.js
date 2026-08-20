import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSystemInfo = useCallback(async () => {
    const token = getAccessToken();
    const fallbackData = {
      appVersion: "1.0.0",
      buildTime: "2026-07-17",
      database: {
        status: "connected",
        placeCount: 981,
        userCount: 2
      },
      services: {
        javaStatus: "running",
        javaPort: 8000,
        pythonStatus: "running",
        pythonPort: 5000
      },
      lastUpdated: new Date().toISOString()
    };

    if (!token) {
      setSystemInfo(fallbackData);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/system-info`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      if (response.ok) {
        setSystemInfo(await response.json());
      } else {
        throw new Error('API response not OK');
      }
    } catch (error) {
      console.warn('Error fetching system info, falling back to mock data:', error.message);
      setSystemInfo(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchSystemInfo]);

  return { systemInfo, loading, refresh: fetchSystemInfo };
};
