import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminProfile = () => {
  const { showToast } = useOutletContext();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Quản trị viên',
    email: user?.email || 'admin@smarttravel.com',
    phone: '',
    bio: 'Quản trị viên hệ thống Smart Travel.',
  });

  const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Đã lưu hồ sơ thành công.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwData.current) errs.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (pwData.newPw.length < 6) errs.newPw = 'Mật khẩu mới ít nhất 6 ký tự';
    if (pwData.newPw !== pwData.confirm) errs.confirm = 'Mật khẩu xác nhận không khớp';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwData({ current: '', newPw: '', confirm: '' });
    showToast('Đã đổi mật khẩu thành công.');
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid var(--color-surface-variant)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--color-surface)',
    color: 'var(--color-on-surface)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-on-surface-variant)',
    marginBottom: '6px',
    display: 'block',
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
  const errStyle = { fontSize: '12px', color: 'var(--color-error)', marginTop: '2px' };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <nav className="admin-breadcrumb">
            <span>Tài khoản</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Hồ sơ cá nhân</span>
          </nav>
          <h2 className="font-display-lg text-on-surface">Hồ sơ cá nhân</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Avatar + tên */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="font-headline-md text-on-surface" style={{ fontSize: '18px' }}>Thông tin tài khoản</h4>
            <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
          </div>
          <div style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), #46BCEB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {(formData.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{formData.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{formData.email}</div>
              <div style={{ marginTop: '6px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px',
                  background: 'rgba(33,115,173,0.15)', color: 'var(--color-primary)', letterSpacing: '0.5px'
                }}>ADMIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form chỉnh sửa hồ sơ */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="font-headline-md text-on-surface" style={{ fontSize: '18px' }}>Chỉnh sửa hồ sơ</h4>
            <span className="material-symbols-outlined text-on-surface-variant">edit</span>
          </div>
          <form onSubmit={handleSaveProfile} style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Họ và tên</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Số điện thoại</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Chưa cập nhật" style={inputStyle} />
              </div>
            </div>
            <div style={{ ...fieldStyle, marginBottom: '16px' }}>
              <label style={labelStyle}>Giới thiệu</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="admin-btn-primary">Lưu hồ sơ</button>
            </div>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="font-headline-md text-on-surface" style={{ fontSize: '18px' }}>Đổi mật khẩu</h4>
            <span className="material-symbols-outlined text-on-surface-variant">lock</span>
          </div>
          <form onSubmit={handleChangePassword} style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Mật khẩu hiện tại</label>
                <input type="password" value={pwData.current}
                  onChange={e => setPwData(p => ({ ...p, current: e.target.value }))} style={inputStyle} />
                {pwErrors.current && <span style={errStyle}>{pwErrors.current}</span>}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Mật khẩu mới</label>
                <input type="password" value={pwData.newPw}
                  onChange={e => setPwData(p => ({ ...p, newPw: e.target.value }))} style={inputStyle} />
                {pwErrors.newPw && <span style={errStyle}>{pwErrors.newPw}</span>}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Xác nhận mật khẩu mới</label>
                <input type="password" value={pwData.confirm}
                  onChange={e => setPwData(p => ({ ...p, confirm: e.target.value }))} style={inputStyle} />
                {pwErrors.confirm && <span style={errStyle}>{pwErrors.confirm}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="admin-btn-primary">Đổi mật khẩu</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;
