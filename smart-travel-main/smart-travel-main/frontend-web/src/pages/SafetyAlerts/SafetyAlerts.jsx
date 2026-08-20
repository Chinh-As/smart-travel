import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert, MapPin, AlertTriangle, CloudRain, ShieldCheck, Phone, ArrowRight,
  Siren, Volume2, VolumeX, Navigation, RefreshCw, LoaderCircle, Sun, Thermometer,
  Wind, CloudLightning, Waves, Activity, Flame, PhoneCall, LocateFixed, Radio,
} from 'lucide-react'
import {
  reverseGeocode, fetchWeather, weatherToAlerts, weatherCodeInfo,
  nearbyPlaces, areaSecurityAlerts, formatDistance, formatTimeAgo,
  haversineKm, EMERGENCY_CONTACTS,
} from '../../services/safetyEngine.js'
import './SafetyAlerts.css'

// Map tên icon (chuỗi) -> component lucide
const LEVEL_ICONS = {
  'cloud-rain': CloudRain, 'cloud-lightning': CloudLightning, 'thermometer': Thermometer,
  'wind': Wind, 'sun': Sun, 'alert-triangle': AlertTriangle, 'shield-check': ShieldCheck,
  'waves': Waves,
}
const ICcontact = {
  'shield-alert': ShieldAlert, 'flame': Flame, 'activity': Activity, 'phone-call': PhoneCall,
}
function AlertIcon({ name }) {
  const C = LEVEL_ICONS[name] || ShieldCheck
  return <C size={20} />
}

// Cảnh báo tĩnh mặc định khi CHƯA bật định vị (vẫn cho người dùng xem ví dụ)
const DEFAULT_ALERTS = [
  { id: 'd1', level: 'warning', icon: 'cloud-rain', title: 'Mưa lớn khu vực Quận 1, TP.HCM',
    desc: 'Dự báo mưa lớn kèm ngập cục bộ vào buổi chiều. Hạn chế di chuyển qua các tuyến đường thấp như Nguyễn Hữu Cảnh, Lê Văn Sỹ.',
    time: new Date(Date.now() - 2 * 3600 * 1000), live: false },
  { id: 'd2', level: 'info', icon: 'shield-check', title: 'Khu vực Phố đi bộ Bùi Viện an toàn về đêm',
    desc: 'Lực lượng an ninh tăng cường tuần tra từ 20:00 - 02:00, du khách vẫn nên giữ tư trang cá nhân cẩn thận.',
    time: new Date(Date.now() - 5 * 3600 * 1000), live: false },
  { id: 'd3', level: 'danger', icon: 'alert-triangle', title: 'Cảnh báo móc túi tại Chợ Bến Thành',
    desc: 'Ghi nhận một số trường hợp móc túi tại khu vực cổng Tây Chợ Bến Thành. Vui lòng cẩn trọng với túi xách và điện thoại.',
    time: new Date(Date.now() - 24 * 3600 * 1000), live: false },
]

export default function SafetyAlerts() {
  const navigate = useNavigate()

  // ----- Định vị thời gian thực -----
  const [tracking, setTracking] = useState(false)
  const [coords, setCoords] = useState(null)
  const [area, setArea] = useState(null)
  const [weather, setWeather] = useState(null)
  const [nearby, setNearby] = useState([])
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [geoError, setGeoError] = useState('')
  const [loadingData, setLoadingData] = useState(false)

  const watchIdRef = useRef(null)
  const lastFixRef = useRef(null)     // toạ độ đã xử lý gần nhất (để tránh gọi API liên tục)
  const tickRef = useRef(null)        // interval cập nhật "x phút trước"
  const [, forceTick] = useState(0)

  // ----- Nút báo động -----
  const [alarmOn, setAlarmOn] = useState(false)
  const audioCtxRef = useRef(null)
  const oscRef = useRef(null)
  const gainRef = useRef(null)
  const sirenIntervalRef = useRef(null)
  const vibrateIntervalRef = useRef(null)

  /* ───── Lấy & tổng hợp dữ liệu theo vị trí ───── */
  const refreshData = useCallback(async (lat, lng) => {
    setLoadingData(true)
    let areaLabel = ''
    let areaObj = null
    let weatherObj = null

    // 1) Tên khu vực (reverse geocode) — có thể lỗi do giới hạn tốc độ
    try {
      areaObj = await reverseGeocode(lat, lng)
      areaLabel = areaObj.label
      setArea(areaObj)
    } catch (_) { /* bỏ qua, dùng fallback bên dưới */ }

    // 2) Địa điểm quanh bạn (từ dữ liệu, luôn có)
    const near = nearbyPlaces(lat, lng, 4, 15)
    setNearby(near)
    if (!areaLabel && near.length) areaLabel = near[0].dest.city

    // 3) Thời tiết thật
    try {
      weatherObj = await fetchWeather(lat, lng)
      setWeather(weatherObj)
    } catch (_) { setWeather(null) }

    // 4) Tổng hợp cảnh báo: thời tiết thật + an ninh khu vực gần
    const wAlerts = weatherToAlerts(weatherObj, areaLabel)
    const sAlerts = areaSecurityAlerts(near, areaLabel)
    const merged = [...wAlerts, ...sAlerts].sort((a, b) => b.time - a.time)
    setAlerts(merged.length ? merged : DEFAULT_ALERTS)

    setLastUpdated(new Date())
    setLoadingData(false)
  }, [])

  /* ───── Bật / tắt theo dõi vị trí ───── */
  const startTracking = () => {
    setGeoError('')
    if (!navigator.geolocation) {
      setGeoError('Thiết bị của bạn không hỗ trợ định vị.')
      return
    }
    setTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const acc = pos.coords.accuracy
        setCoords({ lat, lng, acc })
        // Chỉ gọi API khi lần đầu hoặc đã di chuyển > ~150m
        const last = lastFixRef.current
        const moved = last ? haversineKm(last, { lat, lng }) : Infinity
        if (!last || moved > 0.15) {
          lastFixRef.current = { lat, lng }
          refreshData(lat, lng)
        }
      },
      (err) => {
        setTracking(false)
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Bạn đã từ chối quyền vị trí. Hãy cấp quyền để nhận cảnh báo theo thời gian thực.'
            : 'Không thể lấy vị trí của bạn. Vui lòng thử lại.'
        )
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
  }

  const manualRefresh = () => {
    if (coords) refreshData(coords.lat, coords.lng)
  }

  /* ───── Đồng hồ cập nhật nhãn "x phút trước" mỗi 20s ───── */
  useEffect(() => {
    tickRef.current = setInterval(() => forceTick(n => n + 1), 20000)
    return () => clearInterval(tickRef.current)
  }, [])

  /* ───── Nút báo động (Web Audio – không cần file âm thanh) ───── */
  const startAlarm = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = audioCtxRef.current || new Ctx()
      audioCtxRef.current = ctx
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(740, ctx.currentTime)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      oscRef.current = osc
      gainRef.current = gain

      // Hú còi hai tông luân phiên
      let high = false
      sirenIntervalRef.current = setInterval(() => {
        high = !high
        const t = ctx.currentTime
        osc.frequency.setTargetAtTime(high ? 1000 : 640, t, 0.05)
      }, 550)

      // Rung thiết bị (nếu hỗ trợ)
      if (navigator.vibrate) {
        navigator.vibrate([400, 150, 400, 150])
        vibrateIntervalRef.current = setInterval(() => navigator.vibrate([400, 150, 400, 150]), 1100)
      }
      setAlarmOn(true)
    } catch (_) {
      setAlarmOn(false)
    }
  }

  const stopAlarm = () => {
    if (sirenIntervalRef.current) { clearInterval(sirenIntervalRef.current); sirenIntervalRef.current = null }
    if (vibrateIntervalRef.current) { clearInterval(vibrateIntervalRef.current); vibrateIntervalRef.current = null }
    if (navigator.vibrate) navigator.vibrate(0)
    const ctx = audioCtxRef.current
    const gain = gainRef.current
    const osc = oscRef.current
    if (ctx && gain && osc) {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime)
        gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05)
        osc.stop(ctx.currentTime + 0.2)
      } catch (_) { /* ignore */ }
    }
    oscRef.current = null
    gainRef.current = null
    setAlarmOn(false)
  }

  const toggleAlarm = () => (alarmOn ? stopAlarm() : startAlarm())

  /* ───── Dọn dẹp khi rời trang ───── */
  useEffect(() => {
    return () => {
      stopTracking()
      stopAlarm()
      clearInterval(tickRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wInfo = weather ? weatherCodeInfo(weather.code) : null

  return (
    <div className="sa-page">
      {/* Lớp phủ nhấp nháy khi báo động */}
      {alarmOn && (
        <div className="sa-flash" role="alert" aria-live="assertive">
          <div className="sa-flash__inner">
            <Siren size={56} />
            <h2>ĐANG PHÁT BÁO ĐỘNG</h2>
            <p>Nhấn nút bên dưới một lần nữa để tắt</p>
            <button className="sa-flash__stop" onClick={stopAlarm}>
              <VolumeX size={20} /> Tắt báo động
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <div className="sa-header">
          <div className="sa-header__icon"><ShieldAlert size={28} strokeWidth={1.8} /></div>
          <h1 className="sa-title">Cảnh báo an toàn</h1>
          <p className="sa-sub">Theo dõi cảnh báo an toàn, thời tiết và tình hình an ninh theo thời gian thực tại khu vực bạn đang ở</p>
        </div>

        {/* Nút báo động khẩn cấp */}
        <div className={`sa-panic ${alarmOn ? 'sa-panic--on' : ''}`}>
          <div className="sa-panic__text">
            <h3><Siren size={18} /> Nút báo động khẩn cấp</h3>
            <p>Khi gặp nguy hiểm, nhấn để phát âm thanh báo động lớn thu hút sự chú ý. Nhấn lần nữa để tắt.</p>
          </div>
          <button
            className={`sa-panic__btn ${alarmOn ? 'is-on' : ''}`}
            onClick={toggleAlarm}
            aria-pressed={alarmOn}
          >
            {alarmOn ? <VolumeX size={26} /> : <Volume2 size={26} />}
            <span>{alarmOn ? 'Tắt báo động' : 'Báo động'}</span>
          </button>
        </div>

        {/* Thẻ định vị / trạng thái thời gian thực */}
        <div className="sa-locate-card">
          <div className="sa-locate-card__text">
            <h3>
              {tracking
                ? <><span className="sa-live-dot" /> Đang theo dõi vị trí thời gian thực</>
                : <><MapPin size={18} /> Bật cảnh báo theo vị trí của bạn</>}
            </h3>
            {tracking && area ? (
              <p className="sa-area"><LocateFixed size={14} /> {area.label}</p>
            ) : (
              <p>Cho phép truy cập vị trí để nhận cảnh báo an toàn, thời tiết và an ninh phù hợp với khu vực bạn đang ở.</p>
            )}
            {coords && (
              <p className="sa-coords">
                Toạ độ: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                {coords.acc ? ` · sai số ~${Math.round(coords.acc)}m` : ''}
              </p>
            )}
            {lastUpdated && (
              <p className="sa-updated"><Radio size={13} /> Cập nhật: {formatTimeAgo(lastUpdated)}</p>
            )}
            {geoError && <p className="sa-error">{geoError}</p>}
          </div>
          <div className="sa-locate-card__actions">
            {!tracking ? (
              <button className="btn btn-primary" onClick={startTracking}>
                <Navigation size={16} /> Bật theo dõi
              </button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={manualRefresh} disabled={loadingData}>
                  {loadingData ? <LoaderCircle size={16} className="sa-spin" /> : <RefreshCw size={16} />}
                  {loadingData ? 'Đang cập nhật' : 'Làm mới'}
                </button>
                <button className="btn btn-outline" onClick={stopTracking}>Dừng</button>
              </>
            )}
          </div>
        </div>

        {/* Thẻ thời tiết thật */}
        {tracking && weather && wInfo && (
          <div className="sa-weather">
            <div className="sa-weather__main">
              <div className="sa-weather__ic"><AlertIcon name={wInfo.icon} /></div>
              <div>
                <div className="sa-weather__temp">{Math.round(weather.temp)}°C</div>
                <div className="sa-weather__label">{wInfo.label}</div>
              </div>
            </div>
            <div className="sa-weather__grid">
              <div><Thermometer size={15} /> Cảm giác {Math.round(weather.feelsLike ?? weather.temp)}°C</div>
              <div><Wind size={15} /> Gió {Math.round(weather.windKmh ?? 0)} km/h</div>
              {typeof weather.precipProb === 'number' && (
                <div><CloudRain size={15} /> Mưa {weather.precipProb}%</div>
              )}
            </div>
          </div>
        )}

        {/* Cảnh báo gần đây */}
        <div className="sa-section">
          <div className="sa-section__head">
            <h2 className="sa-section__title">Cảnh báo gần đây</h2>
            {tracking && <span className="sa-live-badge"><span className="sa-live-dot" /> Trực tiếp</span>}
          </div>
          {!tracking && (
            <p className="sa-hint">Bật theo dõi vị trí để xem cảnh báo cập nhật liên tục theo khu vực của bạn. Dưới đây là ví dụ.</p>
          )}
          <div className="sa-alerts">
            {alerts.map(a => (
              <div key={a.id} className={`sa-alert sa-alert--${a.level}`}>
                <div className="sa-alert__icon"><AlertIcon name={a.icon} /></div>
                <div className="sa-alert__body">
                  <div className="sa-alert__head">
                    <h4>{a.title}</h4>
                    <span className="sa-alert__time">
                      {a.live && <span className="sa-live-dot sa-live-dot--sm" />}
                      {a.time instanceof Date ? formatTimeAgo(a.time) : a.time}
                    </span>
                  </div>
                  <p>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quanh bạn */}
        {tracking && nearby.length > 0 && (
          <div className="sa-section">
            <h2 className="sa-section__title">Địa điểm quanh bạn</h2>
            <div className="sa-nearby">
              {nearby.map(({ dest, km }) => (
                <button key={dest.id} className="sa-nearby__item" onClick={() => navigate(`/destination/${dest.id}`)}>
                  <img src={dest.image} alt={dest.title} className="sa-nearby__img" />
                  <div className="sa-nearby__info">
                    <div className="sa-nearby__name">{dest.title}</div>
                    <div className="sa-nearby__meta"><MapPin size={12} /> Cách bạn {formatDistance(km)}</div>
                  </div>
                  <ArrowRight size={16} className="sa-nearby__arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Số điện thoại khẩn cấp */}
        <div className="sa-section">
          <h2 className="sa-section__title">Số điện thoại khẩn cấp</h2>
          <p className="sa-hint">Nhấn vào một số để gọi ngay bằng ứng dụng điện thoại.</p>
          <div className="sa-contacts">
            {EMERGENCY_CONTACTS.map(c => {
              const C = ICcontact[c.icon] || Phone
              return (
                <a key={c.number} href={`tel:${c.number}`} className="sa-contact">
                  <div className="sa-contact__icon"><C size={20} /></div>
                  <div className="sa-contact__body">
                    <div className="sa-contact__label">{c.label}</div>
                    <div className="sa-contact__number">{c.number}</div>
                    <div className="sa-contact__hint">{c.hint}</div>
                  </div>
                  <Phone size={16} className="sa-contact__call" />
                </a>
              )
            })}
          </div>
        </div>

        <div className="sa-footer-cta">
          <button className="btn btn-outline" onClick={() => navigate('/itinerary')}>
            Xem lịch trình của tôi <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
