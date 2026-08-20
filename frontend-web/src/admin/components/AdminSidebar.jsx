import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { TipsHelpWidget } from './TipsHelpWidget/TipsHelpWidget';

const AdminSidebar = ({ isCollapsed, isMobileOpen, setMobileOpen }) => {
  const [siteName, setSiteName] = useState('Smart Travel');

  useEffect(() => {
    const updateSiteName = () => {
      const saved = localStorage.getItem('admin_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.siteName) {
            setSiteName(parsed.siteName);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    updateSiteName();
    window.addEventListener('adminSettingsChanged', updateSiteName);
    return () => {
      window.removeEventListener('adminSettingsChanged', updateSiteName);
    };
  }, []);

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: 'dashboard', exact: true },
    { name: 'Địa điểm', path: '/admin/destinations', icon: 'explore' },
    { name: 'Lịch trình', path: '/admin/itineraries', icon: 'route' },
    { name: 'Đánh giá', path: '/admin/reviews', icon: 'rate_review' },
    { name: 'Người dùng', path: '/admin/users', icon: 'group' },
    { name: 'Cài đặt', path: '/admin/settings', icon: 'settings' },
  ];

  const sidebarClass = `admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`;

  return (
    <>
      <aside className={sidebarClass}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
              travel_explore
            </span>
            <h1 className="title" style={{ margin: 0 }}>{(!isCollapsed || isMobileOpen) ? `${siteName} Admin` : ''}</h1>
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <p className="subtitle">Hệ thống quản trị du lịch thông minh</p>
          )}
        </div>
        
        <nav className="admin-sidebar-menu">
          {menuItems.map(item => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end={item.exact}
              className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined admin-menu-icon">{item.icon}</span>
              <span className="admin-menu-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <TipsHelpWidget />
      </aside>

      {isMobileOpen && (
        <div 
          className="admin-overlay" 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90
          }}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
