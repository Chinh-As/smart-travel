import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Register.css'

export default function Register() {
  const [form, setForm] = useState({ fullName:'', email:'', password:'', agree:false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate  = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())    e.fullName = 'Vui lòng nhập họ và tên'

    if (!form.email.includes('@'))e.email    = 'Email không hợp lệ'
    if (form.password.length < 8) e.password = 'Mật khẩu ít nhất 8 ký tự'
    if (!form.agree)              e.agree    = 'Bạn phải đồng ý với điều khoản dịch vụ'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const result = await register({ fullName: form.fullName, email: form.email, password: form.password })
      if (result && result.ok === false) {
        setErrors({ email: result.msg || 'Đăng ký thất bại' })
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      setErrors({ email: err.message || 'Đăng ký thất bại, thử lại sau' })
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  return (
    <div className="register">
      <div className="register__header">
        <h1 className="register__title">Tạo tài khoản.</h1>
        <p className="register__sub">Bắt đầu hành trình của riêng bạn ngay hôm nay.</p>
      </div>

      <form className="register__form" onSubmit={handleSubmit} noValidate>
        {[
          {key:'fullName', placeholder:'Họ và Tên (Vd: Nguyễn Văn A)', type:'text'},

          {key:'email',    placeholder:'Email', type:'email'},
          {key:'password', placeholder:'Mật khẩu (tối thiểu 8 ký tự)', type:'password'},
        ].map(f=>(
          <div key={f.key} className="register__input-group">
            <input type={f.type} className={`register__input ${errors[f.key]?'register__input--err':''}`}
              placeholder={f.placeholder} value={form[f.key]} onChange={e=>set(f.key,e.target.value)} />
            {errors[f.key] && <span className="field-err">{errors[f.key]}</span>}
          </div>
        ))}

        <div className="register__input-group" style={{marginTop: '12px'}}>
          <label className="register__agree">
            <input type="checkbox" checked={form.agree} onChange={e=>set('agree',e.target.checked)} />
            <span>Tôi đồng ý với <Link to="/" className="register__link">Điều khoản dịch vụ</Link> và <Link to="/" className="register__link">Chính sách bảo mật</Link></span>
          </label>
          {errors.agree && <span className="field-err" style={{bottom: '-24px'}}>{errors.agree}</span>}
        </div>

        <button type="submit" className="btn btn-primary register__submit" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
        <p className="register__switch">Đã có tài khoản? <Link to="/login" className="register__link">Đăng nhập</Link></p>
      </form>
    </div>
  )
}
