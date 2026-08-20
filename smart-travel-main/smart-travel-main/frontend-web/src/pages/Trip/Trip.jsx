import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { destinations } from '../../data/mockData.js'
import { useTrip } from '../../context/TripContext.jsx'
import { fetchDestinationById } from '../../services/recommendationApi.js'
import { transformPlaceToDestination } from '../../services/dataTransformers.js'
import { useRequireAuth } from '../../hooks/useRequireAuth.js'
import WeatherAlertBanner from '../../components/WeatherAlertBanner/WeatherAlertBanner.jsx'
import SosModule from '../../components/SosModule/SosModule.jsx'
import './Trip.css'

const OSM_URL = (userLat, userLng, destLat, destLng) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(userLng,destLng)-0.01},${Math.min(userLat,destLat)-0.01},${Math.max(userLng,destLng)+0.01},${Math.max(userLat,destLat)+0.01}&layer=mapnik&marker=${destLat},${destLng}`

export default function Trip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { startTrip, endTrip, addToItinerary, removeFromItinerary, itinerary, toggleFavorite, isFavorite } = useTrip()
  const requireAuth = useRequireAuth()
  
  const [dest, setDest] = useState(null)
  const [loc, setLoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [destLoading, setDestLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    async function loadDest() {
      setDestLoading(true);
      try {
        const data = await fetchDestinationById(id);
        if (data) setDest(transformPlaceToDestination(data));
        else throw new Error('Not found')
      } catch (err) {
        console.error('API failed, fallback to mock', err);
        const mockDest = destinations.find(d => String(d.id) === String(id));
        setDest(mockDest || null);
      } finally {
        setDestLoading(false);
      }
    }
    loadDest();
  }, [id]);

  useEffect(() => {
    if (!dest) return
    startTrip(dest).then(l => { setLoc(l); setLoading(false) })
  }, [dest, startTrip])

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handleEnd = () => { endTrip(); navigate(`/review/${id}`) }

  const handleFindCafe = () => {
    // Điều hướng sang trang tìm kiếm với bộ lọc cafe, kèm tọa độ hiện tại
    const params = new URLSearchParams({ category: 'cafe' })
    if (loc) {
      params.set('lat', loc.lat)
      params.set('lng', loc.lng)
    }
    navigate(`/search?${params.toString()}`)
  }

  if (destLoading) return (
    <div className="trip-loading" style={{ minHeight: '60vh' }}>
      <div className="trip-spinner">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <p>Đang tải thông tin chuyến đi...</p>
    </div>
  )

  if (!dest) return (
    <div className="trip-404">
      <h2>Không tìm thấy chuyến đi</h2>
      <button className="btn btn-primary" onClick={() => navigate('/search')}>Quay lại</button>
    </div>
  )

  const mapSrc = loc ? OSM_URL(loc.lat, loc.lng, dest.lat || 10.7769, dest.lng || 106.7009) : null

  return (
    <div className="trip-page">
      <div className="trip-container">
        {/* Sidebar */}
        <aside className="trip-sidebar">
          <div className="trip-sidebar-header">
            <h2>Chuyến đi hiện tại</h2>
            <p>Đang dẫn đường đến <strong>{dest.title}</strong></p>
          </div>
          
          <nav className="trip-nav">
            <button
              className={`btn trip-nav-btn ${itinerary?.some(item => item.id === dest?.id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => requireAuth(() => {
                const inItin = itinerary?.some(item => item.id === dest?.id);
                if (inItin) removeFromItinerary(dest.id);
                else addToItinerary(dest);
              })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'text-bottom'}}>
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                {itinerary?.some(item => item.id === dest?.id) && <path d="M9 14l2 2 4-4" strokeWidth="2.5"/>}
              </svg>
              {itinerary?.some(item => item.id === dest?.id) ? 'Đã thêm vào lịch trình' : 'Thêm vào lịch trình'}
            </button>
            <button
              className={`btn trip-nav-btn ${isFavorite(dest?.id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => requireAuth(() => {
                if (dest) toggleFavorite(dest.id);
              })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite(dest?.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'text-bottom'}}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              {isFavorite(dest?.id) ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
            </button>
            <button className="btn btn-outline trip-nav-btn" onClick={() => navigate(-2)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'text-bottom'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Thay đổi tìm kiếm
            </button>
          </nav>


          <div className="trip-sidebar-middle">
            <div className="trip-stats">
              <div className="trip-stat-item">
                <span className="trip-stat-label">Thời gian đã đi</span>
                <span className="trip-stat-val trip-timer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4, verticalAlign: 'text-bottom'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {fmt(elapsed)}
                </span>
              </div>
              <div className="trip-stat-item">
                <span className="trip-stat-label">Khoảng cách còn lại</span>
                <span className="trip-stat-val">{dest.distance} km</span>
              </div>
            </div>

            {/* Weather Alert Banner — giữa thống kê và nút kết thúc */}
          {/* Dùng tọa độ điểm đến để dự báo thời tiết khu vực sắp tới */}
            <WeatherAlertBanner
              key={`${dest?.lat}-${dest?.lng}`}
              lat={dest?.lat}
              lng={dest?.lng}
              destName={dest?.title}
              onSearchNearby={(query) => navigate(`/search?q=${encodeURIComponent(query)}`, { state: { loc } })}
            />
          </div>

          <div className="trip-sidebar-footer">
            <button className="trip-end-btn" onClick={handleEnd}>
              Kết thúc chuyến đi
            </button>
          </div>
        </aside>

        {/* Main Content Dashboard */}
        <main className="trip-main">
          {loading ? (
            <div className="trip-loading">
              <div className="trip-spinner">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <p>Đang lấy vị trí của bạn...</p>
            </div>
          ) : (
            <div className="trip-dashboard">
              <div className="trip-map-container">
                <iframe
                  title="Live Map"
                  src={mapSrc}
                  className="trip-map-frame"
                  frameBorder="0"
                  scrolling="no"
                />
                
                {/* Gắn Floating SOS Button vào khung bản đồ */}
                <SosModule lat={loc?.lat} lng={loc?.lng} />
              </div>

              <div className="trip-dashboard-cards">
                {/* Next Stop */}
                <div className="trip-card trip-next-stop">
                  <div className="trip-card-content">
                    <div className="trip-card-label">ĐIỂM ĐẾN TIẾP THEO</div>
                    <h3 className="trip-card-title">{dest.title}</h3>
                    <p className="trip-card-sub">{dest.category}</p>
                    <p className="trip-card-dist">Cách bạn {dest.distance} km | ~{Math.round(dest.distance * 4)} phút</p>
                  </div>
                  <div className="trip-dir-btn-wrap">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="trip-dir-btn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                      Chỉ đường Google Maps
                    </a>
                  </div>
                </div>


              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
