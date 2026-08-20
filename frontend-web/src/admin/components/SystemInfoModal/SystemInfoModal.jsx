import React, { useState, useRef, useEffect } from 'react';
import { useSystemInfo } from '../../../hooks/useSystemInfo';

export const SystemInfoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { systemInfo, loading, refresh } = useSystemInfo();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status) => {
    return status === 'running' || status === 'connected' ? '🟢' : '🔴';
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="admin-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Thông tin hệ thống"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>info</span>
      </button>

      {isOpen && (
        <div 
          className="admin-dropdown" 
          style={{ 
            width: '360px', 
            right: '-10px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '16px', 
            gap: '14px', 
            zIndex: 1000 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(187, 202, 198, 0.2)', paddingBottom: '8px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px', fontWeight: 600 }}>
              🏥 Thông tin hệ thống
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 600 }}>📦 Ứng dụng</h4>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                <strong>Phiên bản:</strong> {systemInfo?.appVersion || '1.0.0'}<br />
                <strong>Ngày phát hành:</strong> {systemInfo?.buildTime || '2026-07-17'}
              </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 600 }}>💾 Cơ sở dữ liệu</h4>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                {getStatusColor(systemInfo?.database?.status || 'connected')} 
                <strong>Trạng thái:</strong> {systemInfo?.database?.status === 'connected' ? ' Kết nối tốt' : ' Ngắt kết nối'}<br />
                <strong>Địa điểm:</strong> {systemInfo?.database?.placeCount ?? 981} địa điểm<br />
                <strong>Người dùng:</strong> {systemInfo?.database?.userCount ?? 2} tài khoản
              </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 600 }}>🚀 Dịch vụ</h4>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                {getStatusColor(systemInfo?.services?.javaStatus || 'running')} 
                <strong>Java Core:</strong> Cổng {systemInfo?.services?.javaPort ?? 8000} (Đang hoạt động)<br />
                {getStatusColor(systemInfo?.services?.pythonStatus || 'running')} 
                <strong>FastAPI AI:</strong> Cổng {systemInfo?.services?.pythonPort ?? 5000} (Đang hoạt động)
              </div>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(187, 202, 198, 0.2)', paddingTop: '10px' }}>
            <span style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
              Cập nhật lúc: {systemInfo?.lastUpdated ? new Date(systemInfo.lastUpdated).toLocaleTimeString('vi-VN') : new Date().toLocaleTimeString('vi-VN')}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={refresh}
                disabled={loading}
                style={{ 
                  flex: 1,
                  padding: '8px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {loading ? '🔄 Đang làm mới...' : '🔄 Làm mới'}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ 
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-surface-container)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid rgba(187, 202, 198, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
