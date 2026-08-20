/**
 * Profile.jsx — User profile view + edit
 * Matches Figma: Main (thông tin tài khoản) + mainnnnnn (edit + logout)
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTrip } from '../../context/TripContext.jsx'
import './Profile.css'

export default function Profile() {
  const { user, updateProfile, logout, isLoggedIn } = useAuth()
  const { favorites, itinerary } = useTrip()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    bio:      user?.bio      || '',
  })
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="profile-guest">
        <div className="profile-guest__icon">👤</div>
        <h2>Bạn chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem thông tin tài khoản</p>
        <button className="btn btn-purple" onClick={() => navigate('/login')}>Đăng nhập ngay</button>
      </div>
    )
  }

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(''), 2500)
  }

  const handleSave = async () => {
    if (!form.fullName.trim()) { showToast('Họ và tên không được để trống', false); return }
    setSaving(true)
    const result = await updateProfile(form)
    setSaving(false)
    if (result && result.ok === false) {
      showToast('❌ ' + (result.msg || 'Cập nhật thất bại'), false)
    } else {
      setEditing(false)
      showToast('✅ Cập nhật thông tin thành công!')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = (user?.fullName || user?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="profile-page">
      {toast && (
        <div className={`profile-toast ${toast.ok === false ? 'profile-toast--err' : ''}`}>
          {toast.msg}
        </div>
      )}

      <div className="container">
        <div className="profile__layout">

          {/* ── Left sidebar ── */}
          <aside className="profile__side">
            <div className="profile__avatar-wrap">
              <div className="profile__avatar">{initials}</div>
              <div className="profile__avatar-name">{user?.fullName || user?.username}</div>
              <div className="profile__avatar-email">{user?.email}</div>
            </div>

            <nav className="profile__sidenav">
              <button className="profile__nav-btn active"><span className="profile__icon">👤</span> Thông tin tài khoản</button>
              <button className="profile__nav-btn" onClick={() => navigate('/itinerary')}><span className="profile__icon">📋</span> Lịch trình của tôi</button>
              <button className="profile__nav-btn" onClick={() => navigate('/favorites')}><span className="profile__icon">❤️</span> Địa điểm yêu thích</button>
              <button className="profile__nav-btn" onClick={() => navigate('/change-password')}><span className="profile__icon">🔒</span> Đổi mật khẩu</button>
            </nav>

            <div className="profile__stats">
              <div className="profile__stat">
                <div className="profile__stat-val">{itinerary.length}</div>
                <div className="profile__stat-label">Lịch trình</div>
              </div>
              <div className="profile__stat">
                <div className="profile__stat-val">{favorites.length}</div>
                <div className="profile__stat-label">Yêu thích</div>
              </div>
            </div>

            <button className="profile__logout-btn" onClick={handleLogout}>
              <span className="profile__icon">🚪</span> Đăng xuất
            </button>
          </aside>

          {/* ── Main panel ── */}
          <div className="profile__main">
            <div className="profile__main-header">
              <h2 className="profile__main-title">
                {editing ? <><span className="profile__icon">✏️</span> Chỉnh sửa thông tin</> : <><span className="profile__icon">👤</span> Thông tin tài khoản</>}
              </h2>
              {!editing && (
                <button className="btn btn-purple profile__edit-btn" onClick={() => setEditing(true)}>
                  <span className="profile__icon">✏️</span> Chỉnh sửa
                </button>
              )}
            </div>

            {!editing ? (
              /* ── View mode ── */
              <div className="profile__info-list">
                {[
                  { icon:'👤', label:'Họ và Tên',      value: user?.fullName || '—' },
                  { icon:'🏷️', label:'Tên đăng nhập',  value: user?.username || '—' },
                  { icon:'📧', label:'Email',           value: user?.email    || '—' },
                  { icon:'📱', label:'Số điện thoại',   value: user?.phone    || 'Chưa cập nhật' },
                  { icon:'📝', label:'Giới thiệu',      value: user?.bio      || 'Chưa cập nhật' },
                  { icon:'📅', label:'Ngày tham gia',   value: new Date(user?.joinedAt || Date.now()).toLocaleDateString('vi-VN') },
                ].map((item, i) => (
                  <div key={i} className="profile__info-row">
                    <div className="profile__info-label">
                      <span className="profile__icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="profile__info-value">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Edit mode ── */
              <div className="profile__edit-form">
                {[
                  { key:'fullName', label:'Họ và Tên',     placeholder:'Nguyễn Văn A',      type:'text' },
                  { key:'username', label:'Tên đăng nhập', placeholder:'tenuser123',         type:'text' },
                  { key:'email',    label:'Email',          placeholder:'example@gmail.com',  type:'email'},
                  { key:'phone',    label:'Số điện thoại', placeholder:'0901234567',         type:'tel'  },
                ].map(f => (
                  <div key={f.key} className="field-group">
                    <label className="field-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="field-input"
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}

                <div className="field-group">
                  <label className="field-label">Giới thiệu bản thân</label>
                  <textarea
                    className="profile__bio-input"
                    placeholder="Viết vài dòng về bản thân..."
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="profile__edit-actions">
                  <button className="btn btn-purple" onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : '✅ Lưu thay đổi'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setEditing(false)}>Hủy</button>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="profile__quick-actions">
              <h3 className="profile__qa-title">Thao tác nhanh</h3>
              <div className="profile__qa-grid">
                <button className="profile__qa-card" onClick={() => navigate('/itinerary')}>
                  <span className="profile__qa-icon">📋</span>
                  <span>Lịch trình của tôi</span>
                  <span className="profile__qa-count">{itinerary.length}</span>
                </button>
                <button className="profile__qa-card" onClick={() => navigate('/favorites')}>
                  <span className="profile__qa-icon">❤️</span>
                  <span>Địa điểm yêu thích</span>
                  <span className="profile__qa-count">{favorites.length}</span>
                </button>
                <button className="profile__qa-card" onClick={() => navigate('/change-password')}>
                  <span className="profile__qa-icon">🔒</span>
                  <span>Đổi mật khẩu</span>
                </button>
                <button className="profile__qa-card" onClick={() => navigate('/ai-search')}>
                  <span className="profile__qa-icon">✨</span>
                  <span>Tạo lịch trình AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
