import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { interests, budgets } from '../../data/mockData.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './Onboarding.css'

const interestIcons = {
  'explore': '🗺️',
  'photo': '📸',
  'food': '🍜',
  'quiet': '🧘',
  'busy': '🍻',
  'adventure': '🧗',
}

const budgetIcons = {
  'save': '🎒',
  'mid': '💼',
  'high': '💎',
}

export default function Onboarding() {
  const [step, setStep] = useState(0) // 0=intro, 1=interests, 2=budget
  const [selectedInterests, setSelectedInterests] = useState([])
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { savePreferences } = useAuth()

  const totalSteps = 2 // step 0, 1, 2 = 3 pages, but step 2 is final
  const progressPercent = step === 0 ? 0 : (step / totalSteps) * 100

  const toggleInterest = (id) => {
    setSelectedInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const handleContinue = async () => {
    if (step === 0) { setStep(1); return }
    if (step === 1) { setStep(2); return }

    setSaving(true)
    const result = await savePreferences({ interests: selectedInterests, budget: selectedBudget })
    setSaving(false)
    if (!result.ok) {
      console.error('Failed to save onboarding preferences:', result.msg)
    }
    navigate('/')
  }

  return (
    <div className="ob">
      <div className="ob__bg" />
      {/* Continuous Progress Bar */}
      <div className="ob__progress-container">
        <div className="ob__progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      {step === 0 ? (
        <div className="ob__full-intro">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
            alt="Beach"
            className="ob__full-intro-img"
          />
          <div className="ob__full-intro-overlay" />
          <div className="ob__full-intro-content">
            <h2 className="ob__full-intro-title">Bắt đầu hành trình của bạn.</h2>
            <p className="ob__subtitle" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }}>Chúng tôi sẽ hỏi bạn một vài câu hỏi để thiết kế lịch trình hoàn hảo nhất dành riêng cho bạn.</p>
            <div className="ob__actions" style={{ flexDirection: 'row', gap: '24px', marginTop: '32px' }}>
              <button className="btn btn-purple ob__intro-btn" onClick={handleContinue}>Bắt đầu ngay</button>
              <button className="ob__skip" style={{ color: 'rgba(255,255,255,0.8)' }} onClick={() => navigate('/')}>Bỏ qua</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="ob__card">
          {step === 1 && (
          <div className="ob__step">
            <div>
              <h2 className="ob__title">Điều gì làm bạn <span>hứng thú?</span></h2>
              <p className="ob__subtitle">Chọn các chủ đề bạn yêu thích để chúng tôi gợi ý những địa điểm phù hợp.</p>
            </div>
            
            <div className="ob__grid">
              {interests.map(item => {
                const isActive = selectedInterests.includes(item.id)
                return (
                  <div
                    key={item.id}
                    style={{ position: 'relative' }}
                    className={`ob__chip ${isActive ? 'ob__chip--active' : ''}`}
                    onClick={() => toggleInterest(item.id)}
                  >
                    {isActive && <div className="ob__check">✓</div>}
                    <span className="ob__chip-icon">{interestIcons[item.id] || '✨'}</span>
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="ob__actions">
              <button className="btn btn-purple ob__next" onClick={handleContinue} disabled={selectedInterests.length === 0}>
                Tiếp tục
              </button>
              <button className="ob__skip" onClick={() => navigate('/')}>Bỏ qua</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob__step">
            <div>
              <h2 className="ob__title">Mức <span>ngân sách</span> của bạn?</h2>
              <p className="ob__subtitle">Hãy chọn mức chi phí dự kiến cho mỗi người trong chuyến đi này.</p>
            </div>
            
            <div className="ob__budget-grid">
              {budgets.map(b => {
                const isActive = selectedBudget === b.id
                return (
                  <div
                    key={b.id}
                    style={{ position: 'relative' }}
                    className={`ob__chip ob__chip--wide ${isActive ? 'ob__chip--active' : ''}`}
                    onClick={() => setSelectedBudget(b.id)}
                  >
                    {isActive && <div className="ob__check">✓</div>}
                    <span className="ob__chip-icon">{budgetIcons[b.id] || '💰'}</span>
                    <span>{b.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="ob__actions">
              <button className="btn btn-purple ob__next" onClick={handleContinue} disabled={!selectedBudget || saving}>
                {saving ? 'Đang lưu...' : 'Hoàn tất'}
              </button>
              <button className="ob__skip" onClick={() => setStep(1)}>
                ← Quay lại sở thích
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}