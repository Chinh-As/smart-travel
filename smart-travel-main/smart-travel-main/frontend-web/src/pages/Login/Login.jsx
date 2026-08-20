import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Login.css'

export default function Login() {
  const [form,    setForm]    = useState({ credential:'', password:'', remember:true })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from || null

  const validate = () => {
    const e = {}
    if (!form.credential.trim()) e.credential = 'Vui lòng nhập email hoặc tên đăng nhập'
    if (!form.password)          e.password   = 'Vui lòng nhập mật khẩu'
    else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.credential, form.password)
      if (from) navigate(from, { replace: true })
    } catch (err) {
      setErrors({ credential: err.message })
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setErrors(p => ({...p,[k]:''})) }


  const handleDemoFill = (email, password) => {
    setForm(prev => ({ ...prev, credential: email, password: password }))
    setErrors({})
  }

  return (
    <div className="login">
      <div className="login__header">
        <h1 className="login__title">Chào mừng trở lại.</h1>
        <p className="login__sub">Đăng nhập để quản lý lịch trình của bạn.</p>
      </div>

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <div className="login__input-group">
          <input type="text" className={`login__input ${errors.credential?'login__input--err':''}`}
            placeholder="Email hoặc Tên đăng nhập"
            value={form.credential} onChange={e=>set('credential',e.target.value)} />
          {errors.credential && <span className="field-err">{errors.credential}</span>}
        </div>

        <div className="login__input-group">
          <input type="password" className={`login__input ${errors.password?'login__input--err':''}`}
            placeholder="Mật khẩu"
            value={form.password} onChange={e=>set('password',e.target.value)} />
          {errors.password && <span className="field-err">{errors.password}</span>}
        </div>

        <div className="login__row">
          <label className="login__remember">
            <input type="checkbox" checked={form.remember} onChange={e=>set('remember',e.target.checked)} />
            <span>Ghi nhớ tôi</span>
          </label>
          <Link to="/forgot" className="login__forgot">Quên mật khẩu?</Link>
        </div>

        <button type="submit" className="btn btn-primary login__submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {/* Quick Demo Accounts Selection */}
        <div className="login__demo-container">
          <div className="login__demo-divider">
            <span>Tài khoản Demo trải nghiệm</span>
          </div>

          <div className="login__demo-grid">
            <button
              type="button"
              className="login__demo-btn login__demo-btn--user"
              onClick={() => handleDemoFill('user@smarttravel.com', 'user123')}
              title="Click để tự động điền tài khoản User"
            >
              <div className="login__demo-role login__demo-role--user">USER</div>
              <div className="login__demo-details">
                <span className="login__demo-email">user@smarttravel.com</span>
                <span className="login__demo-pass">Mật khẩu: user123</span>
              </div>
            </button>

            <button
              type="button"
              className="login__demo-btn login__demo-btn--admin"
              onClick={() => handleDemoFill('admin@smarttravel.com', 'admin123')}
              title="Click để tự động điền tài khoản Admin"
            >
              <div className="login__demo-role login__demo-role--admin">ADMIN</div>
              <div className="login__demo-details">
                <span className="login__demo-email">admin@smarttravel.com</span>
                <span className="login__demo-pass">Mật khẩu: admin123</span>
              </div>
            </button>
          </div>
        </div>

        <p className="login__switch">Bạn chưa có tài khoản?&nbsp;<Link to="/register" className="login__link">Đăng kí</Link></p>
      </form>
    </div>
  )
}
