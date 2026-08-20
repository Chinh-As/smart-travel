import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import SearchCard from '../../components/SearchCard/SearchCard.jsx'
import FilterPanel from '../../components/FilterPanel/FilterPanel.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import { SkeletonGrid } from '../../components/SkeletonCard/SkeletonCard.jsx'
import { useSearch } from '../../hooks/useSearch.js'
import { Sparkles, MapPin, ChevronDown, ChevronUp, Search as SearchIcon } from 'lucide-react'
import '../../layouts/SearchLayout.css'

const PAGE_SIZE = 6; // Max 6 direct results per page

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const isAll = searchParams.get('all') === 'true'
  const { query, setQuery, status, results, suggestions, filters, updateFilter, performSearch, searchWithFilters, resetSearch } = useSearch()

  const [currentPage, setCurrentPage] = useState(1);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const resultsHeaderRef = useRef(null);

  useEffect(() => {
    if (urlQuery) { 
      setQuery(urlQuery); 
      performSearch(urlQuery, filters);
    } else if (isAll) {
      searchWithFilters('', filters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, isAll]);

  // Reset pagination to page 1 & collapse suggestions whenever search results change
  useEffect(() => {
    setCurrentPage(1);
    setShowAllSuggestions(false);
  }, [results, query]);

  const handleFilterChange = useCallback((key, value) => {
    updateFilter(key, value);
    setCurrentPage(1);
    setShowAllSuggestions(false);
    searchWithFilters(query, { ...filters, [key]: value });
  }, [filters, query, updateFilter, searchWithFilters]);

  const handleSearch = useCallback((q) => {
    setQuery(q); 
    setSearchParams({ q });
    setCurrentPage(1);
    setShowAllSuggestions(false);
    performSearch(q, filters);
  }, [setQuery, setSearchParams, performSearch, filters]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (resultsHeaderRef.current) {
      const yOffset = -90; // Topbar offset
      const element = resultsHeaderRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Pagination calculations
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const currentResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Suggestions slice logic (max 3 initially, expanded on click)
  const visibleSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 3);

  return (
    <div className="search-layout">
      <div className="search-layout__topbar">
        <div className="container search-layout__topbar-inner">
          {/* Traveloka Style Unified Search & Filter Capsule Bar */}
          <div className="traveloka-bar-container">
            <div className="traveloka-bar__input-wrap">
              <SearchBar
                initialValue={urlQuery}
                onSearch={handleSearch}
                size="md"
                placeholder="Bạn muốn đi đâu?"
                hideSubmit={true}
                variant="bare"
              />
            </div>
            <div className="traveloka-bar__divider" />
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} variant="unified" />
            <button className="traveloka-bar__submit" onClick={() => handleSearch(query)}>
              <SearchIcon size={16} />
              <span>Tìm</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container search-layout__body" ref={resultsHeaderRef}>
        {/* IDLE */}
        {status === 'idle' && (
          <div className="search-layout__state fade-in">
            <div className="search-layout__state-icon">🗺️</div>
            <h2>Tìm kiếm địa điểm du lịch</h2>
            <p>Nhập tên thành phố, địa danh hoặc loại hình du lịch (Ví dụ: Sài Gòn, Hà Nội, Chợ Bến Thành, Cafe...)</p>
            <div className="search-layout__chips">
              {['Sài Gòn', 'Chợ Bến Thành', 'Phố Cổ Hà Nội', 'Đà Lạt', 'Cà phê', 'Miễn phí'].map(s => (
                <button key={s} className="search-layout__chip" onClick={() => handleSearch(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}
        {status === 'loading' && (
          <div className="search-layout__grid">
            <div className="search-layout__sidebar">
              <div className="search-layout__filter-sk">
                <div className="skeleton search-layout__filter-sk-title" />
                {[1,2,3,4].map(i => (
                  <div key={i} className="search-layout__filter-sk-group">
                    <div className="skeleton search-layout__filter-sk-lbl" />
                    <div className="search-layout__filter-sk-row">
                      <div className="skeleton search-layout__filter-sk-tag" />
                      <div className="skeleton search-layout__filter-sk-tag" />
                      <div className="skeleton search-layout__filter-sk-tag" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="search-layout__main">
              <SkeletonGrid count={6} />
            </div>
          </div>
        )}

        {/* RESULTS & SUGGESTIONS */}
        {status === 'results' && (
          <div className="search-layout__main" style={{ marginTop: '24px', marginBottom: '80px' }}>
            {/* Left-aligned count header below search bar */}
            {query && (
              <div className="search-layout__count-header" style={{ marginBottom: '12px', textAlign: 'left' }}>
                <p className="search-layout__count" style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)', textAlign: 'left' }}>
                  {totalItems > 0 ? (
                    <>Tìm thấy <strong>{totalItems} địa điểm chính xác</strong> {query ? `cho "${query}"` : ''}</>
                  ) : (
                    <>Hiển thị các <strong>gợi ý tương tự</strong> {query ? `cho "${query}"` : ''}</>
                  )}
                </p>
              </div>
            )}

            {/* Direct Matches Section */}
            {totalItems > 0 ? (
              <>
                <div className="search-layout__results fade-in">
                  {currentResults.map((d, i) => (
                    <div key={d.id} className="fade-in-up" style={{ animationDelay: `${(i % PAGE_SIZE) * 55}ms` }}>
                      <SearchCard destination={d} />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                    showSummary={true}
                  />
                )}
              </>
            ) : (
              <div style={{ padding: '16px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                Không tìm thấy địa điểm khớp chính xác tên từ khóa "<strong>{query}</strong>". Bạn có thể tham khảo các gợi ý liên quan bên dưới:
              </div>
            )}

            {/* Nearby Suggestions Section (Max 3 initial, expandable) */}
            {suggestions.length > 0 && (
              <div className="search-layout__suggestions-section fade-in">
                <div className="search-layout__suggestions-header">
                  <span className="search-layout__suggestions-icon">
                    <MapPin size={18} />
                  </span>
                  <h3>Gợi ý địa điểm lân cận "{query}"</h3>
                  <span className="search-layout__suggestions-count">{suggestions.length} địa điểm</span>
                </div>
                <div className="search-layout__results">
                  {visibleSuggestions.map((d, i) => (
                    <div key={d.id} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <SearchCard destination={d} />
                    </div>
                  ))}
                </div>

                {/* Expand / Collapse toggle button for suggestions */}
                {suggestions.length > 3 && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                      className="search-layout__suggestions-more-btn"
                      onClick={() => setShowAllSuggestions(prev => !prev)}
                    >
                      {showAllSuggestions ? (
                        <>Thu gọn địa điểm lân cận <ChevronUp size={14} /></>
                      ) : (
                        <>Xem thêm {suggestions.length - 3} địa điểm lân cận <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* EMPTY */}
        {status === 'empty' && (
          <div className="search-layout__state fade-in">
            <div className="search-layout__state-icon">🔍</div>
            <h2>Không tìm thấy kết quả</h2>
            <p>Không có địa điểm nào phù hợp với "<strong>{query}</strong>". Thử thay đổi từ khóa hoặc bộ lọc.</p>
            <div className="search-layout__actions">
              <button className="btn btn-outline" onClick={() => handleSearch('Sài Gòn')}>Tìm TP.HCM / Sài Gòn</button>
              <button className="btn btn-outline" onClick={resetSearch}>Xóa tìm kiếm</button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div className="search-layout__state fade-in">
            <div className="search-layout__state-icon">⚠️</div>
            <h2>Đã xảy ra lỗi</h2>
            <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
            <button className="btn btn-outline" onClick={() => performSearch(query, filters)}>Thử lại</button>
          </div>
        )}
      </div>
    </div>
  )
}
