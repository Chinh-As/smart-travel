/**
 * ChatBot.jsx — Mr. Roboto AI assistant
 * Connects to backend POST /api/v1/chat (Gemini AI with Function Calling)
 * Falls back to local knowledge base when backend is unavailable
 */
import React, { useState, useRef, useEffect } from 'react'
import API_BASE_URL from '../../services/apiConfig.js'
import { destinations } from '../../data/mockData.js'
import SearchCard from '../SearchCard/SearchCard.jsx'
import { transformPlaceToDestination } from '../../services/dataTransformers.js'
import './ChatBot.css'

// ── Smart local knowledge base ────────────────────────────────────────────────
function smartReply(text) {
  const t = text.toLowerCase()
  const found = destinations.filter(d =>
    d.title.toLowerCase().includes(t) || d.city.toLowerCase().includes(t) || d.category.toLowerCase().includes(t)
  )
  if (found.length > 0) {
    const d = found[0]
    return `📍 **${d.title}**\n⏰ Giờ mở cửa: ${d.openHours}\n💰 Giá vào cửa: ${d.priceLabel}\n⭐ Đánh giá: ${d.rating}/5 — Phù hợp ${d.suitability}%\n📌 ${d.location}`
  }
  if (t.includes('hcm') || t.includes('hồ chí minh') || t.includes('sài gòn'))
    return '🏙️ **TP.HCM** gợi ý:\n• Chợ Bến Thành (miễn phí)\n• Bưu Điện Thành Phố (10k)\n• Nhà Hát Thành Phố (60k)\n• Bảo tàng Chứng tích (40k)\n• Phố Bùi Viện về đêm (miễn phí)'
  if (t.includes('đà lạt') || t.includes('dalat'))
    return '🌸 **Đà Lạt** — thành phố ngàn hoa\n• Khí hậu: 18-22°C quanh năm\n• Chi phí: 1-2 triệu/ngày\n• Đặc sản: cà phê, bánh mì xíu mại\n• Điểm đến: Hồ Xuân Hương, Cáp treo Datanla'
  if (t.includes('hội an') || t.includes('hoi an'))
    return '✨ **Hội An** — Di sản UNESCO\n• Vé phố cổ: 120k/người\n• Đèn lồng đẹp nhất đêm Rằm\n• Đặc sản: Cao Lầu, Mì Quảng, Bánh Mì Phượng\n• Nên đi bộ hoặc thuê xe đạp'
  if (t.includes('phú quốc'))
    return '🏖️ **Phú Quốc** — Đảo ngọc\n• Bay từ HCM: ~1 tiếng, 500k-1tr\n• Bãi Sao, Bãi Dài đẹp nhất\n• Hải sản tươi ngon, giá hợp lý\n• Mùa đẹp: tháng 11 - tháng 3'
  if (t.includes('hạ long'))
    return '🌊 **Vịnh Hạ Long** — Kỳ quan UNESCO\n• Tour 2N1Đ: ~2-3 triệu/người\n• Hoạt động: kayak, lặn biển, chèo thuyền\n• Mùa đẹp: tháng 5-9\n• Nên đặt tour có bao gồm bữa ăn'
  if (t.includes('tiết kiệm') || t.includes('rẻ') || t.includes('chi phí') || t.includes('budget'))
    return '💰 **Mẹo tiết kiệm**\n• Đặt vé sớm 2-3 tuần\n• Ăn ở quán vỉa hè & chợ địa phương\n• Đi Grab/xe buýt thay taxi\n• Ở hostel hoặc homestay\n• Tránh lễ Tết (giá tăng 2-3 lần)'
  if (t.includes('ăn') || t.includes('đặc sản') || t.includes('ẩm thực') || t.includes('món'))
    return '🍜 **Ẩm thực Việt Nam phải thử**\n• Phở bò Hà Nội — bữa sáng kinh điển\n• Bánh mì — 15-25k, ngon nhất thế giới\n• Bún bò Huế — cay và đậm đà\n• Gỏi cuốn — tươi, thanh mát\n• Cà phê trứng Hà Nội — độc đáo!'
  if (t.includes('đi đâu') || t.includes('gợi ý') || t.includes('recommend'))
    return '🗺️ **Top điểm đến nổi bật**\n• TP.HCM — sôi động, nhiều điểm tham quan\n• Đà Lạt — mát mẻ, lãng mạn ❤️\n• Phú Quốc — biển đẹp nhất Việt Nam\n• Hội An — phố cổ, đèn lồng đẹp\n• Vịnh Hạ Long — kỳ quan thiên nhiên\n\nBạn thích biển, núi hay phố cổ?'
  if (t.includes('xin chào') || t.includes('hello') || t.includes('hi ') || t.startsWith('hi') || t.includes('chào'))
    return 'Chào bạn! 😊 Mình có thể giúp gì cho bạn?\n• Tìm địa điểm tham quan\n• Gợi ý lịch trình\n• Thông tin ẩm thực\n• Mẹo du lịch tiết kiệm'
  if (t.includes('cảm ơn') || t.includes('thanks') || t.includes('tks'))
    return 'Không có gì! 😊 Chúc bạn có chuyến đi thật vui và đáng nhớ! ✈️🌟'
  if (t.includes('thời tiết') || t.includes('weather') || t.includes('mưa'))
    return '🌤️ **Thời tiết theo vùng**\n• TP.HCM: 28-35°C, mưa tháng 5-11\n• Đà Lạt: 15-25°C mát quanh năm\n• Hà Nội: 4 mùa rõ rệt (đông rét)\n• Phú Quốc: đẹp nhất tháng 11-4'
  return '🤔 Mình chưa có thông tin về câu hỏi này.\nBạn có thể hỏi về:\n• Địa điểm: "Gợi ý địa điểm TP.HCM"\n• Chi phí: "Chi phí du lịch Đà Lạt"\n• Ẩm thực: "Đặc sản Hội An"\n• Mẹo: "Mẹo du lịch tiết kiệm"'
}
// ─────────────────────────────────────────────────────────────────────────────

const BOT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=roboto&backgroundColor=6C63FF'

const INIT_MSG = {
  id: 0, role: 'bot',
  text: 'Chào bạn! 👋 Mình là Mr. Roboto — trợ lý du lịch của Smart Travel.\nMình sẽ giúp bạn trả lời mọi thắc mắc về du lịch Việt Nam nhé!',
}

const QUICK = [
  { label: 'Địa điểm HCM', text: 'Gợi ý địa điểm tham quan ở TP.HCM' },
  { label: 'Chi phí Đà Lạt', text: 'Chi phí du lịch Đà Lạt bao nhiêu?' },
  { label: 'Đi đâu cuối tuần?', text: 'Cuối tuần nên đi đâu chơi gần?' },
  { label: 'Ẩm thực ngon', text: 'Các món ăn ngon phải thử ở Việt Nam' },
]

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('smart_travel_chat_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (err) {
        console.error('Failed to parse chat history:', err)
      }
    }
    return [INIT_MSG]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  // Lưu lịch sử vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    localStorage.setItem('smart_travel_chat_history', JSON.stringify(messages))
  }, [messages])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 200); return () => clearTimeout(t) }, [])

  const addBot = (text, places = []) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'bot', text, places }])

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      // Build conversation history for backend (Lọc bỏ các câu báo lỗi để không đưa vào context cho AI)
      const history = messages
        .filter(m => m.id !== 0 && !m.text?.startsWith('Xin lỗi') && !m.text?.startsWith('🤔'))
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text || '' }))

      // Lấy tọa độ GPS từ sessionStorage (đã được lưu sẵn khi user vào trang chủ)
      let location = null
      try {
        const stored = sessionStorage.getItem('user_location')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.lat && parsed.lng) {
            location = { lat: parsed.lat, lng: parsed.lng }
          }
        }
      } catch (e) {
        console.warn('Không thể đọc GPS từ sessionStorage', e)
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, location }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const reply = data.reply || 'Xin lỗi, tôi không thể trả lời lúc này.'
      addBot(reply, data.places || [])
    } catch (err) {
      console.error('ChatBot API request failed:', err)
      // Backend không available → dùng local knowledge base
      await new Promise(r => setTimeout(r, 700))
      addBot(smartReply(text))
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="cb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cb">

        {/* Header */}
        <div className="cb__head">
          <div className="cb__bot-info">
            <img src={BOT_AVATAR} alt="Mr. Roboto" className="cb__avatar" />
            <div>
              <div className="cb__name">Mr. Roboto</div>
              <div className="cb__status"><span className="cb__dot" />AI đang hoạt động</div>
            </div>
          </div>
          <div className="cb__head-btns">
            <button className="cb__icon-btn" onClick={() => {
              setMessages([INIT_MSG])
              localStorage.removeItem('smart_travel_chat_history')
            }} title="Xóa chat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="cb__icon-btn" onClick={onClose} title="Đóng">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="cb__msgs-wrapper">
          <div className="cb__msgs">
            {messages.map(m => (
              <React.Fragment key={m.id}>
                <div className={`cb__msg cb__msg--${m.role}`}>
                  {m.role === 'bot' && <img src={BOT_AVATAR} alt="bot" className="cb__msg-av" />}
                  <div className="cb__bubble">
                    {(m.text || '').split('\n').map((line, i, arr) => (
                      <React.Fragment key={i}>
                        <span className={line.startsWith('•') ? 'cb__li' : ''}>{line}</span>
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {m.places && m.places.length > 0 && (
                  <div className="cb__places-carousel">
                    {m.places.map(p => {
                      const dest = transformPlaceToDestination(p)
                      return <SearchCard key={dest.id || dest.place_id} destination={dest} />
                    })}
                  </div>
                )}
              </React.Fragment>
            ))}
            {loading && (
              <div className="cb__msg cb__msg--bot">
                <img src={BOT_AVATAR} alt="bot" className="cb__msg-av" />
                <div className="cb__typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Quick replies */}
        {messages.length <= 1 && (
          <div className="cb__quick">
            <p className="cb__quick-label">Câu hỏi gợi ý</p>
            <div className="cb__quick-grid">
              {QUICK.map((q, i) => (
                <button key={i} className="cb__quick-btn" onClick={() => sendMessage(q.text)} disabled={loading}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="cb__input-area">
          <input
            ref={inputRef}
            className="cb__input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Hỏi về du lịch Việt Nam..."
            disabled={loading}
          />
          <button
            className={`cb__send ${input.trim() && !loading ? 'active' : ''}`}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? <span className="cb__spin" /> : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l6-6v4h6v4H8v4L2 8z" fill="currentColor" /></svg>}
          </button>
        </div>

      </div>
    </div>
  )
}
