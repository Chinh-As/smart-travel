import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { destinations } from '../../data/mockData.js'
import { useTrip } from '../../context/TripContext.jsx'
import { useRequireAuth } from '../../hooks/useRequireAuth.js'
import FilterPanel from '../../components/FilterPanel/FilterPanel.jsx'
import '../../layouts/SearchLayout.css'
import './TopResults.css'

const COUNTS = [3, 5, 10]

export default function TopResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToItinerary, removeFromItinerary, toggleFavorite, isFavorite, itinerary } = useTrip()
  const requireAuth = useRequireAuth()

  const passedResults = location.state?.results
  const passedForm = location.state?.form

  const [featuredResults, setFeaturedResults] = useState([]);
  
  useEffect(() => {
    if (passedResults?.length > 0) return;
    async function loadFeatured() {
      try {
        const { fetchFeaturedDestinations } = await import('../../services/recommendationApi.js');
        const { transformPlacesToDestinations } = await import('../../services/dataTransformers.js');
        const data = await fetchFeaturedDestinations(10);
        if (data && data.length > 0) {
          setFeaturedResults(transformPlacesToDestinations(data));
        } else {
          throw new Error('no api results');
        }
      } catch (err) {
        console.error('API failed, fallback to mock', err);
        setFeaturedResults(destinations.filter(d => d.featured).slice(0, 10));
      }
    }
    loadFeatured();
  }, [passedResults]);

  const allResults = passedResults?.length > 0 ? passedResults : featuredResults;

  const [showCount, setShowCount] = useState(3)
  const [toastMsg, setToastMsg] = useState('')

  const displayed = allResults.slice(0, showCount)

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2000) }

  const handleDirections = (d) => {
    requireAuth(() => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}&destination_place_id=${encodeURIComponent(d.title)}`
      window.open(url, '_blank')
    })
  }

  const stars = (r) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(r) ? 'star-filled' : 'star-empty'}>★</span>
  ))

  const isInItinerary = (id) => itinerary?.some(item => item.id === id)

  const handleToggleItinerary = (d) => {
    requireAuth(() => {
      if (isInItinerary(d.id)) {
        removeFromItinerary(d.id)
        showToast('🗑️ Đã huỷ khỏi lịch trình!')
      } else {
        addToItinerary(d)
        showToast('📋 Đã thêm vào lịch trình!')
      }
    })
  }

  return (
    <div className="search-layout">
      {toastMsg && <div className="search-layout__toast">{toastMsg}</div>}

      <div className="container search-layout__body">
        <div className="search-layout__grid">
          {/* Sidebar */}
          <div className="search-layout__sidebar">
            <div className="tr-sidebar-panel">
              <h3 className="tr-sidebar-panel__title">Tùy chọn</h3>

              <div className="tr-sidebar-panel__section">
                <h4 className="tr-sidebar-panel__label">Hiển thị</h4>
                <div className="tr-sidebar-panel__counts">
                  {COUNTS.map(n => (
                    <button key={n}
                      className={`tr-sidebar-panel__count-btn ${showCount === n ? 'active' : ''}`}
                      onClick={() => setShowCount(n)}
                    >
                      Top {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tr-sidebar-panel__section">
                <h4 className="tr-sidebar-panel__label">Điều hướng</h4>
                <button className="tr-sidebar-panel__link" onClick={() => navigate('/ai-search')}>← Thay đổi tìm kiếm</button>
                <button className="tr-sidebar-panel__link" onClick={() => navigate('/itinerary')}>📋 Xem lịch trình</button>
              </div>

              {passedForm && (
                <div className="tr-sidebar-panel__section">
                  <h4 className="tr-sidebar-panel__label">Bộ lọc đã dùng</h4>
                  <div className="tr-sidebar-panel__context">
                    {passedForm.destinationSearch && <div>🔍 {passedForm.destinationSearch}</div>}
                    {passedForm.city && <div>📍 {passedForm.city}</div>}
                    {passedForm.categories?.length > 0 && <div>🗂️ {passedForm.categories.join(', ')}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main */}
          <div className="search-layout__main">

            {displayed.length === 0 && (
              <div className="search-layout__state">
                <div className="search-layout__state-icon">🔍</div>
                <h2>Không tìm thấy địa điểm phù hợp</h2>
                <p>Thử thay đổi bộ lọc hoặc mô tả khác</p>
                <button className="btn btn-primary" onClick={() => navigate('/ai-search')}>Tìm lại</button>
              </div>
            )}

            <div className="search-layout__list">
              {displayed.map((d, i) => (
                <div key={d.id} className="tr-card fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="tr-card__img-wrap">
                    <img src={d.image} alt={d.title} className="tr-card__img"
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' }} />
                    {d.price === 0
                      ? <div className="tr-card__free">Miễn phí</div>
                      : <div className="tr-card__price-block">
                          <div className="tr-card__price">Từ {new Intl.NumberFormat('vi-VN').format(d.price)}đ</div>
                          {d.originalPrice && <div className="tr-card__orig">{new Intl.NumberFormat('vi-VN').format(d.originalPrice)}đ</div>}
                        </div>
                    }
                  </div>

                  <div className="tr-card__body">
                    {d.discount > 0 && <div className="tr-card__discount">-{d.discount}%</div>}
                    <div className="tr-card__top">
                      <div>
                        <h3 className="tr-card__name">{d.title}</h3>
                        <div className="tr-card__city">📍 {d.city}</div>
                      </div>
                      <div
                        className={`tr-card__fav-btn ${isFavorite(d.id) ? 'tr-card__fav-btn--active' : ''}`}
                        style={{marginTop: d.discount > 0 ? '28px' : '0'}}
                        onClick={() => requireAuth(() => { const was = isFavorite(d.id); toggleFavorite(d.id); showToast(was ? '💔 Đã xóa' : '❤️ Đã thêm yêu thích') })}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(d.id) ? '#EF4444' : 'none'} stroke={isFavorite(d.id) ? '#EF4444' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                    </div>

                    <div className="tr-card__suit">Phù hợp: {d._score ? Math.min(99, Math.round(d._score)) : d.suitability}%</div>

                    <div className="tr-card__meta">
                      <div>
                        <div className="tr-card__meta-label">Khoảng cách</div>
                        <div className="tr-card__meta-val">{d.distance} km</div>
                      </div>
                      <div>
                        <div className="tr-card__meta-label">Đánh giá</div>
                        <div className="tr-card__stars">{stars(d.rating)}<span> {d.rating}/5</span></div>
                      </div>
                    </div>

                    <div className="tr-card__actions">
                      <button className="tr-card__cta" onClick={() => navigate(`/destination/${d.id}`)}>
                        Xem chi tiết
                      </button>
                      <button className="tr-card__dir-btn" onClick={() => handleDirections(d)} title="Chỉ đường Google Maps">
                        🗺️ Chỉ đường
                      </button>
                      <button
                        className={`tr-card__add-btn ${isInItinerary(d.id) ? 'tr-card__add-btn--active' : ''}`}
                        onClick={() => handleToggleItinerary(d)}
                        title={isInItinerary(d.id) ? 'Hủy khỏi lịch trình' : 'Thêm vào lịch trình'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                          {isInItinerary(d.id) && <path d="M9 14l2 2 4-4" strokeWidth="2.5"/>}
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showCount < allResults.length && (
              <button className="search-layout__more" onClick={() => setShowCount(c => Math.min(c + 3, allResults.length))}>
                Xem thêm {Math.min(3, allResults.length - showCount)} địa điểm →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
