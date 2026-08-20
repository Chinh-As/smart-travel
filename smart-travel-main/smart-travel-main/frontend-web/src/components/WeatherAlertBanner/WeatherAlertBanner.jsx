import React, { useState, useEffect } from 'react';
import { fetchWeatherAlert, formatHour } from '../../services/weatherApi';
import './WeatherAlertBanner.css';

/**
 * WeatherAlertBanner — Luôn hiển thị trong Sidebar của Trip.
 * - Trời tốt: banner xanh, có thể xem chi tiết dự báo
 * - Thời tiết xấu: banner cam/đỏ + cảnh báo chi tiết
 */
export default function WeatherAlertBanner({ lat, lng, destName, onSearchNearby }) {
  const [weather, setWeather] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false); // chỉ ẩn phần cảnh báo/ghi ý

  useEffect(() => {
    if (!lat || !lng) return;
    let cancelled = false;
    fetchWeatherAlert(lat, lng).then(result => {
      if (!cancelled) setWeather(result);
    });
    const interval = setInterval(() => {
      fetchWeatherAlert(lat, lng).then(result => {
        if (!cancelled) setWeather(result);
      });
    }, 10 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [lat, lng]);

  // Không render nếu chưa có tọa độ
  if (!lat || !lng) return null;

  // Trạng thái đang tải
  if (!weather) {
    return (
      <div className="weather-alert-banner weather-alert--loading">
        <div className="weather-alert-header">
          <div className="weather-alert-left">
            <span className="weather-alert-icon">🌡️</span>
            <div className="weather-alert-headline">
              <span className="weather-alert-badge">THỜI TIẾT KHU VỰC</span>
              <p className="weather-alert-title">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { hasAlert, severity, current, forecast, alerts } = weather;
  const isSevere = severity === 'severe';
  const isGood = !hasAlert && current?.good;

  // Tổng hợp thời gian cảnh báo (nếu có)
  const timeRange = alerts?.length > 1
    ? `${formatHour(alerts[0].time)} - ${formatHour(alerts[alerts.length - 1].time)}`
    : alerts?.[0] ? formatHour(alerts[0].time) : '';

  const uniqueAlertLabels = [...new Set(alerts?.map(a => a.label) || [])];

  return (
    <div className={`weather-alert-banner ${
      isGood ? 'weather-alert--good' :
      isSevere ? 'weather-alert--severe' :
      hasAlert ? 'weather-alert--warning' :
      'weather-alert--neutral'
    }`}>
      {/* ── Header (luôn hiển thị) ── */}
      <div className="weather-alert-header" onClick={() => setExpanded(v => !v)}>
        <div className="weather-alert-left">
          <span className="weather-alert-icon" aria-hidden="true">
            {current?.icon || '🌡️'}
          </span>
          <div className="weather-alert-headline">
            <span className="weather-alert-badge">
              {isSevere ? 'CẢNH BÁO KHU VỰC' :
               hasAlert ? 'LƯU Ý THỜI TIẾT' :
               'THỜI TIẾT KHU VỰC'}
            </span>
            <p className="weather-alert-title">
              {current?.label || 'Đang cập nhật'}
              {current?.temp != null && (
                <span className="weather-alert-temp"> · {current.temp}°C</span>
              )}
            </p>
          </div>
        </div>

        <div className="weather-alert-right">
          <button
            className="weather-alert-toggle"
            aria-expanded={expanded}
            aria-label={expanded ? 'Thu gọn' : 'Xem thời tiết'}
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          >
            <span className="weather-alert-toggle-text">
              {expanded ? 'Thu gọn' : 'Xem chi tiết'}
            </span>
            <svg
              className={`weather-alert-chevron ${expanded ? 'expanded' : ''}`}
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Accordion Body ── */}
      <div className={`weather-alert-body ${expanded ? 'open' : ''}`}>
        <div className="weather-alert-body-inner">

          {/* Tiêu đề chi tiết */}
          <div className="weather-alert-detail-title">
            {hasAlert
              ? `⛈️ ${uniqueAlertLabels.join(' & ')}`
              : `${current?.icon} Dự báo thời tiết hôm nay`}
          </div>

          {/* Thông tin hiện tại */}
          <div className="weather-alert-meta">
            {current?.temp != null && (
              <div className="weather-alert-meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>
                <span>Nhiệt độ hiện tại: <strong>{current.temp}°C</strong></span>
              </div>
            )}
            {current?.wind != null && (
              <div className="weather-alert-meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>
                <span>Gió: <strong>{current.wind} km/h</strong></span>
              </div>
            )}
            {hasAlert && timeRange && (
              <div className="weather-alert-meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Dự kiến: <strong>{timeRange}</strong></span>
              </div>
            )}
            <div className="weather-alert-meta-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Khu vực <strong>{destName || 'điểm đến'}</strong></span>
            </div>
          </div>

          {/* Dự báo theo giờ */}
          {forecast?.length > 0 && (
            <div className="weather-forecast-strip">
              {forecast.slice(0, 6).map((f, i) => (
                <div key={i} className={`weather-forecast-item ${f.severe ? 'forecast-severe' : ''}`}>
                  <span className="forecast-hour">{formatHour(f.time)}</span>
                  <span className="forecast-icon">{f.icon}</span>
                  <span className="forecast-temp">{f.temp}°</span>
                </div>
              ))}
            </div>
          )}

          {/* Gợi ý nếu có cảnh báo và chưa bỏ qua */}
          {hasAlert && !alertDismissed && (
            <div className="weather-alert-tips">
              <p className="weather-alert-tips-label">💡 Gợi ý chuẩn bị</p>
              <ul className="weather-alert-tips-list">
                <li>🌂 Mang theo áo mưa hoặc ô dù</li>
                {isSevere && <li>⚡ Tránh khu vực trống trải khi có sấm sét</li>}
                {(alerts?.[0]?.rain > 10) && <li>🚗 Một số tuyến đường có thể kẹt xe hoặc ngập nhẹ</li>}
                {(alerts?.[0]?.wind > 30) && <li>🌬️ Gió mạnh, cẩn thận khi di chuyển bằng xe máy</li>}
              </ul>
            </div>
          )}

          {/* Nút hành động mở rộng dựa trên thời tiết */}
          <div className="weather-alert-actions">
            
            {/* 1. Hành động khi thời tiết xấu */}
            {hasAlert && !alertDismissed && (
              <>
                <button
                  className="weather-alert-btn weather-alert-btn--primary"
                  onClick={() => { setExpanded(false); if (onSearchNearby) onSearchNearby('cafe'); }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Tìm quán cafe trú mưa gần nhất
                </button>
                <button
                  className="weather-alert-btn weather-alert-btn--ghost"
                  onClick={() => { setAlertDismissed(true); }}
                >
                  Bỏ qua gợi ý
                </button>
              </>
            )}

            {/* 2. Hành động khi trời đẹp */}
            {isGood && (
              <button
                className="weather-alert-btn weather-alert-btn--primary"
                style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
                onClick={() => { setExpanded(false); if (onSearchNearby) onSearchNearby('địa điểm tham quan ngoài trời'); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                Tìm địa điểm tham quan
              </button>
            )}

            {/* 3. Nút đóng chung */}
            {(!hasAlert || alertDismissed) && (
              <button
                className="weather-alert-btn weather-alert-btn--close"
                onClick={() => setExpanded(false)}
              >
                Thu gọn thời tiết
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
