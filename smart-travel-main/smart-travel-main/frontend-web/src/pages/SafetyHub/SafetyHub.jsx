import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWeatherAlert, formatHour } from '../../services/weatherApi';
import './SafetyHub.css';

// ─── Dữ liệu cẩm nang sự cố ───────────────────────────────────
const HANDBOOK = [
  {
    id: 'lost-docs',
    icon: '📋',
    title: 'Làm gì khi bị thất lạc giấy tờ?',
    link: 'https://dichvucong.gov.vn/p/home/dvc-trang-chu.html',
    linkLabel: 'Dịch vụ công quốc gia',
    answer: `1. Giữ bình tĩnh. Kiểm tra lại túi, hành lý xung quanh.
2. Báo cáo ngay với cơ quan công an địa phương trong vòng 24 giờ để được cấp giấy xác nhận mất CMND/CCCD.
3. Liên hệ đại sứ quán nếu bạn là người nước ngoài (hoặc đang ở nước ngoài).
4. Yêu cầu cấp giấy tờ tạm thời để đi lại. Số hotline Bộ Công an: 1900.0368.
5. Dùng dịch vụ VNeID để xác thực danh tính điện tử trong thời gian chờ làm lại giấy tờ.`
  },
  {
    id: 'first-aid',
    icon: '🩺',
    title: 'Kỹ năng sơ cứu cơ bản',
    link: 'https://www.youtube.com/watch?v=cosVBV96E2g',
    linkLabel: 'Video hướng dẫn CPR',
    answer: `SƠ CỨU NGỪNG TIM (CPR):
• Đặt bệnh nhân nằm ngửa trên nền cứng.
• Đan tay lại, đặt giữa ngực, ép mạnh 5–6cm, tốc độ 100–120 lần/phút.
• Thổi ngạt 2 lần sau mỗi 30 lần ép.

SƠ CỨU VẾT THƯƠNG CHẢY MÁU:
• Dùng vải sạch ép chặt lên vết thương.
• Không tháo vật đâm xuyên, cố định tại chỗ.
• Gọi 115 ngay khi máu không cầm sau 10 phút.

SƠ CỨU BỎNG:
• Xả nước lạnh lên vùng bỏng 15–20 phút.
• Không bôi kem đánh răng hay nước mắm.
• Băng bằng gạc sạch, đến cơ sở y tế ngay.`
  },
  {
    id: 'landslide',
    icon: '⛰️',
    title: 'Cách nhận biết khu vực dễ sạt lở',
    link: 'https://nchmf.gov.vn/',
    linkLabel: 'Trung tâm Dự báo KTTV quốc gia',
    answer: `DẤU HIỆU NHẬN BIẾT SẠT LỞ SẮP XẢY RA:
• Nghe tiếng nứt, gãy trong đất hoặc tiếng ầm ì từ sườn dốc.
• Thấy vết nứt mới xuất hiện trên mặt đất, tường nhà.
• Nước suối, ao đột ngột đục màu bất thường.
• Cây cối nghiêng ngã bất thường, rễ cây nhô lên.

KHU VỰC CÓ NGUY CƠ CAO:
• Sườn dốc trên 30 độ, lớp phủ thực vật thưa.
• Gần chân núi hoặc ven sông suối vùng đồi núi.
• Sau mưa lớn kéo dài 2-3 ngày liên tiếp.

CẦN LÀM GÌ:
• Sơ tán ngay lên vùng đất cao, cứng chắc.
• Gọi 112 (khẩn cấp) và báo chính quyền địa phương.
• Không quay lại khu vực sạt lở khi chưa được phép.`
  },
  {
    id: 'fire-escape',
    icon: '🔥',
    title: 'Thoát hiểm khi xảy ra hỏa hoạn',
    link: 'http://canhsatpccc.gov.vn/',
    linkLabel: 'Cục Cảnh sát PCCC và CNCH',
    answer: `KHI PHÁT HIỆN LỬA:
• Hô to "CHÁY!" để cảnh báo mọi người xung quanh.
• Nhấn nút báo cháy hoặc gọi 114 (PCCC).

TRONG TRƯỜNG HỢP KHÓI DÀY:
• Cúi thấp, bò sát mặt đất — khói độc nổi lên trên.
• Dùng khăn ướt che miệng mũi.
• Sờ tay vào cửa trước khi mở — nếu nóng có nghĩa là phía sau đang có lửa.

KHI KHÔNG THỂ THOÁT:
• Đến cửa sổ, vẫy tín hiệu kêu cứu.
• Nhét vải ướt vào khe cửa để chặn khói.
• Đợi lực lượng cứu hộ.`
  },
  {
    id: 'robbery',
    icon: '⚠️',
    title: 'Xử lý khi bị cướp hoặc trấn lột',
    link: 'https://bocongan.gov.vn/',
    linkLabel: 'Cổng thông tin Bộ Công an',
    answer: `TRONG LÚC BỊ CƯỚP:
• Không chống cự nếu kẻ cướp có vũ khí — tài sản không đáng bằng tính mạng.
• Nhớ đặc điểm nhận dạng: quần áo, màu xe, biển số.

SAU KHI BỊ CƯỚP:
• Gọi 113 (Cảnh sát) ngay lập tức.
• Không dọn dẹp hiện trường, để nguyên bằng chứng.
• Ghi lại thời gian, địa điểm, mô tả sự việc.
• Báo cáo với khách sạn/cơ sở lưu trú nếu đang đi du lịch.

PHÒNG NGỪA:
• Không đeo đồ trang sức đắt tiền ở nơi đông người.
• Giữ điện thoại trong túi khi đi trên đường.
• Đi theo nhóm, tránh đường vắng về đêm.`
  },
];

// ─── Chỉ số AQI giả lập ────────────────────────────────────────
function getAqiLevel(aqi) {
  if (aqi <= 50) return { label: 'Tốt', color: '#22c55e', desc: 'Không khí trong lành, phù hợp cho mọi hoạt động ngoài trời.' };
  if (aqi <= 100) return { label: 'Trung bình', color: '#f59e0b', desc: 'Nhạy cảm có thể bị ảnh hưởng nhẹ. Người hen suyễn nên hạn chế ra ngoài lâu.' };
  if (aqi <= 150) return { label: 'Không tốt', color: '#f97316', desc: 'Nhóm nhạy cảm bị ảnh hưởng. Hạn chế hoạt động ngoài trời kéo dài.' };
  if (aqi <= 200) return { label: 'Xấu', color: '#ef4444', desc: 'Mọi người có thể bị ảnh hưởng. Tránh ra ngoài nếu không cần thiết.' };
  return { label: 'Rất xấu', color: '#7c3aed', desc: 'Tình trạng nguy hiểm sức khỏe. Ở trong nhà, đóng cửa sổ.' };
}

function getUvLevel(uv) {
  if (uv <= 2) return { label: 'Thấp', color: '#22c55e' };
  if (uv <= 5) return { label: 'Trung bình', color: '#f59e0b' };
  if (uv <= 7) return { label: 'Cao', color: '#f97316' };
  if (uv <= 10) return { label: 'Rất cao', color: '#ef4444' };
  return { label: 'Cực cao', color: '#7c3aed' };
}

export default function SafetyHub() {
  const [activeTab, setActiveTab] = useState('weather');
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCoords, setSearchCoords] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searching, setSearching] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast3day, setForecast3day] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Vị trí mặc định: TP. Hồ Chí Minh
  const DEFAULT_COORDS = { lat: 10.7769, lng: 106.7009 };
  const DEFAULT_NAME = 'TP. Hồ Chí Minh';

  // Lấy vị trí người dùng khi vào trang
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setUserCoords({ lat, lng });
          setGeoLoading(false);
          // Reverse geocode
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            setLocationName(data.address?.city || data.address?.town || data.address?.county || 'Vị trí hiện tại');
          } catch { setLocationName('Vị trí hiện tại'); }
        },
        () => {
          // Không có quyền GPS → dùng Hà Nội mặc định, không hiện lỗi
          setGeoLoading(false);
          setUserCoords(DEFAULT_COORDS);
          setLocationName(DEFAULT_NAME);
        },
        { timeout: 8000 }
      );
    } else {
      // Trình duyệt không hỗ trợ → dùng Hà Nội mặc định
      setUserCoords(DEFAULT_COORDS);
      setLocationName(DEFAULT_NAME);
    }
  }, []);

  // Lấy thời tiết khi có tọa độ (hoặc khi tìm kiếm)
  const fetchWeatherData = useCallback(async (lat, lng) => {
    setLoadingWeather(true);
    try {
      const data = await fetchWeatherAlert(lat, lng);
      setWeather(data);
      // Lấy thêm dự báo 3 ngày
      const params = new URLSearchParams({
        latitude: lat, longitude: lng,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max',
        forecast_days: 3,
        timezone: 'Asia/Ho_Chi_Minh',
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (res.ok) {
        const d = await res.json();
        const days = d.daily.time.map((t, i) => ({
          date: t,
          code: d.daily.weathercode[i],
          tempMax: Math.round(d.daily.temperature_2m_max[i]),
          tempMin: Math.round(d.daily.temperature_2m_min[i]),
          rain: d.daily.precipitation_sum[i],
          wind: Math.round(d.daily.windspeed_10m_max[i]),
          uv: d.daily.uv_index_max?.[i] ?? 0,
        }));
        setForecast3day(days);
      }
    } catch { setWeather(null); }
    setLoadingWeather(false);
  }, []);

  useEffect(() => {
    if (userCoords) fetchWeatherData(userCoords.lat, userCoords.lng);
  }, [userCoords, fetchWeatherData]);

  // Tìm kiếm địa điểm
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setSearchCoords(coords);
        setSearchName(display_name.split(',').slice(0, 2).join(', '));
        setGeoError(''); // Xóa lỗi cũ khi tìm kiếm thành công
        fetchWeatherData(coords.lat, coords.lng);
      } else {
        setGeoError('Không tìm thấy địa điểm. Thử tên khác nhé!');
      }
    } catch { setGeoError('Lỗi tìm kiếm. Vui lòng thử lại.'); }
    setSearching(false);
  };

  const WMO_ICONS = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌦️', 63: '🌧️', 65: '🌧️',
    80: '🌦️', 81: '🌧️', 82: '🌧️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
  };
  const WMO_LABELS = {
    0: 'Quang đãng', 1: 'Phần lớn quang', 2: 'Có mây rải rác', 3: 'Nhiều mây',
    45: 'Sương mù', 51: 'Mưa phùn nhẹ', 53: 'Mưa phùn', 55: 'Mưa phùn dày',
    61: 'Mưa nhẹ', 63: 'Mưa vừa', 65: 'Mưa to', 80: 'Mưa rào nhẹ',
    81: 'Mưa rào', 82: 'Mưa rào to', 95: 'Giông sét', 96: 'Giông + mưa đá', 99: 'Giông lớn',
  };

  const activeCoords = searchCoords || userCoords;
  const activeName = searchName || locationName;

  // Giả lập AQI và UV (trong thực tế nên có API riêng)
  const fakeAqi = weather?.current ? Math.round(30 + weather.current.rain * 5 + Math.random() * 20) : null;
  const fakeUv = weather?.current?.uv ?? null;

  const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <div className="sh-page">
      {/* ── Sidebar ── */}
      <aside className="sh-sidebar">
        <div className="sh-sidebar-logo">
          <span className="sh-sidebar-icon">🛡️</span>
          <span className="sh-sidebar-brand">An toàn du lịch</span>
        </div>
        <nav className="sh-sidebar-nav">
          <button
            className={`sh-nav-item ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <span className="sh-nav-icon">🌤️</span>
            <div>
              <div className="sh-nav-label">Thời tiết</div>
              <div className="sh-nav-sub">Chất lượng không khí · UV · Dự báo 3 ngày</div>
            </div>
          </button>
          <button
            className={`sh-nav-item ${activeTab === 'handbook' ? 'active' : ''}`}
            onClick={() => setActiveTab('handbook')}
          >
            <span className="sh-nav-icon">📖</span>
            <div>
              <div className="sh-nav-label">Cẩm nang sự cố</div>
              <div className="sh-nav-sub">Hướng dẫn xử lý tình huống khẩn cấp</div>
            </div>
          </button>
        </nav>
        <div className="sh-sidebar-footer">
          <p>Hotline khẩn cấp</p>
          <a href="tel:113" className="sh-emergency-btn police">🚓 Cảnh sát 113</a>
          <a href="tel:115" className="sh-emergency-btn ambulance">🚑 Cấp cứu 115</a>
          <a href="tel:114" className="sh-emergency-btn fire">🚒 PCCC 114</a>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="sh-main">

        {/* ======== TAB THỜI TIẾT ======== */}
        {activeTab === 'weather' && (
          <div className="sh-content">
            <div className="sh-content-header">
              <h1>🌤️ Thời tiết &amp; Môi trường</h1>
              <p>Theo dõi thời tiết, chất lượng không khí và dự báo 3 ngày tại vị trí bạn chọn.</p>
            </div>

            {/* Thanh tìm kiếm */}
            <form className="sh-search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm... (VD: Đà Lạt, Hội An, Hà Nội)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="sh-search-input"
              />
              <button type="submit" className="sh-search-btn" disabled={searching}>
                {searching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>

            {geoError && <div className="sh-error-msg">⚠️ {geoError}</div>}

            {geoLoading && (
              <div className="sh-loading-card">
                <div className="sh-spinner" />
                <p>Đang lấy vị trí của bạn...</p>
              </div>
            )}

            {loadingWeather && (
              <div className="sh-loading-card">
                <div className="sh-spinner" />
                <p>Đang tải dữ liệu thời tiết...</p>
              </div>
            )}

            {weather && !loadingWeather && (
              <>
                <div className="sh-location-tag">
                  📍 {activeName || 'Vị trí hiện tại'}
                  {activeCoords && (
                    <span className="sh-coords-mini">{activeCoords.lat.toFixed(4)}°N, {activeCoords.lng.toFixed(4)}°E</span>
                  )}
                </div>

                {/* Thẻ thời tiết hiện tại */}
                <div className={`sh-weather-main ${weather.hasAlert ? (weather.severity === 'severe' ? 'severe' : 'warning') : 'good'}`}>
                  <div className="sh-weather-left">
                    <div className="sh-weather-icon-big">{weather.current?.icon ?? '🌡️'}</div>
                    <div className="sh-weather-temp">{weather.current?.temp ?? '--'}°C</div>
                    <div className="sh-weather-label">{weather.current?.label ?? 'Không rõ'}</div>
                  </div>
                  <div className="sh-weather-right">
                    <div className="sh-weather-stat">
                      <span className="sh-stat-icon">💨</span>
                      <div>
                        <div className="sh-stat-val">{weather.current?.wind ?? '--'} km/h</div>
                        <div className="sh-stat-lbl">Tốc độ gió</div>
                      </div>
                    </div>
                    <div className="sh-weather-stat">
                      <span className="sh-stat-icon">🌧️</span>
                      <div>
                        <div className="sh-stat-val">{weather.current?.rain ?? 0} mm</div>
                        <div className="sh-stat-lbl">Lượng mưa</div>
                      </div>
                    </div>
                    {fakeAqi !== null && (
                      <div className="sh-weather-stat">
                        <span className="sh-stat-icon">🌫️</span>
                        <div>
                          <div className="sh-stat-val" style={{ color: getAqiLevel(fakeAqi).color }}>AQI {fakeAqi}</div>
                          <div className="sh-stat-lbl">{getAqiLevel(fakeAqi).label}</div>
                        </div>
                      </div>
                    )}
                    {fakeUv !== null && (
                      <div className="sh-weather-stat">
                        <span className="sh-stat-icon">☀️</span>
                        <div>
                          <div className="sh-stat-val" style={{ color: getUvLevel(fakeUv).color }}>UV {fakeUv}</div>
                          <div className="sh-stat-lbl">{getUvLevel(fakeUv).label}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chất lượng không khí & UV */}
                {(fakeAqi !== null || fakeUv !== null) && (
                  <div className="sh-env-cards">
                    {fakeAqi !== null && (
                      <div className="sh-env-card">
                        <div className="sh-env-header">
                          <span>🌫️ Chất lượng không khí</span>
                          <span className="sh-env-badge" style={{ background: getAqiLevel(fakeAqi).color }}>{getAqiLevel(fakeAqi).label}</span>
                        </div>
                        <div className="sh-aqi-bar">
                          <div className="sh-aqi-fill" style={{ width: `${Math.min(fakeAqi / 300 * 100, 100)}%`, background: getAqiLevel(fakeAqi).color }} />
                        </div>
                        <div className="sh-aqi-scale">
                          <span>0</span><span>50</span><span>100</span><span>150</span><span>200+</span>
                        </div>
                        <p className="sh-env-desc">{getAqiLevel(fakeAqi).desc}</p>
                      </div>
                    )}
                    {fakeUv !== null && (
                      <div className="sh-env-card">
                        <div className="sh-env-header">
                          <span>☀️ Chỉ số tia UV hôm nay</span>
                          <span className="sh-env-badge" style={{ background: getUvLevel(fakeUv).color }}>{getUvLevel(fakeUv).label}</span>
                        </div>
                        <div className="sh-uv-gauge">
                          <div className="sh-uv-track">
                            <div className="sh-uv-fill" style={{ width: `${Math.min(fakeUv / 12 * 100, 100)}%`, background: getUvLevel(fakeUv).color }} />
                          </div>
                          <span className="sh-uv-value">{fakeUv}</span>
                        </div>
                        <p className="sh-env-desc">
                          {fakeUv <= 2 && 'Không cần kem chống nắng.'}
                          {fakeUv > 2 && fakeUv <= 5 && 'Bôi kem chống nắng SPF 30+ khi ra ngoài.'}
                          {fakeUv > 5 && fakeUv <= 7 && 'Đội nón, mặc áo chống UV, SPF 30+ bắt buộc.'}
                          {fakeUv > 7 && 'Nguy hiểm — hạn chế ra ngoài 10:00–14:00, SPF 50+ bắt buộc.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dự báo theo giờ hôm nay */}
                {weather.forecast?.length > 0 && (
                  <div className="sh-section">
                    <h2 className="sh-section-title">Dự báo theo giờ hôm nay</h2>
                    <div className="sh-hourly-strip">
                      {weather.forecast.map((h, i) => (
                        <div key={i} className="sh-hourly-item">
                          <div className="sh-hourly-time">{formatHour(h.time)}</div>
                          <div className="sh-hourly-icon">{WMO_ICONS[h.code] ?? '🌡️'}</div>
                          <div className="sh-hourly-temp">{h.temp}°</div>
                          {h.rain > 0 && <div className="sh-hourly-rain">💧{h.rain}mm</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dự báo 3 ngày */}
                {forecast3day.length > 0 && (
                  <div className="sh-section">
                    <h2 className="sh-section-title">Dự báo 3 ngày tới</h2>
                    <div className="sh-daily-grid">
                      {forecast3day.map((day, i) => {
                        const d = new Date(day.date);
                        const name = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : dayNames[d.getDay()];
                        return (
                          <div key={i} className="sh-daily-card">
                            <div className="sh-daily-name">{name}</div>
                            <div className="sh-daily-date">{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                            <div className="sh-daily-icon">{WMO_ICONS[day.code] ?? '🌡️'}</div>
                            <div className="sh-daily-label">{WMO_LABELS[day.code] ?? 'Không rõ'}</div>
                            <div className="sh-daily-temp">
                              <span className="sh-temp-max">{day.tempMax}°</span>
                              <span className="sh-temp-min">{day.tempMin}°</span>
                            </div>
                            <div className="sh-daily-meta">
                              {day.rain > 0 && <span>💧 {day.rain}mm</span>}
                              <span>💨 {day.wind}km/h</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {!weather && !loadingWeather && !geoLoading && (
              <div className="sh-empty">
                <div className="sh-empty-icon">🌍</div>
                <h3>Chưa có dữ liệu thời tiết</h3>
                <p>Hãy cho phép truy cập vị trí hoặc tìm kiếm địa điểm bên trên.</p>
              </div>
            )}
          </div>
        )}

        {/* ======== TAB CẨM NANG ======== */}
        {activeTab === 'handbook' && (
          <div className="sh-content">
            <div className="sh-content-header">
              <h1>📖 Cẩm nang xử lý sự cố</h1>
              <p>Hướng dẫn xử lý nhanh các tình huống khẩn cấp thường gặp khi du lịch.</p>
            </div>

            <div className="sh-faq-list">
              {HANDBOOK.map((item) => (
                <div key={item.id} className={`sh-faq-item ${openFaq === item.id ? 'open' : ''}`}>
                  <div className="sh-faq-row">
                    <div className="sh-faq-left">
                      <span className="sh-faq-icon">{item.icon}</span>
                      <div>
                        <div className="sh-faq-title">{item.title}</div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sh-faq-link"
                          onClick={e => e.stopPropagation()}
                        >
                          🔗 {item.linkLabel} ↗
                        </a>
                      </div>
                    </div>
                    <button
                      className="sh-faq-toggle"
                      onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    >
                      {openFaq === item.id ? '▲ Đóng lại' : '▼ Xem hướng dẫn'}
                    </button>
                  </div>

                  {openFaq === item.id && (
                    <div className="sh-faq-answer">
                      <pre className="sh-faq-text">{item.answer}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="sh-contacts-section">
              <h2 className="sh-section-title">📞 Số điện thoại khẩn cấp tại Việt Nam</h2>
              <div className="sh-contacts-grid">
                {[  
                  { icon: '🚓', num: '113', label: 'Cảnh sát', desc: 'An ninh, trật tự' },
                  { icon: '🚑', num: '115', label: 'Cấp cứu', desc: 'Y tế khẩn cấp' },
                  { icon: '🚒', num: '114', label: 'PCCC', desc: 'Phòng cháy chữa cháy' },
                  { icon: '🆘', num: '112', label: 'Khẩn cấp', desc: 'Tổng đài khẩn cấp quốc gia' },
                ].map(c => (
                  <a key={c.num} href={`tel:${c.num.replace(/\D/g, '')}`} className="sh-contact-card">
                    <span className="sh-contact-icon">{c.icon}</span>
                    <div className="sh-contact-num">{c.num}</div>
                    <div className="sh-contact-label">{c.label}</div>
                    <div className="sh-contact-desc">{c.desc}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
