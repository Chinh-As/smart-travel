import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Utilities.css'

const UTILS = [
  { icon: '📋', label: 'Lịch trình của tôi',  sub: 'Xem & quản lý lịch trình',      path: '/itinerary', color: '#4DD0E1' },
  { icon: '⚡', label: 'Tạo lịch trình ngay', sub: 'AI tạo lịch trình thông minh',  path: '/ai-search', color: '#8DC63F' },
  { icon: '📷', label: 'Nhận diện địa danh',  sub: 'Chụp ảnh để nhận diện nơi đến', path: '/search',    color: '#6C63FF' },
  { icon: '🔔', label: 'Cảnh báo',            sub: 'Thông báo về địa điểm gần bạn', path: '/search',    color: '#FF6B35' },
]

export default function Utilities() {
  const navigate = useNavigate()
  return (
    <div className="utils-page">
      <div className="container">
        <h1 className="utils-page__title">Tiện ích</h1>
        <p className="utils-page__sub">Các công cụ hỗ trợ chuyến đi của bạn</p>
        <div className="utils-grid">
          {UTILS.map((u, i) => (
            <button
              key={i}
              className="util-card"
              onClick={() => navigate(u.path)}
              style={{ '--accent': u.color }}
            >
              <div className="util-card__icon">{u.icon}</div>
              <div className="util-card__text">
                <div className="util-card__label">{u.label}</div>
                <div className="util-card__sub">{u.sub}</div>
              </div>
              <span className="util-card__arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
