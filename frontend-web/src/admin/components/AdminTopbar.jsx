import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getAccessToken } from '../../context/AuthContext.jsx';
import { NotificationDropdown } from './NotificationDropdown/NotificationDropdown';
import { SystemInfoModal } from './SystemInfoModal/SystemInfoModal';

const AdminTopbar = ({ toggleSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [siteName, setSiteName] = useState('Smart Travel');

  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=006b5f&color=fff&bold=true`;

  const [dbStatus, setDbStatus] = useState('checking');
  const [aiStatus, setAiStatus] = useState('checking');

  useEffect(() => {
    const updateSettings = () => {
      const saved = localStorage.getItem('admin_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.siteName) {
            setSiteName(parsed.siteName);
          }
          if (parsed.darkMode) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    updateSettings();
    window.addEventListener('adminSettingsChanged', updateSettings);
    return () => {
      window.removeEventListener('adminSettingsChanged', updateSettings);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkServices = async () => {
      // 1. Check AI Health
      try {
        const res = await fetch('http://localhost:5000/health', { method: 'GET' });
        if (res.ok) {
          setAiStatus('ok');
        } else {
          setAiStatus('error');
        }
      } catch (e) {
        setAiStatus('error');
      }

      // 2. Check Database & Core Health via stats
      try {
        const token = getAccessToken();
        const res = await fetch('http://localhost:8000/api/v1/admin/stats', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          setDbStatus('ok');
        } else {
          setDbStatus('error');
        }
      } catch (e) {
        setDbStatus('error');
      }
    };

    checkServices();
    const interval = setInterval(checkServices, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (dropdownName) => {
    setOpenDropdown(prev => prev === dropdownName ? null : dropdownName);
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '640px', flex: 1 }}>
        <button className="admin-toggle-btn" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="admin-status-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Core System */}
          <div className="status-indicator-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,107,95,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(0,107,95,0.12)', whiteSpace: 'nowrap' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dbStatus === 'ok' ? '#16a34a' : dbStatus === 'checking' ? '#f59e0b' : '#ba1a1a', boxShadow: dbStatus === 'ok' ? '0 0 8px #16a34a' : dbStatus === 'checking' ? '0 0 8px #f59e0b' : '0 0 8px #ba1a1a', transition: 'all 0.3s' }}></span>
            <span style={{ color: 'var(--color-on-surface)', fontWeight: 500, fontSize: '12px' }}>
              Database & Core: {dbStatus === 'ok' ? 'Kết nối tốt' : dbStatus === 'checking' ? 'Đang kiểm tra...' : 'Không phản hồi'}
            </span>
          </div>

          {/* AI Engine */}
          <div className="status-indicator-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,166,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(20,184,166,0.12)', whiteSpace: 'nowrap' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: aiStatus === 'ok' ? '#16a34a' : aiStatus === 'checking' ? '#f59e0b' : '#ba1a1a', boxShadow: aiStatus === 'ok' ? '0 0 8px #16a34a' : aiStatus === 'checking' ? '0 0 8px #f59e0b' : '0 0 8px #ba1a1a', transition: 'all 0.3s' }}></span>
            <span style={{ color: 'var(--color-on-surface)', fontWeight: 500, fontSize: '12px' }}>
              AI Engine (FastAPI): {aiStatus === 'ok' ? 'Hoạt động' : aiStatus === 'checking' ? 'Đang kiểm tra...' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="admin-topbar-right" ref={dropdownRef}>
        
        {/* Notifications */}
        <NotificationDropdown />
        
        {/* System Info */}
        <SystemInfoModal />
        
        <div className="admin-topbar-divider"></div>
        
        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button className="admin-profile-btn" onClick={() => handleToggle('profile')}>
            <div style={{ position: 'relative', display: 'flex' }}>
              <img 
                src={avatarUrl} 
                alt="Admin" 
                className="admin-profile-avatar" 
                style={{ border: '2px solid var(--color-primary)', display: 'block' }}
              />
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: 'var(--color-secondary, #ba0036)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '1px 3px', borderRadius: '4px', border: '1px solid white', textTransform: 'uppercase', lineHeight: 1 }}>
                Admin
              </span>
            </div>
            <span className="material-symbols-outlined admin-profile-dropdown-icon">expand_more</span>
          </button>
          
          {openDropdown === 'profile' && (
            <div className="admin-dropdown" style={{ right: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(187, 202, 198, 0.2)' }}>
                <div style={{ fontWeight: 600 }}>{user?.name || 'Quản trị viên'}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>{user?.email || 'admin@smarttravel.vn'}</div>
              </div>
              <div className="admin-dropdown-item" onClick={() => { setOpenDropdown(null); navigate('/admin/profile'); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                Hồ sơ cá nhân
              </div>
              <div className="admin-dropdown-item" onClick={() => { setOpenDropdown(null); navigate('/admin/settings'); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                Cài đặt hệ thống
              </div>
              <div className="admin-dropdown-item" onClick={() => { setOpenDropdown(null); navigate('/'); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home</span>
                Về trang chủ
              </div>
              <div className="admin-dropdown-divider"></div>
              <div className="admin-dropdown-item" style={{ color: 'var(--color-error)' }} onClick={async () => { setOpenDropdown(null); await logout(); navigate('/'); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                Đăng xuất
              </div>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};

export default AdminTopbar;
