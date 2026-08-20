import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import SvgLogo from '../components/SvgLogo/SvgLogo.jsx'
import './AuthLayout.css'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Left panel — scenic photo */}
      <div className="auth-layout__left">
        <img
          src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&h=1000&fit=crop"
          alt="Du lịch"
          className="auth-layout__bg"
        />
        <div className="auth-layout__overlay" />

        {/* Logo: ST road-style */}
        <Link to="/" className="auth-layout__logo">
          <SvgLogo size={280} />
          <span className="auth-layout__logo-name">SMART TRAVEL</span>
        </Link>

      </div>

      {/* Right panel — form */}
      <div className="auth-layout__right">
        <Outlet />
      </div>
    </div>
  )
}
