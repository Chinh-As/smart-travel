/**
 * safetyEngine.js — Hỗ trợ "Cảnh báo an toàn" theo thời gian thực
 * ------------------------------------------------------------------
 * Tất cả đều chạy phía trình duyệt, dùng các API miễn phí, KHÔNG cần key:
 *   - Reverse geocoding: OpenStreetMap Nominatim  -> tên khu vực bạn đang ở.
 *   - Thời tiết thật: Open-Meteo                  -> sinh cảnh báo thời tiết.
 *   - Địa điểm quanh bạn: tính từ dữ liệu destinations bằng công thức Haversine.
 *   - Cảnh báo an ninh khu vực: gắn theo các địa điểm thật ở gần bạn.
 */

import { destinations } from '../data/mockData.js'

/* ─────────────────────────  Khoảng cách  ──────────────────────────── */

export function haversineKm(a, b) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const la1 = a.lat * Math.PI / 180
  const la2 = b.lat * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function formatDistance(km) {
  if (km < 1) return Math.round(km * 1000) + ' m'
  if (km < 10) return km.toFixed(1) + ' km'
  return Math.round(km) + ' km'
}

export function formatTimeAgo(date) {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (sec < 10) return 'vừa xong'
  if (sec < 60) return `${sec} giây trước`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  return `${day} ngày trước`
}

/* ─────────────────────  Reverse geocoding  ────────────────────────── */

const REVERSE_CACHE = new Map()

function cacheKey(lat, lng) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`
}

export async function reverseGeocode(lat, lng) {
  const key = cacheKey(lat, lng)
  if (REVERSE_CACHE.has(key)) return REVERSE_CACHE.get(key)

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi&zoom=16`
  const res = await fetch(url, { headers: { 'Accept-Language': 'vi-VN' } })
  if (!res.ok) throw new Error('reverse geocode failed ' + res.status)
  const data = await res.json()
  const a = data.address || {}
  const area = a.suburb || a.neighbourhood || a.quarter || a.village || a.town || a.city_district || ''
  const district = a.city_district || a.district || a.county || ''
  const city = a.city || a.town || a.state || ''
  const result = {
    area,
    district,
    city,
    label: [area, district, city].filter(Boolean).join(', ') || data.display_name || 'Khu vực của bạn',
    displayName: data.display_name || '',
  }
  REVERSE_CACHE.set(key, result)
  return result
}

/* ───────────────────────  Thời tiết thật  ─────────────────────────── */

// Bảng mã thời tiết WMO của Open-Meteo
const WEATHER_CODES = {
  0:  { label: 'Trời quang', icon: 'sun', severe: false },
  1:  { label: 'Ít mây', icon: 'cloud-sun', severe: false },
  2:  { label: 'Mây rải rác', icon: 'cloud-sun', severe: false },
  3:  { label: 'Nhiều mây', icon: 'cloud-sun', severe: false },
  45: { label: 'Sương mù', icon: 'cloud-sun', severe: false },
  48: { label: 'Sương mù đóng băng', icon: 'cloud-sun', severe: false },
  51: { label: 'Mưa phùn nhẹ', icon: 'cloud-rain', severe: false },
  53: { label: 'Mưa phùn', icon: 'cloud-rain', severe: false },
  55: { label: 'Mưa phùn dày', icon: 'cloud-rain', severe: false },
  61: { label: 'Mưa nhỏ', icon: 'cloud-rain', severe: false },
  63: { label: 'Mưa vừa', icon: 'cloud-rain', severe: true },
  65: { label: 'Mưa to', icon: 'cloud-rain', severe: true },
  66: { label: 'Mưa lạnh', icon: 'cloud-rain', severe: true },
  67: { label: 'Mưa lạnh nặng hạt', icon: 'cloud-rain', severe: true },
  71: { label: 'Tuyết nhẹ', icon: 'cloud-rain', severe: false },
  80: { label: 'Mưa rào nhẹ', icon: 'cloud-rain', severe: false },
  81: { label: 'Mưa rào', icon: 'cloud-rain', severe: true },
  82: { label: 'Mưa rào dữ dội', icon: 'cloud-rain', severe: true },
  95: { label: 'Dông', icon: 'cloud-lightning', severe: true },
  96: { label: 'Dông kèm mưa đá', icon: 'cloud-lightning', severe: true },
  99: { label: 'Dông mạnh kèm mưa đá', icon: 'cloud-lightning', severe: true },
}

export function weatherCodeInfo(code) {
  return WEATHER_CODES[code] || { label: 'Không rõ', icon: 'cloud-sun', severe: false }
}

export async function fetchWeather(lat, lng) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day` +
    `&hourly=precipitation_probability&forecast_hours=3&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather failed ' + res.status)
  const data = await res.json()
  const c = data.current || {}
  const probs = data.hourly?.precipitation_probability || []
  const precipProb = probs.length ? Math.max(...probs.slice(0, 3)) : null
  return {
    temp: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    precipitation: c.precipitation,
    code: c.weather_code,
    windKmh: c.wind_speed_10m,
    isDay: c.is_day === 1,
    precipProb,
  }
}

// Sinh cảnh báo dựa trên thời tiết thật
export function weatherToAlerts(weather, areaLabel) {
  if (!weather) return []
  const out = []
  const info = weatherCodeInfo(weather.code)
  const place = areaLabel || 'khu vực của bạn'
  const now = new Date()

  // Dông / mưa to -> nguy hiểm
  if ([95, 96, 99].includes(weather.code)) {
    out.push({
      id: 'w-storm',
      level: 'danger',
      icon: 'cloud-lightning',
      title: `Cảnh báo dông tại ${place}`,
      desc: `Đang có ${info.label.toLowerCase()}. Hạn chế ra ngoài, tránh trú dưới cây lớn và cột điện. Nhiệt độ hiện tại ${Math.round(weather.temp)}°C.`,
      time: now, live: true,
    })
  } else if ([63, 65, 66, 67, 81, 82].includes(weather.code)) {
    out.push({
      id: 'w-rain',
      level: 'warning',
      icon: 'cloud-rain',
      title: `Mưa lớn tại ${place}`,
      desc: `Dự báo ${info.label.toLowerCase()}, có thể ngập cục bộ. Hạn chế di chuyển qua các tuyến đường thấp, mang theo áo mưa.`,
      time: now, live: true,
    })
  } else if (typeof weather.precipProb === 'number' && weather.precipProb >= 60) {
    out.push({
      id: 'w-prob',
      level: 'warning',
      icon: 'cloud-rain',
      title: `Khả năng mưa cao tại ${place}`,
      desc: `Xác suất mưa trong vài giờ tới khoảng ${weather.precipProb}%. Nên chuẩn bị áo mưa/ô khi ra ngoài.`,
      time: now, live: true,
    })
  }

  // Nắng nóng gay gắt
  if (typeof weather.temp === 'number' && weather.temp >= 35) {
    out.push({
      id: 'w-heat',
      level: 'warning',
      icon: 'thermometer',
      title: `Nắng nóng tại ${place}`,
      desc: `Nhiệt độ ${Math.round(weather.temp)}°C, cảm giác như ${Math.round(weather.feelsLike ?? weather.temp)}°C. Uống đủ nước, tránh ra ngoài giờ cao điểm 11:00–15:00.`,
      time: now, live: true,
    })
  }

  // Gió mạnh
  if (typeof weather.windKmh === 'number' && weather.windKmh >= 40) {
    out.push({
      id: 'w-wind',
      level: 'warning',
      icon: 'wind',
      title: `Gió mạnh tại ${place}`,
      desc: `Tốc độ gió khoảng ${Math.round(weather.windKmh)} km/h. Cẩn thận khi đi xe máy và ở khu vực nhiều biển quảng cáo, cây xanh.`,
      time: now, live: true,
    })
  }

  // Nếu thời tiết ổn -> một mục thông tin trấn an
  if (out.length === 0) {
    out.push({
      id: 'w-ok',
      level: 'info',
      icon: 'sun',
      title: `Thời tiết thuận lợi tại ${place}`,
      desc: `${info.label}, nhiệt độ ${Math.round(weather.temp)}°C, gió ${Math.round(weather.windKmh ?? 0)} km/h. Điều kiện tốt để tham quan.`,
      time: now, live: true,
    })
  }
  return out
}

/* ─────────────────────  Địa điểm quanh bạn  ───────────────────────── */

export function nearbyPlaces(lat, lng, n = 4, maxKm = 12) {
  const me = { lat, lng }
  return destinations
    .filter(d => typeof d.lat === 'number' && typeof d.lng === 'number')
    .map(d => ({ dest: d, km: haversineKm(me, d) }))
    .filter(x => x.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, n)
}

/* ───────────────  Cảnh báo an ninh theo khu vực gần  ──────────────── */

// Gắn cảnh báo an ninh "đặc thù" theo loại địa điểm thật ở gần người dùng.
export function areaSecurityAlerts(near, areaLabel) {
  if (!near || near.length === 0) return []
  const out = []
  const place = areaLabel || 'khu vực bạn đang ở'
  const now = Date.now()

  const cats = new Set()
  near.forEach(({ dest }) => (dest.categories || []).forEach(c => cats.add(c)))
  const names = near.map(n => n.dest.title)

  // Khu chợ / mua sắm -> nhắc móc túi
  if (cats.has('shopping') || near.some(n => /chợ/i.test(n.dest.title))) {
    const market = near.find(n => /chợ/i.test(n.dest.title)) || near.find(n => (n.dest.categories || []).includes('shopping'))
    out.push({
      id: 's-pickpocket',
      level: 'danger',
      icon: 'alert-triangle',
      title: `Cẩn trọng móc túi gần ${market ? market.dest.title : place}`,
      desc: 'Khu vực đông người mua sắm dễ xảy ra móc túi. Giữ túi xách phía trước, hạn chế dùng điện thoại nơi đông đúc.',
      time: new Date(now - 60 * 60 * 1000), live: false,
    })
  }

  // Khu nightlife -> an toàn về đêm
  if (cats.has('nightlife') || cats.has('entertainment')) {
    const night = near.find(n => (n.dest.categories || []).includes('nightlife')) || near[0]
    out.push({
      id: 's-night',
      level: 'info',
      icon: 'shield-check',
      title: `Khu ${night.dest.title} sôi động về đêm`,
      desc: 'Lực lượng an ninh tuần tra thường xuyên buổi tối. Vẫn nên giữ tư trang cá nhân và đi theo nhóm khi về khuya.',
      time: new Date(now - 3 * 60 * 60 * 1000), live: false,
    })
  }

  // Khu biển -> an toàn khi tắm biển
  if (cats.has('beach')) {
    const beach = near.find(n => (n.dest.categories || []).includes('beach'))
    out.push({
      id: 's-beach',
      level: 'warning',
      icon: 'waves',
      title: `Lưu ý an toàn khi tắm biển gần ${beach.dest.title}`,
      desc: 'Tắm trong khu vực có cờ an toàn, tránh ra xa bờ khi sóng lớn và để ý dòng chảy xa bờ (rip current).',
      time: new Date(now - 2 * 60 * 60 * 1000), live: false,
    })
  }

  // Cảnh báo giao thông chung dựa theo địa danh gần nhất
  if (out.length < 2 && names.length) {
    out.push({
      id: 's-traffic',
      level: 'info',
      icon: 'shield-check',
      title: `Giao thông quanh ${names[0]}`,
      desc: 'Khu vực có thể đông xe vào giờ cao điểm (7:00–9:00, 17:00–19:00). Chú ý sang đường và bảo quản phương tiện.',
      time: new Date(now - 90 * 60 * 1000), live: false,
    })
  }

  return out
}

/* ───────────────  Danh bạ khẩn cấp (Việt Nam)  ────────────────────── */

export const EMERGENCY_CONTACTS = [
  { label: 'Công an / Cảnh sát', number: '113', icon: 'shield-alert', hint: 'An ninh trật tự, tội phạm' },
  { label: 'Cứu hỏa', number: '114', icon: 'flame', hint: 'Cháy nổ, cứu nạn cứu hộ' },
  { label: 'Cấp cứu y tế', number: '115', icon: 'activity', hint: 'Tai nạn, cấp cứu' },
  { label: 'Bảo vệ trẻ em', number: '111', icon: 'phone-call', hint: 'Tổng đài quốc gia bảo vệ trẻ em' },
]
