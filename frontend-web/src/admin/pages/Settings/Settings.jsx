import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const { showToast } = useOutletContext();
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      siteName: 'Smart Travel',
      contactEmail: 'admin@smarttravel.vn',
      contactPhone: '0901234567',
      darkMode: false,
      enableAI: true,
      emailNotifications: true,
      requireTwoFactor: false
    };
  });

  useEffect(() => {
    if (formData.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [formData.darkMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      localStorage.setItem('admin_settings', JSON.stringify(updated));
      window.dispatchEvent(new Event('adminSettingsChanged'));
      return updated;
    });
  };

  const handleSubmit = (e, section) => {
    e.preventDefault();
    localStorage.setItem('admin_settings', JSON.stringify(formData));
    window.dispatchEvent(new Event('adminSettingsChanged'));
    showToast(`Đã lưu cấu hình ${section} thành công.`);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <nav className="admin-breadcrumb">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Cài đặt</span>
          </nav>
          <h2 className="font-display-lg text-on-surface">Cài đặt hệ thống</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Thông tin hệ thống */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="font-headline-md text-on-surface" style={{ fontSize: '18px' }}>Thông tin hệ thống</h4>
            <span className="material-symbols-outlined text-on-surface-variant">info</span>
          </div>
          <form onSubmit={(e) => handleSubmit(e, 'Thông tin hệ thống')} style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="admin-label">Tên hệ thống</label>
                <input 
                  type="text" 
                  name="siteName"
                  className="admin-input" 
                  value={formData.siteName}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="admin-label">Email liên hệ</label>
                <input 
                  type="email" 
                  name="contactEmail"
                  className="admin-input" 
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="admin-label">Số điện thoại</label>
                <input 
                  type="text" 
                  name="contactPhone"
                  className="admin-input" 
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="admin-btn-primary">Lưu thay đổi</button>
            </div>
          </form>
        </div>

        {/* Tùy chọn hệ thống */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="font-headline-md text-on-surface" style={{ fontSize: '18px' }}>Tùy chọn hệ thống</h4>
            <span className="material-symbols-outlined text-on-surface-variant">tune</span>
          </div>
          <div style={{ padding: '0 var(--spacing-md)' }}>
            
            {/* Giao diện */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-surface-container-high)' }}>
              <div>
                <div className="font-body-md" style={{ fontWeight: '600' }}>Chế độ tối (Dark Mode)</div>
                <div className="font-body-sm text-on-surface-variant">Chuyển đổi giao diện hệ thống sang màu tối.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  name="darkMode"
                  checked={formData.darkMode}
                  onChange={(e) => {
                    handleChange(e);
                    showToast(e.target.checked ? 'Đã bật chế độ tối' : 'Đã tắt chế độ tối');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.darkMode ? 'var(--color-primary)' : '#ccc', 
                  transition: '.4s', borderRadius: '24px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: formData.darkMode ? 'translateX(16px)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>

            {/* AI Gợi ý */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-surface-container-high)' }}>
              <div>
                <div className="font-body-md" style={{ fontWeight: '600' }}>Bật tính năng Gợi ý bằng AI</div>
                <div className="font-body-sm text-on-surface-variant">Cho phép AI phân tích và đề xuất địa điểm cho người dùng.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  name="enableAI"
                  checked={formData.enableAI}
                  onChange={(e) => {
                    handleChange(e);
                    showToast(e.target.checked ? 'Đã bật Gợi ý AI' : 'Đã tắt Gợi ý AI');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.enableAI ? 'var(--color-primary)' : '#ccc', 
                  transition: '.4s', borderRadius: '24px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: formData.enableAI ? 'translateX(16px)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>

            {/* Thông báo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-surface-container-high)' }}>
              <div>
                <div className="font-body-md" style={{ fontWeight: '600' }}>Thông báo qua Email</div>
                <div className="font-body-sm text-on-surface-variant">Nhận email khi có đánh giá mới hoặc báo cáo từ người dùng.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={(e) => {
                    handleChange(e);
                    showToast(e.target.checked ? 'Đã bật thông báo email' : 'Đã tắt thông báo email');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.emailNotifications ? 'var(--color-primary)' : '#ccc', 
                  transition: '.4s', borderRadius: '24px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: formData.emailNotifications ? 'translateX(16px)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>

            {/* Bảo mật */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
              <div>
                <div className="font-body-md" style={{ fontWeight: '600' }}>Xác thực hai yếu tố (2FA)</div>
                <div className="font-body-sm text-on-surface-variant">Bảo vệ tài khoản quản trị viên bằng lớp bảo mật bổ sung.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  name="requireTwoFactor"
                  checked={formData.requireTwoFactor}
                  onChange={(e) => {
                    handleChange(e);
                    showToast(e.target.checked ? 'Yêu cầu 2FA cho quản trị viên' : 'Đã tắt yêu cầu 2FA');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.requireTwoFactor ? 'var(--color-primary)' : '#ccc', 
                  transition: '.4s', borderRadius: '24px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: formData.requireTwoFactor ? 'translateX(16px)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
