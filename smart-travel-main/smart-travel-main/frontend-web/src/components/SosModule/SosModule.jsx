import React, { useState, useRef, useEffect } from 'react';
import './SosModule.css';

export default function SosModule({ lat, lng }) {
  // 'IDLE' | 'CONFIRMING' | 'BROADCASTING'
  const [sosState, setSosState] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  
  const holdTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const HOLD_DURATION = 3000; // 3 seconds
  const UPDATE_INTERVAL = 50;

  // Cleanup timers on unmount or state change
  useEffect(() => {
    return () => {
      clearTimeout(holdTimerRef.current);
      clearInterval(progressTimerRef.current);
    };
  }, []);

  const handleHoldStart = (e) => {
    // Prevent default to avoid text selection or drag issues during hold
    if (e.type !== 'touchstart') {
      e.preventDefault();
    }
    
    setProgress(0);
    const startTime = Date.now();

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressTimerRef.current);
        handleHoldComplete();
      }
    }, UPDATE_INTERVAL);
  };

  const handleHoldEnd = () => {
    clearInterval(progressTimerRef.current);
    if (progress < 100) {
      setProgress(0);
    }
  };

  const handleHoldComplete = () => {
    setSosState('BROADCASTING');
    setProgress(100);
  };

  return (
    <>
      {/* 1. Floating SOS Button */}
      {sosState === 'IDLE' && (
        <div className="sos-floating-container">
          <button 
            className="sos-floating-btn"
            onClick={() => setSosState('CONFIRMING')}
            aria-label="SOS Yêu cầu cứu hộ khẩn cấp"
          >
            SOS
          </button>
        </div>
      )}

      {/* 2. SOS Modal (Xác nhận & Phát tín hiệu) */}
      {sosState !== 'IDLE' && (
        <div className="sos-modal-backdrop">
          <div className="sos-modal">
            
            {sosState === 'CONFIRMING' && (
              <div className="sos-modal-content confirming">
                <div className="sos-icon-large warning">⚠️</div>
                <h2 className="sos-title">Bạn đang gặp tình huống nguy hiểm?</h2>
                <p className="sos-desc">Hệ thống sẽ lập tức gửi tọa độ hiện tại của bạn đến người thân và các số điện thoại khẩn cấp.</p>
                
                <div className="sos-action-area">
                  <button 
                    className="sos-hold-btn"
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={handleHoldStart}
                    onTouchEnd={handleHoldEnd}
                  >
                    <div className="sos-progress-bar" style={{ width: `${progress}%` }}></div>
                    <span className="sos-hold-text">
                      {progress > 0 && progress < 100 ? 'Đang xác nhận...' : 'Nhấn và giữ 3 giây để gửi'}
                    </span>
                  </button>
                  <button 
                    className="sos-cancel-btn"
                    onClick={() => { setSosState('IDLE'); setProgress(0); }}
                  >
                    Hủy bỏ / Bấm nhầm
                  </button>
                </div>
              </div>
            )}

            {sosState === 'BROADCASTING' && (
              <div className="sos-modal-content broadcasting">
                <div className="sos-radar-container">
                  <div className="sos-radar-ring ring-1"></div>
                  <div className="sos-radar-ring ring-2"></div>
                  <div className="sos-radar-ring ring-3"></div>
                  <div className="sos-icon-large danger">SOS</div>
                </div>
                
                <h2 className="sos-title blink">Đang phát tín hiệu cấp cứu...</h2>
                
                <div className="sos-gps-box">
                  <p className="sos-gps-label">Hãy đọc tọa độ này nếu bạn đang gọi cảnh sát:</p>
                  <div className="sos-gps-coords">
                    {lat ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'Đang lấy tọa độ GPS...'}
                  </div>
                </div>

                <div className="sos-quick-calls">
                  <a href="tel:113" className="sos-call-btn police">
                    🚓 Cảnh sát (113)
                  </a>
                  <a href="tel:115" className="sos-call-btn ambulance">
                    🚑 Cấp cứu (115)
                  </a>
                </div>

                <button 
                  className="sos-safe-btn"
                  onClick={() => { setSosState('IDLE'); setProgress(0); }}
                >
                  Đã an toàn / Dừng phát tín hiệu
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}
