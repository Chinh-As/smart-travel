import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Camera, X, ScanLine, MapPin, ArrowRight, RotateCcw, ImagePlus, AlertCircle, Navigation2, Image as ImageIcon, Sparkles, Eye, Lightbulb, Search } from 'lucide-react'
import { recognizeLandmark, isAiEnabled } from '../../services/landmarkEngine.js'
import './LandmarkRecognition.css'

// Nhãn mô tả cách engine nhận ra địa điểm
const METHOD_LABEL = {
  gps:    { icon: <Navigation2 size={14} />, text: 'Định vị qua GPS trong ảnh' },
  visual: { icon: <ImageIcon size={14} />,   text: 'Phân tích & so khớp hình ảnh' },
  ai:     { icon: <Sparkles size={14} />,     text: 'Nhận diện bằng AI Vision' },
}
const CONF_LABEL = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' }

// Khối hiển thị "dấu hiệu nhận biết" + "có thể là" mà AI suy luận ra
function AiInsights({ aiInfo }) {
  if (!aiInfo) return null
  const hasCues = aiInfo.cues && aiInfo.cues.length > 0
  const hasAlts = aiInfo.alternatives && aiInfo.alternatives.length > 0
  if (!hasCues && !hasAlts) return null
  return (
    <div className="lmk-insights">
      {hasCues && (
        <div className="lmk-cues">
          <div className="lmk-cues__label"><Eye size={14} /> Dấu hiệu nhận biết</div>
          <div className="lmk-cues__list">
            {aiInfo.cues.map((c, i) => <span key={i} className="lmk-cue">{c}</span>)}
          </div>
        </div>
      )}
      {hasAlts && (
        <div className="lmk-alts">
          <div className="lmk-cues__label"><Lightbulb size={14} /> Khả năng khác</div>
          <div className="lmk-cues__list">
            {aiInfo.alternatives.map((a, i) => (
              <span key={i} className="lmk-alt">{a.name}{a.city ? ` · ${a.city}` : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LandmarkRecognition() {
  const navigate = useNavigate()
  const aiEnabled = isAiEnabled()
  const [mode, setMode] = useState(null)          // 'upload' | 'camera'
  const [previewSrc, setPreviewSrc] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)      // { found, method, confidence, dest, distanceKm, score, aiInfo }
  const [cameraError, setCameraError] = useState('')
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => () => stopCamera(), [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const reset = () => {
    stopCamera()
    setMode(null)
    setPreviewSrc(null)
    setResult(null)
    setScanning(false)
    setCameraError('')
    setError('')
  }

  // Chạy nhận diện trên một File ảnh
  const runRecognition = async (file) => {
    setScanning(true)
    setResult(null)
    setError('')
    try {
      const res = await recognizeLandmark(file)
      setResult(res)
    } catch (err) {
      console.error('Recognition error:', err)
      setError('Không thể phân tích ảnh. Vui lòng thử lại với ảnh khác.')
    } finally {
      setScanning(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewSrc(URL.createObjectURL(file))
    setMode('upload')
    setResult(null)
    runRecognition(file)
  }

  const startCamera = async () => {
    setMode('camera')
    setResult(null)
    setPreviewSrc(null)
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      setCameraError('Không thể truy cập camera. Vui lòng cấp quyền hoặc thử tải ảnh lên.')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      setPreviewSrc(URL.createObjectURL(file))
      stopCamera()
      runRecognition(file)
    }, 'image/jpeg', 0.9)
  }

  const found = result?.found
  const dest = result?.dest
  const method = result && METHOD_LABEL[result.method]

  return (
    <div className="lmk-page">
      <div className="container">
        <div className="lmk-header">
          <div className="lmk-header__icon"><ScanLine size={28} strokeWidth={1.8} /></div>
          <h1 className="lmk-title">Nhận diện địa danh</h1>
          <p className="lmk-sub">Tải ảnh lên hoặc chụp trực tiếp — công cụ sẽ phân tích vị trí (GPS) và hình ảnh để cho biết bạn đang ở địa danh nào</p>
          <div className={`lmk-tier lmk-tier--${aiEnabled ? 'ai' : 'local'}`}>
            {aiEnabled
              ? <><Sparkles size={14} /> Đang bật AI Vision — độ chính xác cao nhất</>
              : <><ImageIcon size={14} /> Chế độ engine cục bộ (GPS + so khớp ảnh)</>}
          </div>
        </div>

        {!mode && (
          <div className="lmk-options">
            <button className="lmk-option" onClick={() => fileInputRef.current?.click()}>
              <div className="lmk-option__icon"><ImagePlus size={32} strokeWidth={1.8} /></div>
              <h3>Thêm ảnh / file</h3>
              <p>Chọn ảnh từ thư viện hoặc tệp có sẵn trên thiết bị của bạn</p>
              <span className="lmk-option__cta"><Upload size={16} /> Chọn ảnh</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="lmk-hidden-input" onChange={handleFileChange} />

            <button className="lmk-option" onClick={startCamera}>
              <div className="lmk-option__icon"><Camera size={32} strokeWidth={1.8} /></div>
              <h3>Dùng camera</h3>
              <p>Mở camera thiết bị để chụp trực tiếp địa điểm xung quanh bạn</p>
              <span className="lmk-option__cta"><Camera size={16} /> Mở camera</span>
            </button>
          </div>
        )}

        {mode === 'camera' && (
          <div className="lmk-stage">
            <div className="lmk-camera-wrap">
              {cameraError ? (
                <div className="lmk-camera-error"><p>{cameraError}</p></div>
              ) : !previewSrc ? (
                <video ref={videoRef} className="lmk-camera-video" playsInline muted />
              ) : (
                <img src={previewSrc} alt="Ảnh chụp" className="lmk-preview-img" />
              )}
            </div>
            <div className="lmk-actions">
              {!previewSrc && !cameraError && (
                <button className="btn btn-purple" onClick={capturePhoto}><Camera size={18} /> Chụp ảnh</button>
              )}
              <button className="btn btn-outline" onClick={reset}><X size={18} /> Hủy</button>
            </div>
          </div>
        )}

        {mode === 'upload' && previewSrc && (
          <div className="lmk-stage">
            <div className="lmk-camera-wrap">
              <img src={previewSrc} alt="Ảnh đã chọn" className="lmk-preview-img" />
            </div>
            <div className="lmk-actions">
              <button className="btn btn-outline" onClick={reset}><RotateCcw size={18} /> Chọn ảnh khác</button>
            </div>
          </div>
        )}

        {scanning && (
          <div className="lmk-scanning">
            <div className="lmk-scanning__spinner" />
            <p>Đang phân tích vị trí và hình ảnh...</p>
          </div>
        )}

        {error && !scanning && (
          <div className="lmk-error fade-in-up">
            <AlertCircle size={20} />
            <p>{error}</p>
            <button className="btn btn-outline" onClick={reset}>Thử lại</button>
          </div>
        )}

        {/* Có kết quả khớp trong dữ liệu */}
        {!scanning && !error && found && dest && (
          <div className="lmk-result fade-in-up">
            <h3>Kết quả nhận diện</h3>
            <div className={`lmk-confidence lmk-confidence--${result.confidence}`}>
              <span className="lmk-method">{method?.icon} {method?.text}</span>
              <span> · Độ tin cậy: {CONF_LABEL[result.confidence]}</span>
              {result.method === 'gps' && typeof result.distanceKm === 'number' && (
                <span> · Cách vị trí ảnh ~{result.distanceKm < 1 ? Math.round(result.distanceKm * 1000) + ' m' : result.distanceKm.toFixed(1) + ' km'}</span>
              )}
              {result.method === 'visual' && typeof result.score === 'number' && (
                <span> · Độ giống hình ảnh: {result.score}%</span>
              )}
            </div>
            <div className="lmk-result__card">
              <img src={dest.image} alt={dest.title} className="lmk-result__img" />
              <div className="lmk-result__info">
                <h4>{dest.title}</h4>
                <div className="lmk-result__loc"><MapPin size={14} /> {dest.location}</div>
                <p className="lmk-result__overview">{dest.overview}</p>
                <AiInsights aiInfo={result.aiInfo} />
                <div className="lmk-result__btns">
                  <button className="btn btn-purple" onClick={() => navigate(`/destination/${dest.id}`)}>
                    Xem chi tiết <ArrowRight size={16} />
                  </button>
                  <button className="btn btn-outline" onClick={reset}><RotateCcw size={16} /> Nhận diện ảnh khác</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI nhận ra nhưng không có trong dữ liệu */}
        {!scanning && !error && found && !dest && result.aiInfo && (
          <div className="lmk-result fade-in-up">
            <h3>Kết quả nhận diện</h3>
            <div className="lmk-result__card lmk-result__card--ai-only">
              <div className="lmk-result__ai-icon"><MapPin size={32} /></div>
              <div className="lmk-result__info">
                <h4>{result.aiInfo.name}</h4>
                <div className="lmk-result__loc"><MapPin size={14} /> {result.aiInfo.address || result.aiInfo.city}</div>
                <p className="lmk-result__overview">{result.aiInfo.description}</p>
                <div className={`lmk-confidence lmk-confidence--${result.confidence}`}>
                  Độ tin cậy: {CONF_LABEL[result.confidence] || 'Trung bình'}
                </div>
                <AiInsights aiInfo={result.aiInfo} />
                <div className="lmk-result__btns">
                  <button className="btn btn-outline" onClick={() => navigate(`/search?q=${encodeURIComponent(result.aiInfo.name)}`)}>
                    <Search size={16} /> Tìm kiếm địa danh
                  </button>
                  <button className="btn btn-outline" onClick={reset}><RotateCcw size={16} /> Nhận diện ảnh khác</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Không nhận diện được */}
        {!scanning && !error && result && !found && (
          <div className="lmk-result lmk-result--not-found fade-in-up">
            <h3>Kết quả nhận diện</h3>
            <div className="lmk-not-found">
              <AlertCircle size={40} />
              <h4>Chưa nhận diện được địa điểm</h4>
              <p>Hãy thử ảnh chụp thẳng vào công trình/biển hiệu, hoặc ảnh có gắn vị trí (GPS) để cho kết quả chính xác hơn.</p>
              {result.aiInfo && (result.aiInfo.cues?.length > 0 || result.aiInfo.alternatives?.length > 0) && (
                <div className="lmk-not-found__insights">
                  <AiInsights aiInfo={result.aiInfo} />
                </div>
              )}
              <button className="btn btn-purple" onClick={reset}><RotateCcw size={16} /> Thử ảnh khác</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
