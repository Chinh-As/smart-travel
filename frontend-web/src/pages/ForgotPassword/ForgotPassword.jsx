import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiForgotPassword, apiVerifyOtp, apiResetPassword } from '../../services/authApi.js'
import './ForgotPassword.css'

// ---------------------------------------------------------------------------
// Step 1: Email entry → POST /auth/forgot-password
// ---------------------------------------------------------------------------
function StepEmail({ onNext }) {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email.includes('@')) { setErr('Email không hợp lệ'); return }
    setLoading(true)
    setErr('')
    try {
      await apiForgotPassword(email)
      // Server always returns 200 (even if email not found — prevents user enumeration)
      onNext(email)
    } catch (e) {
      setErr(e.message || 'Gửi mã thất bại, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-form">
      <h2 className="fp-form__title">Khôi phục mật khẩu</h2>
      <p className="fp-form__sub">Vui lòng nhập email để đặt mật khẩu mới. Mã xác minh 6 chữ số sẽ gửi về mail của bạn</p>
      <div className="fp-form__field">
        <label className="field-label">Email khôi phục</label>
        <input
          type="email"
          className={`field-input ${err ? 'field-input--err' : ''}`}
          placeholder="example@gmail.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {err && <span className="field-err">{err}</span>}
      </div>
      <button className="btn btn-green fp-form__btn" onClick={submit} disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi mã'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2: OTP verification → POST /auth/verify-otp
// ---------------------------------------------------------------------------
function StepOTP({ email, onNext, onResend }) {
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      inputRefs.current[5]?.focus()
      e.preventDefault()
    }
  }

  const verify = async () => {
    const code = otp.join('')
    if (code.length < 6) { setErr('Nhập đủ 6 số'); return }
    setLoading(true)
    setErr('')
    try {
      const res = await apiVerifyOtp({ email, otp: code })
      onNext(res.resetToken)
    } catch (e) {
      setErr(e.message || 'OTP không đúng hoặc đã hết hạn')
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (countdown > 0) return
    setResending(true)
    setErr('')
    try {
      await onResend(email)
      setCountdown(60)
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } catch {
      setErr('Gửi lại thất bại, thử lại sau')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="fp-form">
      <h2 className="fp-form__title">Khôi phục mật khẩu</h2>
      <p className="fp-form__hint">Nhập mã 6 số đã gửi đến: <strong>{email}</strong></p>
      <div className="otp-row" onPaste={handlePaste}>
        {otp.map((v, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            className="otp-box"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={v}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
          />
        ))}
      </div>
      {err && <span className="field-err" style={{ textAlign: 'center', display: 'block' }}>{err}</span>}
      <div className="fp-form__actions">
        <button className="btn btn-green" onClick={resend} disabled={countdown > 0 || resending}>
          {resending ? 'Đang gửi...' : countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã'}
        </button>
        <button className="btn btn-sky" onClick={verify} disabled={loading}>
          {loading ? 'Đang xác nhận...' : 'Xác nhận'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3: New password → POST /auth/reset-password
// ---------------------------------------------------------------------------
function StepNewPassword({ resetToken, onDone }) {
  const [form, setForm] = useState({ pw: '', confirm: '' })
  const [show, setShow] = useState({ pw: false, confirm: false })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (form.pw.length < 8) { setErr('Mật khẩu ít nhất 8 ký tự'); return }
    if (form.pw !== form.confirm) { setErr('Mật khẩu không khớp'); return }
    setLoading(true)
    setErr('')
    try {
      await apiResetPassword({ resetToken, newPassword: form.pw })
      onDone()
    } catch (e) {
      setErr(e.message || 'Đặt lại mật khẩu thất bại, thử lại từ đầu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-form">
      <h2 className="fp-form__title">Khôi phục mật khẩu</h2>
      {[['pw','Mật khẩu mới','Tối thiểu 8 ký tự'],['confirm','Xác nhận mật khẩu','••••••••••']].map(([k,label,ph]) => (
        <div key={k} className="fp-form__field">
          <label className="field-label">{label}</label>
          <div className="fp-pw-wrap">
            <input
              type={show[k] ? 'text' : 'password'}
              className={`field-input ${err ? 'field-input--err' : ''}`}
              placeholder={ph}
              value={form[k]}
              onChange={e => { setForm(p => ({ ...p, [k]: e.target.value })); setErr('') }}
            />
            <button type="button" className="fp-eye" onClick={() => setShow(p => ({ ...p, [k]: !p[k] }))}>
              {show[k] ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
      ))}
      {err && <span className="field-err">{err}</span>}
      <button className="btn btn-green fp-form__btn" onClick={submit} disabled={loading}>
        {loading ? 'Đang cập nhật...' : 'Đặt mật khẩu mới'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ForgotPassword() {
  const [step, setStep] = useState(1)      // 1 | 2 | 3
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const navigate = useNavigate()

  const handleResend = async (em) => {
    await apiForgotPassword(em)
  }

  return (
    <div className="forgot">
      <div className="forgot__steps">
        {[1,2,3].map(s => (
          <div key={s} className={`forgot__step-dot ${step >= s ? 'active' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <StepEmail onNext={e => { setEmail(e); setStep(2) }} />
      )}
      {step === 2 && (
        <StepOTP
          email={email}
          onNext={token => { setResetToken(token); setStep(3) }}
          onResend={handleResend}
        />
      )}
      {step === 3 && (
        <StepNewPassword
          resetToken={resetToken}
          onDone={() => navigate('/login')}
        />
      )}

      <Link to="/login" className="forgot__back">← Quay lại đăng nhập</Link>
    </div>
  )
}
