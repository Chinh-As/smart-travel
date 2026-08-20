/**
 * Itinerary.jsx - Smart Travel Itinerary with Conflict Management
 * Premium UI using the 4-color design system tokens.
 */
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../context/TripContext.jsx'
import { destinations } from '../../data/mockData.js'
import { TIME_SLOTS, groupByDayAndSlot, getSlotDefaults } from '../../constants/timeSlots.jsx'
import { itineraryService } from '../../services/itineraryService.js'
import { transformPlaceToDestination } from '../../services/dataTransformers.js'
import { useRequireAuth } from '../../hooks/useRequireAuth.js'
import Favorites from '../Favorites/Favorites.jsx'
import './Itinerary.css'

const AI_SCHEDULE = [
  { day: 1, slot: 'MORNING',   start: '08:00', end: '10:30' },
  { day: 1, slot: 'NOON',      start: '11:30', end: '13:00' },
  { day: 1, slot: 'AFTERNOON', start: '14:00', end: '16:30' },
  { day: 1, slot: 'EVENING',   start: '18:00', end: '20:00' },
  { day: 2, slot: 'MORNING',   start: '08:00', end: '10:30' },
  { day: 2, slot: 'AFTERNOON', start: '14:00', end: '16:30' },
]

function toMin(t) { if (!t) return 0; const [h,m] = t.split(':').map(Number); return h*60+m }
function toTime(m) { return `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}` }
function getSlotFromTime(t) {
  if (!t) return 'MORNING'
  const hr = Math.floor(toMin(t) / 60)
  if (hr >= 17) return 'EVENING'
  if (hr >= 13) return 'AFTERNOON'
  if (hr >= 11) return 'NOON'
  return 'MORNING'
}

function generateFromPrompt(prompt, list) {
  const t = prompt.toLowerCase()
  let f = [...list]
  if (t.includes('biển') || t.includes('beach')) f = f.filter(d => d.categories.includes('beach') || d.categories.includes('nature'))
  else if (t.includes('lịch sử') || t.includes('bảo tàng')) f = f.filter(d => d.categories.includes('history') || d.categories.includes('museum'))
  else if (t.includes('ăn') || t.includes('ẩm thực')) f = f.filter(d => d.categories.includes('food') || d.categories.includes('culture'))
  else if (t.includes('miễn phí') || t.includes('rẻ')) f = f.filter(d => d.price === 0)
  const picks = f.length >= 2 ? f.slice(0, 6) : list.slice(0, 6)
  return picks.map((dest, i) => ({ ...dest, day: AI_SCHEDULE[i%AI_SCHEDULE.length].day, timeSlot: AI_SCHEDULE[i%AI_SCHEDULE.length].slot, startTime: AI_SCHEDULE[i%AI_SCHEDULE.length].start, endTime: AI_SCHEDULE[i%AI_SCHEDULE.length].end, note: '' }))
}

// SVG icon components (monochrome, black & white)
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconNav = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconNote = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function Itinerary() {
  const { itinerary, addToItinerary, removeFromItinerary, updateItineraryNote, updateItineraryItem, removeDayFromItinerary } = useTrip()
  const navigate = useNavigate()
  const requireAuth = useRequireAuth()
  const [tab, setTab] = useState('my')
  const [aiList, setAiList] = useState([])
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editSlot, setEditSlot] = useState('')
  const [activeConflict, setActiveConflict] = useState(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [activeDay, setActiveDay] = useState(1)
  const [extraDays, setExtraDays] = useState(0)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const handleRemoveDay = (dayToDelete, e) => {
    e.stopPropagation()
    if (window.confirm(`Bạn có chắc muốn xóa Ngày ${dayToDelete} và toàn bộ hoạt động trong ngày này? Các ngày sau sẽ được đẩy lên.`)) {
      removeDayFromItinerary(dayToDelete)
      if (extraDays >= dayToDelete) {
        setExtraDays(prev => Math.max(0, prev - 1))
      }
      setActiveDay(Math.max(1, dayToDelete - 1))
      showToast(`✓ Đã xóa Ngày ${dayToDelete}`)
    }
  }

  const conflicts = useMemo(() => {
    const map = {}
    const dayGroups = {}
    itinerary.forEach(item => { const d = item.day||1; if(!dayGroups[d]) dayGroups[d]=[]; dayGroups[d].push(item) })
    Object.values(dayGroups).forEach(items => {
      for (let i=0; i<items.length; i++) for (let j=i+1; j<items.length; j++) {
        const a=items[i], b=items[j]
        if (toMin(a.startTime) < toMin(b.endTime) && toMin(b.startTime) < toMin(a.endTime)) {
          if (!map[a.id]) map[a.id]=[]; if (!map[b.id]) map[b.id]=[]
          map[a.id].push(b); map[b.id].push(a)
        }
      }
    })
    return map
  }, [itinerary])

  const conflictCount = Object.keys(conflicts).length

  const handleAutoStagger = (a, b) => {
    const newStart = toMin(a.endTime) + 15
    const dur = toMin(b.endTime) - toMin(b.startTime)
    const hr = Math.floor(newStart/60)
    let slot = 'MORNING'
    if (hr >= 11 && hr < 13) slot = 'NOON'
    else if (hr >= 13 && hr < 17) slot = 'AFTERNOON'
    else if (hr >= 17) slot = 'EVENING'
    updateItineraryItem(b.id, { startTime: toTime(newStart), endTime: toTime(newStart+dur), timeSlot: slot })
    setActiveConflict(null)
    showToast(`✓ ${b.title} chuyển sang ${toTime(newStart)} – ${toTime(newStart+dur)}`)
  }

  const handleSwap = (a, b) => {
    const sa=a.startTime, ea=a.endTime, sla=a.timeSlot
    updateItineraryItem(a.id, { startTime: b.startTime, endTime: b.endTime, timeSlot: b.timeSlot })
    updateItineraryItem(b.id, { startTime: sa, endTime: ea, timeSlot: sla })
    setActiveConflict(null)
    showToast('✓ Đã đổi chỗ thời gian thành công')
  }

  const handleMoveToDay = (item, newDay) => {
    updateItineraryItem(item.id, { day: newDay })
    setActiveConflict(null)
    showToast(`✓ Đã chuyển ${item.title} sang Ngày ${newDay}`)
  }

  const handleAutoSchedule = () => {
    if (itinerary.length === 0) return
    const SLOT_ORDER = ['MORNING', 'NOON', 'AFTERNOON', 'EVENING']
    const SLOT_LIMITS = {
      MORNING:   { startMin: 6*60,  endMin: 11*60 },
      NOON:      { startMin: 11*60, endMin: 13*60 },
      AFTERNOON: { startMin: 13*60, endMin: 17*60 },
      EVENING:   { startMin: 17*60, endMin: 22*60 },
    }
    const GAP = 15 // phút đệm giữa các hoạt động
    // Sắp xếp hoạt động theo ngày hiện tại, sau đó theo buổi
    const sorted = [...itinerary].sort((a, b) => {
      const dayDiff = (a.day || 1) - (b.day || 1)
      if (dayDiff !== 0) return dayDiff
      return SLOT_ORDER.indexOf(a.timeSlot) - SLOT_ORDER.indexOf(b.timeSlot)
    })
    let dayNum = 1
    let slotIdx = 0
    let curTime = SLOT_LIMITS[SLOT_ORDER[0]].startMin
    sorted.forEach(item => {
      const dur = (item.startTime && item.endTime && toMin(item.endTime) > toMin(item.startTime))
        ? toMin(item.endTime) - toMin(item.startTime)
        : 90
      // Nếu không vừa vào slot hiện tại, chuyển sang slot tiếp
      while (curTime + dur > SLOT_LIMITS[SLOT_ORDER[slotIdx]].endMin) {
        slotIdx++
        if (slotIdx >= SLOT_ORDER.length) {
          slotIdx = 0
          dayNum++
        }
        curTime = SLOT_LIMITS[SLOT_ORDER[slotIdx]].startMin
      }
      updateItineraryItem(item.id, {
        day: dayNum,
        timeSlot: SLOT_ORDER[slotIdx],
        startTime: toTime(curTime),
        endTime: toTime(curTime + dur),
      })
      curTime += dur + GAP
    })
    const newTotalDays = dayNum
    if (newTotalDays > extraDays) setExtraDays(newTotalDays)
    setActiveDay(1)
    showToast(`✓ Đã điều chỉnh tự động: ${sorted.length} hoạt động trải đều trên ${newTotalDays} ngày`)
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditStart(item.startTime || '')
    setEditEnd(item.endTime || '')
    setEditSlot(item.timeSlot || '')
    setEditNote(item.note || '')
  }

  const saveEdit = (id) => {
    if (!editStart || !editEnd) {
      showToast('⚠️ Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc')
      return
    }
    if (toMin(editEnd) <= toMin(editStart)) {
      showToast('⚠️ Giờ kết thúc phải sau giờ bắt đầu')
      return
    }
    const autoSlot = getSlotFromTime(editStart)
    updateItineraryItem(id, {
      startTime: editStart,
      endTime: editEnd,
      timeSlot: autoSlot,
      note: editNote
    })
    setEditingId(null)
    showToast('✓ Đã cập nhật lịch trình thành công')
  }

  const handleGenerateAI = async () => {
    if (!requireAuth()) return
    if (generating) return
    setGenerating(true); setAiList([])

    // If no prompt entered, use a broad default — auto mode
    const effectivePrompt = aiPrompt.trim() || 'cafe, sightseeing, food, history'

    try {
      const candidates = await itineraryService.getGenerateCandidates({
        keyword: aiPrompt.trim(),
        size: 10,
      })
      if (candidates.length === 0) throw new Error('No candidate places found')

      const today = new Date()
      const date = [
        String(today.getDate()).padStart(2, '0'),
        String(today.getMonth() + 1).padStart(2, '0'),
        today.getFullYear(),
      ].join('-')
      const generated = await itineraryService.generateItinerary({
        date,
        slots: [
          { startTime: '08:00', endTime: '11:00' },
          { startTime: '11:30', endTime: '13:00' },
          { startTime: '14:00', endTime: '17:00' },
          { startTime: '18:00', endTime: '21:00' },
        ],
        candidatePlaceIds: candidates.map(place => place.id),
        visitDurationMinutes: 90,
        bufferMinutes: 15,
        maxPlaces: 6,
      })
      const transformed = (generated.items || []).map(item => {
        const destination = transformPlaceToDestination(item.place)
        return {
          ...destination,
          id: item.placeId,
          title: item.placeName || destination.title,
          day: 1,
          timeSlot: getSlotFromTime(item.startTime),
          startTime: item.startTime?.slice(0, 5),
          endTime: item.endTime?.slice(0, 5),
          note: item.note || '',
        }
      })
      if (!transformed || transformed.length === 0) throw new Error('No API results');
      setAiList(transformed);
    } catch (err) {
      console.error('Itinerary API failed, fallback to mock', err);
      setTimeout(() => { setAiList(generateFromPrompt(effectivePrompt, destinations)); setGenerating(false) }, 1500)
      return
    }
    setGenerating(false)
  }

  const handleSaveAIClick = () => {
    if (itinerary.length > 0) {
      setShowSaveDialog(true)
    } else {
      saveAI('merge')
    }
  }

  const saveAI = (mode) => {
    let offset = 0
    if (mode === 'append' && itinerary.length > 0) {
      offset = Math.max(...itinerary.map(i => i.day || 1))
    }
    aiList.forEach(d => addToItinerary(d, d.timeSlot, (d.day || 1) + offset))
    setAiList([])
    setAiPrompt('')
    setTab('my')
    setShowSaveDialog(false)
    showToast('✓ Đã lưu lịch trình AI thành công')
  }


  const displayList = tab === 'ai' ? aiList : itinerary
  const grouped = groupByDayAndSlot(displayList)
  const totalDays = Math.max(1, ...displayList.map(i => i.day || 1), extraDays)

  return (
    <div className="it">
      {toast && (
        <div className={`it-toast fade-in ${toast.startsWith('⚠️') ? 'it-toast--warn' : ''}`}>
          {toast.startsWith('⚠️') ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1 14h14L8 1z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="0.5"/>
              <path d="M8 6v4M8 11.5h.01" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill="#22C55E"/>
              <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span>{toast}</span>
        </div>
      )}

      <div className="container">
        <div className="it-grid">
          <div className="it-main">
            {/* Tabs */}
            <div className="it-tabs">
              <button className={`it-tabs__btn ${tab==='my'?'is-active':''}`} onClick={() => setTab('my')}>
                Lịch trình của tôi
                {conflictCount > 0 && <span className="it-tabs__count">{conflictCount/2|0}</span>}
              </button>
              <button className={`it-tabs__btn ${tab==='ai'?'is-active':''}`} onClick={() => setTab('ai')}>
                Tạo lịch trình AI
              </button>
              <button className={`it-tabs__btn ${tab==='fav'?'is-active':''}`} onClick={() => setTab('fav')}>
                Yêu thích
              </button>
            </div>

            {/* Favorites */}
            {tab==='fav' && (
              <div style={{ padding: '24px' }}>
                <Favorites asTab={true} />
              </div>
            )}

            {/* AI Panel */}
            {tab==='ai' && (
              <div className="it-ai">
                <div className="it-ai__head">
                  <h3>Trợ lý AI lập lịch trình</h3>
                  <p className="caption">Chọn nhanh chủ đề hoặc mô tả yêu cầu bên dưới — bỏ trống để AI tự chọn</p>
                </div>

                {/* Chips — placed ABOVE the textarea */}
                <div className="it-ai__chips">
                  {['Lịch sử & Bảo tàng','Ẩm thực & Khám phá','Miễn phí hoặc rẻ','Thiên nhiên & Biển','Mua sắm & Giải trí'].map(c => (
                    <button
                      key={c}
                      className={`it-ai__chip ${aiPrompt.includes(c) ? 'is-active' : ''}`}
                      onClick={() => setAiPrompt(p => {
                        if (p.includes(c)) return p.replace(', ' + c, '').replace(c + ', ', '').replace(c, '').trim()
                        return p ? p + ', ' + c : c
                      })}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <textarea
                  className="it-ai__input"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="(Tuỳ chọn) Mô tả thêm: số ngày, ngân sách, phong cách du lịch..."
                  rows={3}
                />

                {aiList.length > 0 && !generating && (
                  <div className="it-ai__result">
                    <span>AI gợi ý {aiList.length} địa điểm cho {grouped.length} ngày</span>
                  </div>
                )}

                <div className="it-ai__go-row">
                  <button
                    className="btn btn-purple it-ai__go"
                    onClick={aiList.length > 0 && !generating ? handleSaveAIClick : handleGenerateAI}
                    disabled={generating}
                  >
                    {generating ? 'Đang tạo lịch trình...' : aiList.length > 0 ? 'Lưu lịch trình' : 'Tạo lịch trình'}
                  </button>
                  {aiList.length > 0 && !generating && (
                    <button className="btn btn-outline" onClick={() => setAiList([])}>
                      Tạo lại
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty */}
            {displayList.length===0 && tab!=='fav' && tab!=='ai' && (
              <div className="it-empty">
                <div className="it-empty__icon">
                  <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="6" width="32" height="36" rx="4" stroke="#D1D5DB" strokeWidth="2"/>
                    <path d="M16 18h16M16 24h12M16 30h8" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="36" cy="36" r="8" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <path d="M36 33v6M33 36h6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Chưa có lịch trình</h3>
                <p>Bắt đầu bằng cách thêm địa điểm hoặc để AI hỗ trợ lập kế hoạch</p>
                <div className="it-empty__actions">
                  <button className="btn btn-outline" onClick={tab === 'ai' ? handleGenerateAI : () => setTab('ai')} disabled={tab === 'ai' && generating}>
                    {tab === 'ai' && generating ? 'Đang lập lịch trình...' : 'Tạo lịch trình AI'}
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/')}>Khám phá địa điểm</button>
                </div>
              </div>
            )}

            {/* Timeline */}
            {displayList.length > 0 && tab !== 'fav' && (
              <div className="itin__list">
                {conflictCount > 0 && tab === 'my' && (
                  <div className="it-alert fade-in">
                    <div className="it-alert__icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2L1 18h18L10 2z" stroke="#ef4444" strokeWidth="1.5" fill="rgba(239,68,68,0.08)"/>
                        <path d="M10 8v4M10 14h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <strong>Phát hiện {conflictCount/2|0} xung đột thời gian</strong>
                      <p>Một số hoạt động có thời gian trùng lặp. Nhấn "Xử lý" trên thẻ để điều chỉnh.</p>
                    </div>
                  </div>
                )}

                {/* Day Tabs */}
                <div className="itin__day-tabs">
                {Array.from({length: totalDays}).map((_, i) => {
                    const dNum = i + 1;
                    const count = displayList.filter(item => (item.day||1) === dNum).length;
                    const dayItems = displayList.filter(item => (item.day||1) === dNum);
                    const hasConflictInDay = dayItems.some(item => !!conflicts[item.id]);
                    return (
                      <button 
                        key={dNum} 
                        className={`itin__day-tab ${activeDay === dNum ? 'is-active' : ''} ${hasConflictInDay ? 'itin__day-tab--conflict' : 'itin__day-tab--ok'}`}
                        onClick={() => setActiveDay(dNum)}
                      >
                        <IconCalendar /> Ngày {dNum}
                        {activeDay === dNum && (
                          <span className="itin__day-tab-count">{count} hoạt động</span>
                        )}
                        {dNum > 1 && (
                          <span className="itin__day-tab-del" onClick={(e) => handleRemoveDay(dNum, e)}>
                            ✕
                          </span>
                        )}
                      </button>
                    )
                  })}
                  <button className="itin__day-tab itin__day-tab--add" onClick={() => {
                    const nextDay = totalDays + 1;
                    setExtraDays(nextDay);
                    setActiveDay(nextDay);
                  }}>
                    + Thêm ngày mới
                  </button>
                  {tab === 'my' && displayList.filter(item => (item.day||1) === activeDay).some(item => !!conflicts[item.id]) && (
                    <button className="itin__auto-btn" onClick={handleAutoSchedule}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Điều chỉnh tự động
                    </button>
                  )}
                </div>


                {(() => {
                  const day = grouped.find(g => g.dayNumber === activeDay) || { dayNumber: activeDay, slots: {} }
                  return (
                    <div className="itin__day">
                      {TIME_SLOTS.map(slot => {
                        const slotItems = day.slots[slot.id] || []
                        return (
                        <div key={slot.id} className="itin__slot">
                          <div className="itin__slot-header">
                            <span className="itin__slot-icon-svg">{slot.svgIcon}</span>
                            <span className="itin__slot-label">{slot.label}</span>
                            <span className="itin__slot-range">{slot.range}</span>
                            {slotItems.length > 0 && <span className="itin__slot-count">{slotItems.length}</span>}
                          </div>

                          <div className="itin__slot-body">
                            {slotItems.length > 0 ? slotItems.map((item, idx) => {
                              const hasConflict = !!conflicts[item.id]
                              const conflicting = conflicts[item.id] || []
                              return (
                                <React.Fragment key={item.id + '-' + idx}>
                                  <div
                                    className={`itin__item fade-in-up ${hasConflict ? 'itin__item--conflict' : ''}`}
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                  >
                                    {hasConflict && <div className="it-card__pulse"><span/></div>}

                                    <div className="itin__item-img">
                                      <img src={item.image} alt={item.title} loading="lazy" />
                                    </div>

                                    <div className="itin__item-body">
                                      <div className="itin__item-time">
                                        <IconClock />
                                        <span>{item.startTime || slot.defaultStart}</span>
                                        <span className="itin__item-time-sep">–</span>
                                        <span>{item.endTime || slot.defaultEnd}</span>
                                      </div>

                                      <h3
                                        className="itin__item-name"
                                        onClick={() => navigate(`/destination/${item.id}`)}
                                      >
                                        {item.title}
                                      </h3>

                                      <div className="itin__item-loc">
                                        <IconPin /> {item.location}
                                      </div>

                                      {hasConflict ? (
                                        <span className="it-card__conflict-tag">
                                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{display:'inline',verticalAlign:'-1px',marginRight:'3px'}}>
                                            <path d="M6 1L1 11h10L6 1z" stroke="currentColor" strokeWidth="1.2"/>
                                            <path d="M6 5v2.5M6 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                          </svg>
                                          Trùng giờ với {conflicting.map(c => c.title).join(', ')}
                                        </span>
                                      ) : (
                                        <div className="itin__item-price">
                                          {item.price === 0 ? 'Miễn phí' : `Từ ${new Intl.NumberFormat('vi-VN').format(item.priceDetail?.adult || item.price)} đ`}
                                        </div>
                                      )}

                                      <div className="itin__item-actions">
                                        {hasConflict && (
                                          <button className="it-btn it-btn--resolve" onClick={() => setActiveConflict({itemA:item,itemB:conflicting[0]})}>
                                            Xử lý
                                          </button>
                                        )}
                                        <button className="itin__action-btn" onClick={() => navigate(`/destination/${item.id}`)}>
                                          <IconEye /> Chi tiết
                                        </button>
                                        <button className="itin__action-btn itin__action-btn--go" onClick={() => navigate(`/trip/${item.id}`)}>
                                          <IconNav /> Đi ngay
                                        </button>
                                        <button className="itin__action-btn itin__action-btn--edit" onClick={() => startEdit(item)}>
                                          <IconEdit /> Sửa
                                        </button>
                                        {tab === 'my' && (
                                          <button className="itin__action-btn itin__action-btn--del" onClick={() => removeFromItinerary(item.id)}>
                                            <IconTrash /> Xóa
                                          </button>
                                        )}
                                      </div>

                                      {editingId === item.id && (
                                        <div className="itin__edit-panel">
                                          <div className="itin__edit-row">
                                            <label>Buổi</label>
                                            <select
                                              value={editSlot}
                                              onChange={e => {
                                                const s = e.target.value
                                                setEditSlot(s)
                                                const def = getSlotDefaults(s)
                                                setEditStart(def.startTime)
                                                setEditEnd(def.endTime)
                                              }}
                                              className="itin__edit-input"
                                            >
                                              {TIME_SLOTS.map(s => <option key={s.id} value={s.id}>{s.label} ({s.range})</option>)}
                                            </select>
                                          </div>
                                          <div className="itin__edit-row">
                                            <label>Bắt đầu</label>
                                            <input
                                              type="time"
                                              value={editStart}
                                              onChange={e => {
                                                const t = e.target.value
                                                setEditStart(t)
                                                setEditSlot(getSlotFromTime(t))
                                              }}
                                              className="itin__edit-input"
                                            />
                                          </div>
                                          <div className="itin__edit-row">
                                            <label>Kết thúc</label>
                                            <input type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="itin__edit-input" />
                                          </div>
                                          <div className="itin__edit-row">
                                            <label>Ghi chú</label>
                                            <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)} className="itin__edit-input" placeholder="Ghi chú..." />
                                          </div>
                                          <div className="itin__edit-btns">
                                            <button className="btn btn-primary" onClick={() => saveEdit(item.id)}>Lưu</button>
                                            <button className="btn btn-outline" onClick={() => setEditingId(null)}>Hủy</button>
                                          </div>
                                        </div>
                                      )}

                                      {item.note && editingId !== item.id && (
                                        <div className="itin__item-note">
                                          <IconNote /> {item.note}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </React.Fragment>
                              )
                            }) : (
                              <div className="itin__slot-empty">
                                <button onClick={() => navigate('/search')}>
                                  + Thêm hoạt động buổi {slot.label.toLowerCase()}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

                <button className="itin__add-btn" onClick={() => navigate('/search')}>
                  + Thêm địa điểm mới vào lịch trình
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Resolution Drawer */}
      {activeConflict && (
        <div className="it-overlay" onClick={() => setActiveConflict(null)}>
          <div className="it-drawer fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="it-drawer__head">
              <div>
                <span className="it-drawer__badge">XUNG ĐỘT</span>
                <h3>Xử lý trùng lặp lịch trình</h3>
                <p className="caption">Chọn cách giải quyết phù hợp nhất</p>
              </div>
              <button className="it-drawer__close" onClick={() => setActiveConflict(null)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="it-drawer__body">
              <div className="it-compare">
                <div className="it-compare__card it-compare__card--a">
                  <span className="it-compare__label">Hoạt động A</span>
                  <h4>{activeConflict.itemA.title}</h4>
                  <span className="it-compare__time">{activeConflict.itemA.startTime} – {activeConflict.itemA.endTime}</span>
                </div>
                <div className="it-compare__vs">VS</div>
                <div className="it-compare__card it-compare__card--b">
                  <span className="it-compare__label">Hoạt động B</span>
                  <h4>{activeConflict.itemB.title}</h4>
                  <span className="it-compare__time">{activeConflict.itemB.startTime} – {activeConflict.itemB.endTime}</span>
                </div>
              </div>
              <div className="it-suggest">
                <h4>Đề xuất: Giãn cách tự động</h4>
                <p>Chuyển <strong>{activeConflict.itemB.title}</strong> sang {toTime(toMin(activeConflict.itemA.endTime)+15)} (sau hoạt động A + 15 phút di chuyển)</p>
              </div>
              <div className="it-drawer__actions">
                <button className="btn btn-green" onClick={() => handleAutoStagger(activeConflict.itemA, activeConflict.itemB)}>Giãn cách tự động</button>
                <button className="btn btn-purple" onClick={() => handleSwap(activeConflict.itemA, activeConflict.itemB)}>Đổi chỗ</button>
                <button className="btn btn-outline" onClick={() => setActiveConflict(null)}>Giữ nguyên</button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <select 
                  className="itin__edit-input" 
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleMoveToDay(activeConflict.itemB, Number(e.target.value))
                  }}
                  style={{ width: '100%', cursor: 'pointer', backgroundColor: '#F9FAFB' }}
                >
                  <option value="">Hoặc chuyển "{activeConflict.itemB.title}" sang ngày khác...</option>
                  {Array.from({length: totalDays + 1}).map((_, i) => {
                    const d = i + 1;
                    if (d === (activeConflict.itemB.day || 1)) return null;
                    return <option key={d} value={d}>Chuyển sang Ngày {d}</option>
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI Save Mode Modal */}
      {showSaveDialog && (
        <div className="it-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="it-drawer fade-in-up" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <div className="it-drawer__head">
              <h3>Tùy chọn lưu lịch trình</h3>
              <p className="caption" style={{margin: '4px 0 0', color: '#6B7280', fontSize: '13px'}}>Bạn đã có lịch trình, bạn muốn lưu kết quả AI thế nào?</p>
            </div>
            <div className="it-drawer__body" style={{gap: '12px', display: 'flex', flexDirection: 'column'}}>
              <button className="btn btn-purple" style={{padding: '12px', fontSize: '14px', width: '100%', justifyContent: 'center'}} onClick={() => saveAI('append')}>
                Lưu vào ngày mới (Tiếp nối ngày hiện tại)
              </button>
              <button className="btn btn-outline" style={{padding: '12px', fontSize: '14px', width: '100%', justifyContent: 'center'}} onClick={() => saveAI('merge')}>
                Lưu đè vào các ngày hiện tại (Có thể trùng giờ)
              </button>
              <button style={{padding: '8px', fontSize: '14px', background: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer', marginTop: '4px'}} onClick={() => setShowSaveDialog(false)}>
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
