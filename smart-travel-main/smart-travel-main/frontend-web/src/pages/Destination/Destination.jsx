import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { destinations } from '../../data/mockData.js'
import { useTrip } from '../../context/TripContext.jsx'
import { fetchDestinationById } from '../../services/recommendationApi.js'
import { transformPlaceToDestination } from '../../services/dataTransformers.js'
import { useRequireAuth } from '../../hooks/useRequireAuth.js'
import './Destination.css'

export default function Destination() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToItinerary, removeFromItinerary, toggleFavorite, isFavorite, itinerary } = useTrip()
  const requireAuth = useRequireAuth()
  const [toast, setToast] = useState('')
  const [dest, setDest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [heroImgErr, setHeroImgErr] = useState(false)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    async function loadDest() {
      try {
        const data = await fetchDestinationById(id);
        if (data) { 
          setDest(transformPlaceToDestination(data)); 
          try {
            const { fetchReviewsForPlace } = await import('../../services/recommendationApi.js');
            const placeReviews = await fetchReviewsForPlace(id);
            setReviews(placeReviews || []);
          } catch (reviewErr) {
            console.error('Failed to fetch reviews', reviewErr);
            setReviews([]);
          }
        }
        else { throw new Error('Not found'); }
      } catch (err) {
        console.error('API failed, fallback to mock', err);
        const mockDest = destinations.find(d => String(d.id) === String(id));
        setDest(mockDest || null);
        setReviews(mockDest?.reviews || []);
      } finally { setLoading(false); }
    }
    loadDest();
  }, [id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

  const isInItinerary = () => itinerary?.some(item => item.id === dest?.id)

  const handleToggleItinerary = () => {
    requireAuth(() => {
      if (isInItinerary()) {
        removeFromItinerary(dest.id)
        showToast('🗑️ Đã huỷ khỏi lịch trình!')
      } else {
        addToItinerary(dest)
        showToast('✅ Đã thêm vào lịch trình!')
      }
    })
  }

  const handleFavorite = () => {
    requireAuth(() => {
      const wasFav = isFavorite(dest.id)
      toggleFavorite(dest.id)
      showToast(wasFav ? '💔 Đã xóa khỏi yêu thích' : '❤️ Đã thêm vào yêu thích')
    })
  }

  const handleStartTrip = () => requireAuth(() => navigate(`/trip/${dest.id}`))

  if (loading) return (
    <div className="dest-loading-wrapper">
      <div className="paper-plane-loader">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2>Đang lấy thông tin...</h2>
    </div>
  )
  if (!dest) return (
    <div className="dest-404">
      <h2>Không tìm thấy địa điểm</h2>
      <button className="btn btn-primary" onClick={() => navigate('/search')}>Quay lại tìm kiếm</button>
    </div>
  )

  const fmtPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)
  const stars = (r) => Array.from({ length: 5 }, (_, i) => {
    const filled = r - i
    let style
    if (filled >= 1) {
      style = { color: '#f59e0b', fontSize: '22px', lineHeight: 1, textShadow: '0 1px 4px rgba(245,158,11,0.5)', display: 'inline-block' }
    } else if (filled >= 0.5) {
      style = { color: '#f59e0b', fontSize: '22px', lineHeight: 1, opacity: 0.75, display: 'inline-block' }
    } else {
      style = { color: 'rgba(200,200,200,0.5)', fontSize: '22px', lineHeight: 1, display: 'inline-block' }
    }
    return <span key={i} style={style}>★</span>
  })

  const getCategoryFallback = (cat) => {
    if (!cat) return 'landscape';
    const c = cat.toLowerCase();
    if (c.includes('sight') || c.includes('cảnh') || c.includes('quan') || c.includes('landscape')) return 'landscape';
    if (c.includes('hist') || c.includes('lịch') || c.includes('sử') || c.includes('văn') || c.includes('hóa') || c.includes('culture') || c.includes('museum') || c.includes('bảo tàng')) return 'history_culture';
    if (c.includes('beach') || c.includes('biển') || c.includes('resort') || c.includes('nghỉ dưỡng')) return 'beach_resort';
    if (c.includes('culinary') || c.includes('ẩm thực') || c.includes('food') || c.includes('ăn') || c.includes('restaurant') || c.includes('nhà hàng') || c.includes('cafe') || c.includes('café')) return 'culinary';
    if (c.includes('entertainment') || c.includes('giải trí') || c.includes('park') || c.includes('công viên')) return 'entertainment';
    if (c.includes('shop') || c.includes('mua sắm')) return 'shopping';
    if (c.includes('nature') || c.includes('thiên nhiên') || c.includes('forest') || c.includes('núi')) return 'nature';
    if (c.includes('spiritual') || c.includes('tâm linh') || c.includes('chùa') || c.includes('đền')) return 'spiritual';
    return 'landscape';
  }
  const fallback = dest ? `/assets/fallback/${getCategoryFallback(dest.category)}.svg` : '';

  const inItinerary = isInItinerary()
  const faved = isFavorite(dest.id)

  // Quick action buttons — hiện khi hover trên một mục
  const QuickActions = ({ label = '' }) => (
    <div className="dest-quick-actions">
      <button
        className={`dest-qa-btn dest-qa-cal ${inItinerary ? 'dest-qa-cal--active' : ''}`}
        title="Thêm vào lịch trình"
        onClick={e => { e.stopPropagation(); handleToggleItinerary() }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          {inItinerary && <path d="M9 14l2 2 4-4" strokeWidth="2.5"/>}
        </svg>
        <span className="dest-qa-tip">{inItinerary ? 'Huỷ lịch trình' : 'Thêm lịch trình'}</span>
      </button>
      <button
        className={`dest-qa-btn dest-qa-heart ${faved ? 'dest-qa-heart--active' : ''}`}
        title="Yêu thích"
        onClick={e => { e.stopPropagation(); handleFavorite() }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        <span className="dest-qa-tip">{faved ? 'Bỏ yêu thích' : 'Yêu thích'}</span>
      </button>
    </div>
  )

  return (
    <div className="dest-page">
      {toast && <div className="dest-toast">{toast}</div>}

      {/* Hero */}
      <div className="dest-hero">
        <img src={heroImgErr ? fallback : dest.image} alt={dest.title} className="dest-hero-bg" onError={() => setHeroImgErr(true)} />
        <div className="dest-hero-overlay" />
        <div className="container dest-hero-inner">
          <div className="dest-hero-bottom">
            <h1 className="dest-hero-title">{dest.title}</h1>
            <div className="dest-hero-meta">
              <span className="dest-rating">
                <span className="stars">{stars(dest.rating)}</span> {dest.rating}/5
              </span>
              <span className="dest-review-count">({dest.reviewCount?.toLocaleString()} đánh giá trên Google)</span>
              <span className="dest-location">📍 {dest.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width tab layout — không còn sidebar */}
      <div className="container dest-layout-full">
        <div className="dest-content-card">

          {/* Tab Bar — 4 tabs */}
          <div className="dest-tabs">
            {/* Tab: Thay đổi tìm kiếm */}
            <button
              className="dest-tab-btn dest-tab-btn--back"
              onClick={() => navigate(-1)}
              title="Quay lại trang trước"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
              </svg>
              Thay đổi tìm kiếm
            </button>

            {/* Tab: Tổng quan */}
            <button
              className={`dest-tab-btn ${activeTab === 'overview' ? 'dest-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Tổng quan
            </button>

            {/* Tab: Bản đồ vị trí */}
            <button
              className={`dest-tab-btn ${activeTab === 'map' ? 'dest-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              Bản đồ vị trí
            </button>

            {/* Tab: Bắt đầu chuyến đi */}
            <button
              className="dest-tab-btn dest-tab-btn--start"
              onClick={handleStartTrip}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
              </svg>
              Bắt đầu chuyến đi
            </button>
          </div>

          {/* ── Tab Panel: Tổng quan ── */}
          {activeTab === 'overview' && (
            <div className="dest-tab-panel">

              {/* Tổng quan */}
              <section className="dest-section dest-section--hoverable">
                <div className="dest-section-header">
                  <h2>Tổng quan</h2>
                  <QuickActions />
                </div>
                <p className="dest-overview-text">{dest.overview}</p>
                <div className="dest-facilities">
                  <div className="dest-fac-item">
                    <span className="dest-fac-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    </span>
                    <div><strong>Tiện ích:</strong> {dest.facilities}</div>
                  </div>
                  <div className="dest-fac-item">
                    <span className="dest-fac-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M7 12h10"/></svg>
                    </span>
                    <div><strong>Loại hình:</strong> {dest.tourType}</div>
                  </div>
                  <div className="dest-fac-item">
                    <span className="dest-fac-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <div><strong>Giờ mở cửa:</strong> {dest.openHours}</div>
                  </div>
                </div>
              </section>

              <hr className="dest-divider" />

              {/* Giá vé */}
              <section className="dest-section dest-section--hoverable">
                <div className="dest-section-header">
                  <h2>Giá vé tham khảo</h2>
                </div>
                <div className="dest-price-table">
                  <div className="dest-price-row-inline">
                    <span>Người lớn</span>
                    <strong>{dest.priceDetail.adult === 0 ? 'Miễn phí' : fmtPrice(dest.priceDetail.adult) + ' đ'}</strong>
                  </div>
                  {dest.priceDetail.student !== undefined && (
                    <div className="dest-price-row-inline">
                      <span>Học sinh/Sinh viên</span>
                      <strong>{dest.priceDetail.student === 0 ? 'Miễn phí' : fmtPrice(dest.priceDetail.student) + ' đ'}</strong>
                    </div>
                  )}
                  {dest.priceDetail.child !== undefined && (
                    <div className="dest-price-row-inline">
                      <span>Trẻ em (&lt;6 tuổi)</span>
                      <strong>{dest.priceDetail.child === 0 ? 'Miễn phí' : fmtPrice(dest.priceDetail.child) + ' đ'}</strong>
                    </div>
                  )}
                </div>
              </section>

              <hr className="dest-divider" />

              {/* Đánh giá */}
              <section className="dest-section dest-section--hoverable">
                <div className="dest-section-header">
                  <h2>Đánh giá nổi bật</h2>
                </div>
                <div className="dest-reviews" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.length === 0 ? (
                    <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', fontStyle: 'italic', padding: '10px 0', margin: 0 }}>Chưa có đánh giá nào từ cộng đồng Smart Travel. Hãy là người đầu tiên đánh giá địa điểm này!</p>
                  ) : (
                    reviews.map((rawReview, i) => {
                      const r = typeof rawReview === 'string' ? {
                        id: `mock-${i}`,
                        userName: 'Khách du lịch',
                        createdAt: new Date().toISOString(),
                        ratingPoint: dest?.rating || 5,
                        reviewContent: rawReview.replace(/^"|"$/g, '')
                      } : rawReview;
                      return (
                        <div key={r.id || i} className="dest-review-card" style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid rgba(187, 202, 198, 0.2)', width: '100%' }}>
                          <div className="dest-review-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container-high, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, flexShrink: 0 }}>
                            {r.userName ? r.userName[0].toUpperCase() : '👤'}
                          </div>
                          <div className="dest-review-content" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ color: 'var(--color-on-surface)', fontSize: '15px' }}>{r.userName || 'Khách du lịch'}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div style={{ display: 'flex', color: '#f59e0b', gap: '2px', marginBottom: '8px', fontSize: '14px' }}>
                              {Array.from({ length: 5 }, (_, idx) => (
                                <span key={idx}>
                                  {idx < Math.round(r.ratingPoint || 5) ? '★' : '☆'}
                                </span>
                              ))}
                            </div>
                            <p className="dest-review-text" style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '14px', lineHeight: '1.5' }}>
                              {r.reviewContent || 'Chỉ đánh giá số sao.'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

            </div>
          )}

          {/* ── Tab Panel: Bản đồ vị trí ── */}
          {activeTab === 'map' && (
            <div className="dest-tab-panel">
              <section className="dest-section dest-section--hoverable">
                <div className="dest-section-header">
                  <h2>Bản đồ &amp; Vị trí</h2>
                  <QuickActions />
                </div>

                {/* Địa chỉ trước bản đồ */}
                <div className="dest-map-address">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className="dest-map-address-text">
                    <span className="dest-map-address-name">{dest.title}</span>
                    <span className="dest-map-address-separator"> — </span>
                    <span className="dest-map-address-detail">{dest.location}</span>
                  </div>
                </div>

                <div className="dest-map">
                  <iframe
                    title="map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(dest.lng||106.69)-0.02},${(dest.lat||10.77)-0.02},${(dest.lng||106.69)+0.02},${(dest.lat||10.77)+0.02}&layer=mapnik&marker=${dest.lat||10.77},${dest.lng||106.69}`}
                    width="100%" height="100%" frameBorder="0" scrolling="no"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline dest-dir-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                  Xem chỉ đường Google Maps
                </a>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
