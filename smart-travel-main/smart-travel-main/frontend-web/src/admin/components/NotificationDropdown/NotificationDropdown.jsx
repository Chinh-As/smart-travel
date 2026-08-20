import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REVIEW': return 'star';
      case 'USER_ACTION': return 'person';
      case 'SYSTEM': return 'settings';
      default: return 'notifications';
    }
  };

  const formatTimeAgo = (createdAt) => {
    if (!createdAt) return 'Vừa xong';
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button className="admin-icon-btn" onClick={() => setIsOpen(!isOpen)}>
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && <span className="admin-notification-dot"></span>}
      </button>

      {isOpen && (
        <div className="admin-dropdown" style={{ width: '340px', right: '-10px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(187, 202, 198, 0.2)' }}>
            <span style={{ fontWeight: 600 }}>Thông báo ({unreadCount})</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Đánh dấu tất cả
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
                Đang tải...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className="admin-dropdown-item"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    padding: '12px 16px',
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(0, 107, 95, 0.04)',
                    borderBottom: '1px solid rgba(187, 202, 198, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)', marginTop: '2px' }}>
                    {getNotificationIcon(notif.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: notif.isRead ? 500 : 600, fontSize: '13px', color: 'var(--color-on-surface)', marginBottom: '2px' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                      {formatTimeAgo(notif.createdAt)}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', marginTop: '8px' }}></div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: '13px' }}>
                Không có thông báo nào
              </div>
            )}
          </div>

          <div style={{ padding: '8px', borderTop: '1px solid rgba(187, 202, 198, 0.2)', textAlign: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px', padding: '6px', display: 'block' }}>
              Hiển thị 5 thông báo mới nhất
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
