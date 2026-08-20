import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './ChangePassword.css'

export default function ChangePassword() {
  const { changePassword, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ old:'', newPw:'', confirm:'' })
  const [show, setShow] = useState({ old:false, newPw:false, confirm:false })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isLoggedIn) {
    navigate('/login'); return null
  }

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),2500) }

  const validate = () => {
    const e = {}
    if (!form.old)              e.old     = 'Nhập mật khẩu hiện tại'
    if (form.newPw.length < 8)  e.newPw   = 'Mật khẩu mới tối thiểu 8 ký tự'
    if (form.newPw !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const result = await changePassword(form.old, form.newPw)
    setLoading(false)
    if (result.ok) {
      showToast('✅ ' + result.msg)
      setForm({ old:'', newPw:'', confirm:'' })
      setTimeout(() => navigate('/profile'), 1500)
    } else {
      setErrors({ old: result.msg })
      showToast('❌ ' + result.msg, false)
    }
  }

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }
  const toggleShow = (k) => setShow(p=>({...p,[k]:!p[k]}))

  return (
    <div className="chpw-page">
      {toast && (
        <div className={`profile-toast ${!toast.ok?'profile-toast--err':''}`}>{toast.msg}</div>
      )}

      <div className="container">
        <div className="chpw__wrap">
          <div className="chpw__header">
            <button className="chpw__back" onClick={() => navigate('/profile')}>← Quay lại</button>
            <h1 className="chpw__title">🔒 Đổi mật khẩu</h1>
            <p className="chpw__sub">Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật</p>
          </div>

          <form className="chpw__form" onSubmit={handleSubmit} noValidate>
            {[
              { key:'old',     label:'Mật khẩu hiện tại', placeholder:'Nhập mật khẩu hiện tại' },
              { key:'newPw',   label:'Mật khẩu mới',      placeholder:'Tối thiểu 6 ký tự' },
              { key:'confirm', label:'Xác nhận mật khẩu', placeholder:'Nhập lại mật khẩu mới' },
            ].map(f => (
              <div key={f.key} className="field-group">
                <label className="field-label">{f.label}</label>
                <div className="chpw__pw-wrap">
                  <input
                    type={show[f.key] ? 'text' : 'password'}
                    className={`field-input ${errors[f.key]?'field-input--err':''}`}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                  />
                  <button type="button" className="chpw__eye" onClick={() => toggleShow(f.key)}>
                    {show[f.key] ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors[f.key] && <span className="field-err">{errors[f.key]}</span>}
              </div>
            ))}

            <div className="chpw__actions">
              <button type="submit" className="btn btn-green chpw__submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/profile')}>
                Hủy
              </button>
            </div>
          </form>

          <div className="chpw__tips">
            <h4>💡 Mẹo tạo mật khẩu mạnh</h4>
            <ul>
              <li>Tối thiểu 8 ký tự</li>
              <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li>Không dùng thông tin cá nhân (ngày sinh, tên...)</li>
              <li>Dùng mật khẩu khác nhau cho mỗi tài khoản</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
