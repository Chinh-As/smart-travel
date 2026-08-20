import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinations, locationSuggestions } from '../../data/mockData.js'
import './SearchBar.css'

const HISTORY_KEY = 'st_search_history'
const MAX_HISTORY = 6

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(q) {
  const h = [q, ...getHistory().filter(x => x !== q)].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}

// Tất cả tên địa điểm + khu vực để gợi ý
const SUGGESTION_POOL = [
  ...destinations.map(d => d.title),
  ...locationSuggestions.map(l => l.label),
]

export default function SearchBar({
  initialValue = '',
  placeholder = 'Bạn muốn đi đâu?',
  onSearch,
  size = 'md',
  autoFocus = false,
  hideSubmit = false,
  variant = 'default',
  value: propValue,
  onChange: propOnChange,
}) {
  const [internalValue, setInternalValue] = useState(initialValue)
  const value = propValue !== undefined ? propValue : internalValue
  const setValue = useCallback((v) => {
    if (propOnChange) propOnChange(v)
    setInternalValue(v)
  }, [propOnChange])

  // Sync internalValue when initialValue changes
  useEffect(() => {
    if (propValue === undefined) {
      setInternalValue(initialValue)
    }
  }, [initialValue, propValue])

  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState(getHistory)
  const [suggestions, setSuggestions] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef(null)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  // Gợi ý theo từ khóa
  useEffect(() => {
    const q = value.trim().toLowerCase()
    if (!q) { setSuggestions([]); setActiveIdx(-1); return }
    const matches = SUGGESTION_POOL
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 6)
    setSuggestions(matches)
    setActiveIdx(-1)
  }, [value])

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const doSearch = useCallback((q) => {
    const trimmed = (q ?? value).trim()
    if (!trimmed) { ref.current?.focus(); return }
    saveHistory(trimmed)
    setHistory(getHistory())
    setFocused(false)
    setSuggestions([])
    if (onSearch) onSearch(trimmed)
    else navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }, [value, onSearch, navigate])

  const handleKeyDown = (e) => {
    const list = value.trim() ? suggestions : history
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, list.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter') {
      if (activeIdx >= 0 && list[activeIdx]) { setValue(list[activeIdx]); doSearch(list[activeIdx]) }
      else doSearch()
    }
    else if (e.key === 'Escape') { setFocused(false); setSuggestions([]) }
  }

  const removeHistory = (item, e) => {
    e.stopPropagation()
    const h = getHistory().filter(x => x !== item)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
    setHistory(h)
  }

  const showDropdown = focused && (suggestions.length > 0 || (value.trim() === '' && history.length > 0))
  const dropList = value.trim() ? suggestions : history
  const isHistory = value.trim() === ''

  return (
    <div ref={wrapRef} className={`sbar sbar--${size} sbar--${variant} ${focused ? 'sbar--focus' : ''}`} style={{ position: 'relative' }}>
      <span className="sbar__icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
      <input
        ref={ref}
        type="text"
        className="sbar__input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button className="sbar__clear" onClick={() => { setValue(''); ref.current?.focus() }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      {!hideSubmit && <button className="sbar__submit" onClick={() => doSearch()}>Tìm</button>}

      {/* Dropdown: lịch sử hoặc gợi ý */}
      {showDropdown && (
        <div className="sbar__dropdown">
          {isHistory && <div className="sbar__dd-label">Tìm kiếm gần đây</div>}
          {!isHistory && suggestions.length > 0 && <div className="sbar__dd-label">Gợi ý</div>}
          <div className="sbar__dd-list">
          {dropList.map((item, i) => (
            <button
              key={item}
              className={`sbar__dd-item ${activeIdx === i ? 'sbar__dd-item--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); setValue(item); doSearch(item) }}
            >
              <span className="sbar__dd-icon">
                {isHistory ? (
                  /* đồng hồ */
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  /* kính lúp */
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                )}
              </span>
              <span className="sbar__dd-text">{item}</span>
              {isHistory && (
                /* mũi tên điền vào input */
                <button
                  className="sbar__dd-fill"
                  title="Điền vào ô tìm kiếm"
                  onMouseDown={e => { e.stopPropagation(); setValue(item); ref.current?.focus() }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M3 10L10 3M10 3H5M10 3v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {isHistory && (
                <button className="sbar__dd-del" title="Xóa" onMouseDown={e => removeHistory(item, e)}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}
