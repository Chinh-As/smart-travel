import React, { useState, useEffect, useRef } from 'react'
import { priceRanges } from '../../data/mockData.js'
import { fetchCategories } from '../../services/recommendationApi.js'
import { X } from 'lucide-react'
import './FilterPanel.css'

const CATEGORY_UI = {
  'cafe': { label: 'Café', icon: '☕' },
  'café': { label: 'Café', icon: '☕' },
  'restaurant': { label: 'Nhà hàng', icon: '🍜' },
  'nhà hàng': { label: 'Nhà hàng', icon: '🍜' },
  'hotel': { label: 'Khách sạn', icon: '🏨' },
  'khách sạn': { label: 'Khách sạn', icon: '🏨' },
  'food': { label: 'Ẩm thực', icon: '🍲' },
  'ẩm thực': { label: 'Ẩm thực', icon: '🍲' },
  'sightseeing': { label: 'Tham quan', icon: '📸' },
  'tham quan': { label: 'Tham quan', icon: '📸' },
  'museum': { label: 'Bảo tàng', icon: '🏛️' },
  'bảo tàng': { label: 'Bảo tàng', icon: '🏛️' },
  'park': { label: 'Công viên', icon: '🌳' },
  'công viên': { label: 'Công viên', icon: '🌳' },
}

const DEFAULT_FILTERS = { category: 'all', priceRange: 'all', minRating: 0, sortBy: 'suitability' }

export default function FilterPanel({ filters, onFilterChange, variant = 'default' }) {
  const [cats, setCats] = useState([{ id: 'all', label: 'Tất cả danh mục', icon: '🏷️' }]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await fetchCategories();
        const mapped = data.map(c => ({
          id: c,
          label: CATEGORY_UI[c]?.label || c,
          icon: CATEGORY_UI[c]?.icon || '📍'
        }));
        setCats([{ id: 'all', label: 'Tất cả danh mục', icon: '🏷️' }, ...mapped]);
      } catch (err) {
        import('../../data/mockData.js').then(m => setCats([{ id: 'all', label: 'Tất cả danh mục', icon: '🏷️' }, ...m.categories]));
      }
    }
    loadCats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Is any filter active?
  const hasActive = filters.category !== 'all' || filters.priceRange !== 'all' || filters.minRating > 0 || filters.sortBy !== 'suitability'

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => prev === name ? null : name)
  }

  // Instant reactive filter selection
  const handleSelect = (key, value) => {
    onFilterChange(key, value);
    setOpenDropdown(null);
  }

  // Reset all filters to defaults
  const reset = () => {
    Object.entries(DEFAULT_FILTERS).forEach(([k, v]) => onFilterChange(k, v));
    setOpenDropdown(null);
  }

  const sortOptions = [
    {id: 'suitability', label: 'Phù hợp nhất'},
    {id: 'rating', label: 'Đánh giá cao'},
    {id: 'price_asc', label: 'Giá tăng dần'},
    {id: 'price_desc', label: 'Giá giảm dần'},
    {id: 'distance', label: 'Gần nhất'}
  ];
  const activeSort = sortOptions.find(o => o.id === filters.sortBy) || sortOptions[0];

  const activeCat = cats.find(c => c.id === filters.category) || cats[0];

  const priceOptions = [{id: 'all', label: 'Tất cả mức giá'}, ...priceRanges];
  const activePrice = priceOptions.find(p => p.id === filters.priceRange) || priceOptions[0];

  const ratingOptions = [{id: 0, label: 'Mọi đánh giá'}, {id: 4, label: 'Từ 4.0 sao'}, {id: 4.3, label: 'Từ 4.3 sao'}, {id: 4.5, label: 'Từ 4.5 sao'}, {id: 4.7, label: 'Từ 4.7 sao'}];
  const activeRating = ratingOptions.find(r => r.id === filters.minRating) || ratingOptions[0];

  const chevron = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const isUnified = variant === 'unified';

  return (
    <div className={`fp-horizontal ${isUnified ? 'fp-horizontal--unified' : ''}`} ref={panelRef}>
      {/* Sắp xếp */}
      <div className="fp-dropdown">
        <button className={`fp-dropdown__toggle ${filters.sortBy !== 'suitability' ? 'active' : ''}`} onClick={() => toggleDropdown('sort')}>
          <span>Sắp xếp: <strong>{activeSort.label}</strong></span>
          {chevron}
        </button>
        {openDropdown === 'sort' && (
          <div className="fp-dropdown__menu">
            {sortOptions.map(o => (
              <button key={o.id} className={`fp-dropdown__item ${filters.sortBy === o.id ? 'active' : ''}`} onClick={() => handleSelect('sortBy', o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUnified && <div className="fp-divider" />}

      {/* Danh mục */}
      <div className="fp-dropdown">
        <button className={`fp-dropdown__toggle ${filters.category !== 'all' ? 'active' : ''}`} onClick={() => toggleDropdown('cat')}>
          <span>{activeCat.icon} {activeCat.label}</span>
          {chevron}
        </button>
        {openDropdown === 'cat' && (
          <div className="fp-dropdown__menu">
            {cats.map(c => (
              <button key={c.id} className={`fp-dropdown__item ${filters.category === c.id ? 'active' : ''}`} onClick={() => handleSelect('category', c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUnified && <div className="fp-divider" />}

      {/* Giá */}
      <div className="fp-dropdown">
        <button className={`fp-dropdown__toggle ${filters.priceRange !== 'all' ? 'active' : ''}`} onClick={() => toggleDropdown('price')}>
          <span>Giá: <strong>{activePrice.label}</strong></span>
          {chevron}
        </button>
        {openDropdown === 'price' && (
          <div className="fp-dropdown__menu">
            {priceOptions.map(p => (
              <button key={p.id} className={`fp-dropdown__item ${filters.priceRange === p.id ? 'active' : ''}`} onClick={() => handleSelect('priceRange', p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUnified && <div className="fp-divider" />}

      {/* Đánh giá */}
      <div className="fp-dropdown">
        <button className={`fp-dropdown__toggle ${filters.minRating > 0 ? 'active' : ''}`} onClick={() => toggleDropdown('rating')}>
          <span>★ {activeRating.label}</span>
          {chevron}
        </button>
        {openDropdown === 'rating' && (
          <div className="fp-dropdown__menu">
            {ratingOptions.map(r => (
              <button key={r.id} className={`fp-dropdown__item ${filters.minRating === r.id ? 'active' : ''}`} onClick={() => handleSelect('minRating', r.id)}>
                {r.id === 0 ? r.label : `Từ ${r.id} sao`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nút Xóa bộ lọc */}
      {hasActive && (
        <>
          {isUnified && <div className="fp-divider" />}
          <button className="fp-horizontal__reset" onClick={reset} title="Xóa tất cả bộ lọc">
            <X size={14} /> Xóa
          </button>
        </>
      )}
    </div>
  )
}
