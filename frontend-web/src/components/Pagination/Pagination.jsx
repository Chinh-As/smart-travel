import React from 'react';
import './Pagination.css';

/**
 * Professional Senior-Level Pagination Component
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current 1-based page number
 * @param {number} props.totalPages - Total number of pages
 * @param {function(number): void} props.onPageChange - Handler called when a page is selected
 * @param {number} [props.totalItems] - Total count of items across all pages
 * @param {number} [props.pageSize=8] - Items per page
 * @param {boolean} [props.showSummary=true] - Whether to show the item count summary text
 * @param {string} [props.className=""] - Additional CSS class name
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize = 8,
  showSummary = true,
  className = '',
}) {
  if (totalPages <= 1 && !showSummary) return null;

  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  // Generate page numbers array with ellipses
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className={`pagination-container ${className}`} aria-label="Phân trang danh sách">
      {showSummary && totalItems > 0 && (
        <div className="pagination-summary">
          Hiển thị <strong>{startItem} – {endItem}</strong> trong số <strong>{totalItems}</strong> địa điểm
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* First Page */}
          <button
            className="pag-btn pag-nav-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Trang đầu"
            aria-label="Trang đầu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L7 7l4 4M5 3L1 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Previous Page */}
          <button
            className="pag-btn pag-nav-btn"
            onClick={handlePrev}
            disabled={currentPage === 1}
            title="Trang trước"
            aria-label="Trang trước"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Page Numbers */}
          <div className="pag-numbers">
            {pageNumbers.map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`dots-${idx}`} className="pag-dots">
                    &hellip;
                  </span>
                );
              }
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  className={`pag-btn pag-num-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Trang ${page}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            className="pag-btn pag-nav-btn"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            title="Trang tiếp"
            aria-label="Trang tiếp"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 3L9.5 7l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Last Page */}
          <button
            className="pag-btn pag-nav-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Trang cuối"
            aria-label="Trang cuối"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l4 4-4 4M9 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
}
