/**
 * weatherApi.js
 * Gọi API thời tiết từ Open-Meteo (miễn phí, không cần API key).
 * Docs: https://open-meteo.com/en/docs
 */

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather interpretation codes -> mô tả đầy đủ (bao gồm trời tốt)
const WMO_ALL_CODES = {
  0:  { label: 'Bầu trời quang đãng', icon: '☀️', severe: false, good: true },
  1:  { label: 'Phần lớn quang đãng', icon: '🌤️', severe: false, good: true },
  2:  { label: 'Có mây rải rác', icon: '⛅', severe: false, good: true },
  3:  { label: 'Nhiều mây', icon: '☁️', severe: false, good: false },
  45: { label: 'Sương mù', icon: '🌫️', severe: false, good: false },
  48: { label: 'Sương mù có đóng băng', icon: '🌫️', severe: false, good: false },
  51: { label: 'Mưa phùn nhẹ', icon: '🌦️', severe: false, good: false },
  53: { label: 'Mưa phùn vừa', icon: '🌦️', severe: false, good: false },
  55: { label: 'Mưa phùn dày', icon: '🌦️', severe: false, good: false },
  61: { label: 'Mưa nhẹ', icon: '🌦️', severe: false, good: false },
  63: { label: 'Mưa vừa', icon: '🌧️', severe: false, good: false },
  65: { label: 'Mưa to', icon: '🌧️', severe: true, good: false },
  67: { label: 'Mưa đá nhẹ', icon: '🌨️', severe: true, good: false },
  71: { label: 'Tuyết nhẹ', icon: '❄️', severe: false, good: false },
  73: { label: 'Tuyết vừa', icon: '❄️', severe: false, good: false },
  75: { label: 'Tuyết dày', icon: '❄️', severe: true, good: false },
  80: { label: 'Mưa rào nhẹ', icon: '🌦️', severe: false, good: false },
  81: { label: 'Mưa rào vừa', icon: '🌧️', severe: false, good: false },
  82: { label: 'Mưa rào to', icon: '🌧️', severe: true, good: false },
  95: { label: 'Giông sét vừa', icon: '⛈️', severe: true, good: false },
  96: { label: 'Giông sét + mưa đá nhẹ', icon: '⛈️', severe: true, good: false },
  99: { label: 'Giông sét + mưa đá lớn', icon: '⛈️', severe: true, good: false },
};

/**
 * Lấy dự báo thời tiết đầy đủ (cả tốt lẫn xấu) cho 6 giờ tới.
 * @returns {{ hasAlert, severity, current, forecast, alerts }}
 */
export async function fetchWeatherAlert(lat, lng) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lng,
      hourly: 'weathercode,precipitation,windspeed_10m,temperature_2m,uv_index',
      current_weather: true,
      forecast_days: 1,
      timezone: 'Asia/Ho_Chi_Minh',
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) throw new Error('Weather API error');

    const data = await res.json();
    const { time, weathercode, precipitation, windspeed_10m, temperature_2m, uv_index } = data.hourly;
    const currentWeather = data.current_weather;

    const now = new Date();
    const currentHour = now.getHours();

    // Tìm index giờ hiện tại
    let currentIdx = 0;
    for (let i = 0; i < time.length; i++) {
      if (new Date(time[i]).getHours() === currentHour) { currentIdx = i; break; }
    }

    // Thông tin thời tiết hiện tại
    const currentCode = weathercode[currentIdx];
    const currentInfo = WMO_ALL_CODES[currentCode] || { label: 'Không rõ', icon: '🌡️', severe: false, good: false };
    const current = {
      ...currentInfo,
      code: currentCode,
      temp: Math.round(currentWeather?.temperature ?? temperature_2m[currentIdx]),
      wind: Math.round(windspeed_10m[currentIdx]),
      rain: precipitation[currentIdx],
      uv: uv_index?.[currentIdx] ?? null,
      time: time[currentIdx],
    };

    // Dự báo 6 giờ tới
    const forecast = [];
    const alerts = [];
    for (let i = currentIdx; i < Math.min(currentIdx + 7, time.length); i++) {
      const h = new Date(time[i]).getHours();
      const code = weathercode[i];
      const info = WMO_ALL_CODES[code] || { label: 'Không rõ', icon: '🌡️', severe: false, good: false };
      const rain = precipitation[i];
      const wind = windspeed_10m[i];
      const temp = Math.round(temperature_2m[i]);

      forecast.push({ time: time[i], hour: h, ...info, code, rain, wind, temp });

      if (info.severe || rain > 5 || wind > 40) {
        alerts.push({ time: time[i], hour: h, ...info, code, rain, wind, temp,
          label: info.label || (rain > 5 ? 'Mưa lớn' : 'Gió mạnh'),
          icon: info.icon || (rain > 5 ? '🌧️' : '💨'),
          severe: info.severe || rain > 20 || wind > 60,
        });
      }
    }

    const hasAlert = alerts.length > 0;
    const hasSevere = alerts.some(a => a.severe);

    return {
      hasAlert,
      severity: hasAlert ? (hasSevere ? 'severe' : 'warning') : null,
      current,
      forecast,
      alerts,
      primary: alerts[0] || null,
    };
  } catch (err) {
    console.error('[WeatherAPI] Failed to fetch:', err);
    return { hasAlert: false, severity: null, current: null, forecast: [], alerts: [], error: err.message };
  }
}

/** Format giờ từ ISO string sang "HH:00" */
export function formatHour(isoString) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}
