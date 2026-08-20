/**
 * AISearch.jsx — Smart AI trip builder
 * Features:
 *  - Destination search bar with autocomplete
 *  - Location suggestions by city/area
 *  - Category filter that affects results
 *  - Description text → filters matching destinations
 *  - "Tạo ngay" → navigates to TopResults with smart matched results
 */
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinations, locationSuggestions } from '../../data/mockData.js'
import { useRequireAuth } from '../../hooks/useRequireAuth.js'
import './AISearch.css'

const CATEGORIES = [
  { id:'food',          label:'Ăn uống',    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 1v5a2 2 0 004 0V1M7 7v7M2 1v3a2 2 0 002 2h1"/></svg> },
  { id:'cafe',          label:'Cafe',        icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3h9l-1 8H4L3 3z"/><path d="M12 5h1a1.5 1.5 0 010 3h-1M1 13h13"/></svg> },
  { id:'sightseeing',   label:'Tham quan',   icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5"/><path d="M7.5 2v2M7.5 11v2M2 7.5h2M11 7.5h2"/></svg> },
  { id:'shopping',      label:'Mua sắm',     icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 2h1l2 6h6l1.5-4H5"/><circle cx="6" cy="12" r="1"/><circle cx="11" cy="12" r="1"/></svg> },
  { id:'entertainment', label:'Vui chơi',    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5"/><path d="M5 7.5a2.5 2.5 0 005 0"/><circle cx="5.5" cy="5.5" r=".8" fill="currentColor"/><circle cx="9.5" cy="5.5" r=".8" fill="currentColor"/></svg> },
  { id:'beach',         label:'Biển',        icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 11c2-2 4-2 6 0s4 2 6 0M7 8V3M4 6l3-3 3 3"/></svg> },
  { id:'nature',        label:'Thiên nhiên',  icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7.5 13V7M3 7c0-3 2-5 4.5-5S12 4 12 7H3z"/></svg> },
  { id:'history',       label:'Lịch sử',     icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="3" width="11" height="10" rx="1"/><path d="M2 6h11M5 3V1M10 3V1"/></svg> },
  { id:'nightlife',     label:'Về đêm',      icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M11 10A5 5 0 116 3a4 4 0 005 7z"/></svg> },
]

// Normalize Vietnamese for fuzzy match
function norm(s) {
  return (s||'').toLowerCase()
    .replace(/[àáạảãăắặẳẵâầấậẩẫ]/g,'a')
    .replace(/[èéẹẻẽêềếệểễ]/g,'e')
    .replace(/[ìíịỉĩ]/g,'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,'o')
    .replace(/[ùúụủũưừứựửữ]/g,'u')
    .replace(/[ỳýỵỷỹ]/g,'y').replace(/đ/g,'d')
    .replace(/[^a-z0-9\s]/g,'').trim()
}

// Smart filter: description text + categories + city → ranked destinations
function smartFilter(form) {
  const descNorm = norm(form.description)
  const cityNorm = norm(form.destinationSearch || form.city || '')

  return destinations
    .map(d => {
      let score = 0
      const dCity  = norm(d.city)
      const dTitle = norm(d.title)
      const dLoc   = norm(d.location)
      const dCat   = norm(d.category)
      const dCats  = d.categories.map(norm).join(' ')
      const dOvr   = norm(d.overview)

      // City / destination search match
      if (cityNorm) {
        if (dCity.includes(cityNorm) || cityNorm.includes(dCity)) score += 60
        if (dTitle.includes(cityNorm)) score += 80
        if (dLoc.includes(cityNorm))   score += 40
      }

      // Category filter
      if (form.categories.length > 0) {
        const catMatches = form.categories.filter(c => dCats.includes(c) || dCat.includes(c))
        score += catMatches.length * 30
      } else {
        score += 10 // no filter = slight boost for all
      }

      // Description keyword matching
      if (descNorm) {
        const words = descNorm.split(/\s+/).filter(w => w.length > 2)
        words.forEach(w => {
          if (dTitle.includes(w)) score += 20
          if (dCat.includes(w))   score += 15
          if (dCats.includes(w))  score += 12
          if (dOvr.includes(w))   score += 8
          if (dLoc.includes(w))   score += 6
        })
        // Semantic food keywords
        if (descNorm.includes('an') || descNorm.includes('quan') || descNorm.includes('nha hang')) {
          if (dCats.includes('food') || dCats.includes('restaurant')) score += 25
        }
        if (descNorm.includes('cafe') || descNorm.includes('ca phe')) {
          if (dCats.includes('cafe')) score += 30
        }
        if (descNorm.includes('bien') || descNorm.includes('bai bien')) {
          if (dCats.includes('beach') || dCats.includes('nature')) score += 25
        }
        if (descNorm.includes('tien kiem') || descNorm.includes('re') || descNorm.includes('mien phi')) {
          if (d.price === 0) score += 20
        }
        if (descNorm.includes('mien phi')) {
          if (d.price === 0) score += 30
        }
        if (descNorm.includes('chup anh') || descNorm.includes('check in')) {
          if (dCats.includes('culture') || dCats.includes('sightseeing') || dCats.includes('art')) score += 20
        }
        if (descNorm.includes('dem') || descNorm.includes('toi')) {
          if (dCats.includes('nightlife') || dCats.includes('entertainment')) score += 25
        }
      }

      // Budget filter
      if (form.budget) {
        const b = parseInt(form.budget.replace(/\D/g,'')) || 0
        if (d.price <= b / (parseInt(form.people)||1)) score += 10
      }

      return { ...d, _score: score }
    })
    .filter(d => d._score > 0)
    .sort((a, b) => b._score - a._score || b.suitability - a.suitability)
    .slice(0, 10)
}

export default function AISearch() {
  const navigate = useNavigate()
  const requireAuth = useRequireAuth()
  const [form, setForm] = useState({
    budget: '1200000',
    people: '3',
    radius: '5',
    city: 'Hồ Chí Minh',
    destinationSearch: '',
    categories: [],
    wheelchair: false,
    description: '',
  })
  const [locQuery,   setLocQuery]   = useState('Hồ Chí Minh')
  const [locSuggs,   setLocSuggs]   = useState([])
  const [showLocBox, setShowLocBox] = useState(false)
  const [destQuery,  setDestQuery]  = useState('')
  const [destSuggs,  setDestSuggs]  = useState([])
  const [showDest,   setShowDest]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [geoError,   setGeoError]   = useState('')
  const locRef  = useRef(null)
  const destRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e) => {
      if (locRef.current  && !locRef.current.contains(e.target))  setShowLocBox(false)
      if (destRef.current && !destRef.current.contains(e.target)) setShowDest(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleCat = (id) => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(id)
        ? p.categories.filter(c => c !== id)
        : [...p.categories, id]
    }))
  }

  // Location search
  const handleLocInput = (val) => {
    setLocQuery(val)
    if (!val.trim()) { setLocSuggs(locationSuggestions.slice(0,6)); setShowLocBox(true); return }
    const n = norm(val)
    const filtered = locationSuggestions.filter(s =>
      norm(s.label).includes(n) || norm(s.city).includes(n)
    )
    setLocSuggs(filtered.length > 0 ? filtered : locationSuggestions.slice(0,6))
    setShowLocBox(true)
  }

  const selectLoc = (s) => {
    setLocQuery(s.label)
    set('city', s.city)
    setShowLocBox(false)
  }

  // Destination search autocomplete
  const handleDestInput = (val) => {
    setDestQuery(val)
    set('destinationSearch', val)
    if (!val.trim()) { setDestSuggs([]); setShowDest(false); return }
    const n = norm(val)
    const matches = destinations
      .filter(d => norm(d.title).includes(n) || norm(d.city).includes(n) || norm(d.location).includes(n))
      .slice(0, 6)
    setDestSuggs(matches)
    setShowDest(matches.length > 0)
  }

  const selectDest = (d) => {
    setDestQuery(d.title)
    set('destinationSearch', d.title)
    set('city', d.city)
    setLocQuery(d.city)
    setShowDest(false)
  }

  const handleCreate = async () => {
    if (!requireAuth()) return
    setGeoError('')
    if (form.categories.length === 0) {
      setGeoError('Vui lòng chọn ít nhất một danh mục.')
      return
    }
    if (!form.city) {
      setGeoError('Vui lòng nhập vị trí tìm kiếm.')
      return
    }
    setLoading(true)
    try {
      const { getRecommendations } = await import('../../services/recommendationApi.js');
      const { transformPlacesToDestinations } = await import('../../services/dataTransformers.js');
      const { geocodeCity } = await import('../../services/geocodingApi.js');
      
      let lat, lng;
      try {
        const geo = await geocodeCity(form.city);
        lat = geo.lat;
        lng = geo.lng;
      } catch (gErr) {
        throw new Error('Geocoding: ' + gErr.message);
      }
      
      let category = form.categories[0];
      let totalBudget = parseInt(form.budget.replace(/\D/g,'')) || 1200000;
      let budgetLevel = totalBudget <= 500000 ? 'low' : totalBudget <= 1500000 ? 'medium' : 'high';
      let radiusKm = parseFloat(form.radius) || 5;

      const data = await getRecommendations({ lat, lng, budget: budgetLevel, radiusKm, category, topK: 10 });
      let results = transformPlacesToDestinations(data.places);
      
      if (!results || results.length === 0) throw new Error('No API results');
      
      navigate('/top-results', { state: { results, form, radiusUsed: data.radiusUsed } });
    } catch (err) {
      console.error('AISearch API failed', err);
      if (err.message.includes('Geocoding:')) {
        setGeoError(err.message.replace('Geocoding: ', ''));
      } else {
        const results = smartFilter(form)
        navigate('/top-results', { state: { results, form } })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-page">

      <div className="ai-anim-wrapper">
        <div className="ai-card">
        {/* ── Destination search bar ── */}
        <div className="ai-dest-bar" ref={destRef}>
          <div className="ai-dest-bar__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M12 12l3 3"/></svg>
          </div>
          <input
            className="ai-dest-bar__input"
            type="text"
            value={destQuery}
            onChange={e => handleDestInput(e.target.value)}
            onFocus={() => destQuery && setShowDest(true)}
            placeholder="Tìm địa điểm muốn đến (ví dụ: Hội An, Phở Bát Đàn, Bãi Sao...)"
          />
          {destQuery && <button className="ai-dest-bar__clear" onClick={() => { setDestQuery(''); set('destinationSearch',''); setShowDest(false) }}>✕</button>}

          {showDest && destSuggs.length > 0 && (
            <div className="ai-dest-bar__dropdown">
              {destSuggs.map(d => (
                <button key={d.id} className="ai-dest-bar__item" onClick={() => selectDest(d)}>
                  <span className="ai-dest-bar__item-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7 1C5 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1-4-4-4z"/><circle cx="7" cy="5" r="1.5"/></svg>
                  </span>
                  <div>
                    <div className="ai-dest-bar__item-name">{d.title}</div>
                    <div className="ai-dest-bar__item-loc">{d.city} — {d.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ai-card__grid">
          {/* Budget */}
          <div className="ai-field">
            <div className="ai-field__label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2 1.5"/></svg>
              Ngân sách chi tiết
            </div>
            <input type="text" className="ai-input"
              value={form.budget + 'đ'}
              onChange={e => set('budget', e.target.value.replace('đ','').replace(/\D/g,''))}
              placeholder="1.200.000đ" />
          </div>

          {/* Radius */}
          <div className="ai-field">
            <div className="ai-field__label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M4 7h6M7 4v6"/></svg>
              Bán kính tìm kiếm
            </div>
            <input type="text" className="ai-input"
              value={form.radius + 'km'}
              onChange={e => set('radius', e.target.value.replace('km','').replace(/\D/g,''))}
              placeholder="5km" />
          </div>

          {/* People */}
          <div className="ai-field">
            <div className="ai-field__label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="5" cy="4" r="2"/><circle cx="9" cy="4" r="2"/><path d="M1 12c0-2.5 1.8-4 4-4M13 12c0-2.5-1.8-4-4-4M7 8v4"/></svg>
              Số lượng người
            </div>
            <input type="number" className="ai-input" value={form.people}
              onChange={e => set('people', e.target.value)} min={1} max={20} />
          </div>

          {/* Location with autocomplete */}
          <div className="ai-field" ref={locRef} style={{position:'relative'}}>
            <div className="ai-field__label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7 1C5 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1-4-4-4z"/><circle cx="7" cy="5" r="1.5"/></svg>
              Vị trí tìm kiếm
            </div>
            <div className="ai-loc-wrap">
              <input
                type="text"
                className="ai-input ai-input--loc"
                value={locQuery}
                onChange={e => handleLocInput(e.target.value)}
                onFocus={() => { setLocSuggs(locationSuggestions.slice(0,8)); setShowLocBox(true) }}
                placeholder="Nhập thành phố hoặc khu vực..."
              />
              <span className="ai-loc-arrow">⌄</span>
            </div>
            {showLocBox && (
              <div className="ai-loc-dropdown">
                <div className="ai-loc-current" onClick={() => { setLocQuery('Vị trí hiện tại'); set('city','Hồ Chí Minh'); setShowLocBox(false) }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4"/><circle cx="6.5" cy="6.5" r="1.5"/><path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2"/></svg>
                Vị trí hiện tại (GPS)
              </div>
                <div className="ai-loc-sep">Gợi ý địa điểm</div>
                {locSuggs.map((s, i) => (
                  <button key={i} className="ai-loc-item" onClick={() => selectLoc(s)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M6 1C4.3 1 3 2.4 3 4c0 2.5 3 6 3 6s3-3.5 3-6c0-1.6-1.3-3-3-3z"/><circle cx="6" cy="4" r="1"/></svg>
                    <div>
                      <div className="ai-loc-item__name">{s.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="ai-field ai-field--full">
            <div className="ai-field__label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="2" width="12" height="10" rx="1"/><path d="M4 5h6M4 7h6M4 9h3"/></svg>
              Danh mục/Loại (có thể chọn nhiều)
            </div>
            <div className="ai-cats">
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  className={`ai-cat ${form.categories.includes(cat.id) ? 'ai-cat--active' : ''}`}
                  onClick={() => toggleCat(cat.id)}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description + Wheelchair inline */}
          <div className="ai-field ai-field--full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div className="ai-field__label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="2" width="12" height="10" rx="1"/><path d="M4 5h6M4 7h4"/></svg>
                Mô tả thêm (AI sẽ lọc địa điểm phù hợp)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M4 7l2 2 4-4"/></svg>
                <span className="ai-field__label">Có hỗ trợ xe lăn</span>
                <input type="checkbox" className="ai-check" checked={form.wheelchair}
                  onChange={e => set('wheelchair', e.target.checked)} />
              </div>
            </div>
            <div className="ai-desc-chips">
              {['Cafe học nhóm', 'Ăn hải sản', 'Chụp ảnh check-in', 'Miễn phí', 'Vui chơi gia đình', 'Về đêm sôi động'].map(chip => {
                const isActive = form.description?.includes(chip);
                return (
                  <button key={chip} className={`ai-desc-chip ${isActive ? 'ai-desc-chip--active' : ''}`}
                    onClick={() => {
                      if (!isActive) {
                        set('description', form.description ? form.description + ', ' + chip : chip);
                      } else {
                        const newDesc = form.description
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s !== chip && s !== '')
                          .join(', ');
                        set('description', newDesc);
                      }
                    }}>
                    {isActive ? '✓' : '+'} {chip}
                  </button>
                );
              })}
            </div>
            <textarea className="ai-textarea" value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ví dụ: Tìm quán cafe yên tĩnh để học nhóm, có WiFi và điều hòa. Hoặc: nhà hàng hải sản tươi sống không quá đắt. Hoặc: địa điểm chụp ảnh đẹp ít người..."
              rows={3} />
          </div>
        </div>

        <div className="ai-card__footer">
          {geoError && <div style={{color: '#ff4d4f', fontSize: '14px', background: '#ffeef0', padding: '8px 12px', borderRadius: '8px', width:'100%', textAlign:'center'}}>{geoError}</div>}
          <button className="btn btn-outline ai-card__btn" onClick={handleCreate} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo ngay'}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
