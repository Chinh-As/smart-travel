import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import SearchBar from '../SearchBar/SearchBar.jsx'
import { Sun, Moon } from 'lucide-react'
import './Header.css'

const UTILITIES = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    label: 'Lịch trình của tôi', path: '/itinerary'
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 3 3.5.5-2.5 2.5.5 3.5L8 9l-3 1.5.5-3.5L3 4.5l3.5-.5L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    label: 'Tạo lịch trình ngay', path: '/ai-search'
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 3V2M10.5 3V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    label: 'Nhận diện địa danh', path: '/landmark-recognition'
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 015 5v2l1.5 2H1.5L3 9V7a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    label: 'Cảnh báo an toàn', path: '/safety-hub'
  },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [miniSearch, setMiniSearch] = useState(false)
  const [miniQ, setMiniQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [utilOpen, setUtilOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { isLoggedIn, user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate  = useNavigate()
  const utilRef   = useRef(null)
  const userRef   = useRef(null)
  const authRef   = useRef(null)

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 8)
      setMiniSearch(window.scrollY > 380)
    }
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setUtilOpen(false); setUserOpen(false) }, [location.pathname])

  useEffect(() => {
    const fn = (e) => {
      if (utilRef.current && !utilRef.current.contains(e.target)) setUtilOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
      if (authRef.current && !authRef.current.contains(e.target)) setAuthOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const goUtil = (path) => { setUtilOpen(false); navigate(path) }
  const goUser = (path) => { setUserOpen(false); if(path) navigate(path) }
  const initials = (user?.fullName || user?.username || 'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  return (
    <header className={`header ${scrolled?'header--scrolled':''} ${isTransparent?'header--transparent':''}`}>
      <div className="header__inner">

        {/* Logo */}
        <Link to="/" className="header__logo">
          <div className="header__logo-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" fill="url(#logoGrad)"/>
              <path d="M7 14.5L13.5 8L20 14.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.5 12.5V20H18.5V12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5 20V16H16.5V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stopColor="#0F4C75"/>
                  <stop offset="100%" stopColor="#3ABFF8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="header__logo-text">
            <span className="header__logo-st">Smart Travel</span>
            <span className="header__logo-tagline">Khám phá Việt Nam</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="header__nav">
          <Link to="/" className={`header__nav-link ${location.pathname==='/'?'active':''}`}>TRANG CHỦ</Link>

          <div className="header__drop-wrap" ref={utilRef}>
            <button
              className={`header__nav-link header__drop-trigger ${utilOpen?'active':''}`}
              onClick={() => { setUtilOpen(o=>!o); setUserOpen(false) }}
            >
              TIỆN ÍCH <span className={`header__caret ${utilOpen?'open':''}`}>&#9662;</span>
            </button>
            {utilOpen && (
              <div className="header__dropdown header__dropdown--util">
                {UTILITIES.map((u,i) => (
                  <button key={i} className="header__dd-item" onClick={() => goUtil(u.path)}>
                    <span className="header__dd-icon">{u.icon}</span>
                    <span>{u.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/contact" className={`header__nav-link ${location.pathname==='/contact'?'active':''}`}>LIÊN HỆ</Link>
        </nav>

        {/* Mini Search — xuất hiện khi hero search bị cuộn */}
        {miniSearch && isHome && (
          <div className="header__mini-search-wrap">
            <SearchBar
              key={location.pathname}
              size="sm"
              placeholder="Bạn muốn đi đâu?"
              hideSubmit={true}
              onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
            />
          </div>
        )}

        {/* Right */}
        <div className="header__right">
          <button
            className="header__theme-btn"
            onClick={toggleTheme}
            title={isDark ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối'}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </button>

          <button className="header__lang">
            <span>VN</span><span>VIE</span>
          </button>

          {isLoggedIn ? (
            <div className="header__drop-wrap" ref={userRef}>
              <button
                className={`header__avatar-btn ${userOpen?'open':''}`}
                onClick={() => { setUserOpen(o=>!o); setUtilOpen(false) }}
              >
                <span className="header__avatar-initials">{initials}</span>
                <span className="header__avatar-name">{user?.username || 'CT01'}</span>
                <span className="header__auth-caret-wrap" style={{ marginLeft: '2px' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transition: 'transform 0.2s', transform: userOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              {userOpen && (
                <div className="header__dropdown header__dropdown--user">
                  <div className="header__dd-user-info">
                    <div className="header__dd-avatar">{initials}</div>
                    <div>
                      <div className="header__dd-uname">{user?.fullName || user?.username}</div>
                      <div className="header__dd-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="header__dd-divider" />
                  {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                    <button className="header__dd-item" onClick={() => goUser('/admin')} style={{ color: '#0F4C75', fontWeight: 'bold' }}>
                      <span className="header__dd-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="9" fill="none" />
                          <rect x="14" y="3" width="7" height="5" fill="none" />
                          <rect x="14" y="12" width="7" height="9" fill="none" />
                          <rect x="3" y="16" width="7" height="5" fill="none" />
                        </svg>
                      </span>
                      <span>Trang quản trị (Admin)</span>
                    </button>
                  )}
                  <button className="header__dd-item" onClick={() => goUser('/profile')}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <span>Tài khoản của tôi</span>
                  </button>
                  <button className="header__dd-item" onClick={() => goUser('/itinerary')}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <span>Lịch trình</span>
                  </button>
                  <button className="header__dd-item" onClick={() => goUser('/favorites')}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 018 4a3.5 3.5 0 015.5 3c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.5"/></svg></span>
                    <span>Yêu thích</span>
                  </button>
                  <button className="header__dd-item" onClick={() => goUser('/landmark-recognition')}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 11l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <span>Tìm kiếm bằng hình ảnh</span>
                  </button>
                  <button className="header__dd-item" onClick={() => goUser('/change-password')}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <span>Đổi mật khẩu</span>
                  </button>
                  <div className="header__dd-divider" />
                  <button className="header__dd-item header__dd-item--danger" onClick={() => { logout(); goUser('/') }}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header__drop-wrap" ref={authRef}>
              <button
                className={`header__auth-btn ${authOpen ? 'open' : ''}`}
                onClick={() => { setAuthOpen(o => !o); setUtilOpen(false) }}
              >
                <svg className="header__auth-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M2.5 16c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <span>Tài khoản</span>
                <span className="header__auth-caret-wrap">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              {authOpen && (
                <div className="header__dropdown header__dropdown--auth">
                  {/* Tài khoản */}
                  <Link to="/login" className="header__dd-item" onClick={() => setAuthOpen(false)}>
                    <span className="header__dd-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Đăng nhập</span>
                  </Link>
                  <Link to="/register" className="header__dd-item" onClick={() => setAuthOpen(false)}>
                    <span className="header__dd-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M1 14c0-3 2.5-5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span>Đăng ký</span>
                  </Link>
                  <div className="header__dd-divider" />
                  {/* Tính năng */}
                  <button className="header__dd-item" onClick={() => { setAuthOpen(false); navigate('/itinerary') }}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <span>Lịch trình của tôi</span>
                  </button>
                  <button className="header__dd-item" onClick={() => { setAuthOpen(false); navigate('/ai-search') }}>
                    <span className="header__dd-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 3 3.5.5-2.5 2.5.5 3.5L8 9l-3 1.5.5-3.5L3 4.5l3.5-.5L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg></span>
                    <span>Tạo lịch trình AI</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button className={`header__burger ${menuOpen?'open':''}`} onClick={()=>setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="header__mobile">
          <Link to="/"               className="header__mobile-link">Trang chủ</Link>
          <Link to="/itinerary"      className="header__mobile-link">Lịch trình của tôi</Link>
          <Link to="/ai-search"      className="header__mobile-link">Tạo lịch trình AI</Link>
          <Link to="/favorites"      className="header__mobile-link">Yêu thích</Link>
          <Link to="/landmark-recognition" className="header__mobile-link">Tìm kiếm bằng hình ảnh</Link>
          {isLoggedIn && <Link to="/profile" className="header__mobile-link">Tài khoản</Link>}
          {isLoggedIn && (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
            <Link to="/admin" className="header__mobile-link" style={{ fontWeight: 'bold', color: '#0F4C75' }}>Trang quản trị (Admin)</Link>
          )}
          <Link to="/contact"        className="header__mobile-link">Liên hệ</Link>
          {!isLoggedIn && <Link to="/login" className="btn btn-purple header__mobile-auth">Đăng nhập</Link>}
        </nav>
      )}
    </header>
  )
}
