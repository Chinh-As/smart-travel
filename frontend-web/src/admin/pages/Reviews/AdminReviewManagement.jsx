import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminReviewService } from '../../services/adminReviewService';
import EmptyState from '../../components/EmptyState';

const MOCK_REVIEWS = [
  {
    id: 'r1',
    userEmail: 'nguyenvana@gmail.com',
    placeName: 'Vịnh Hạ Long',
    rating: 5,
    comment: 'Chuyến đi tuyệt vời! Cảnh quan thiên nhiên kỳ vĩ, dịch vụ tàu thuyền chu đáo và sạch sẽ. Nhất định sẽ quay lại!',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'r2',
    userEmail: 'tranlib@gmail.com',
    placeName: 'Phố cổ Hội An',
    rating: 4,
    comment: 'Hội An về đêm rất đẹp với đèn lồng lung linh. Tuy nhiên, phố cổ hơi đông đúc vào ngày cuối tuần.',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'r3',
    userEmail: 'phamquoc@gmail.com',
    placeName: 'Động Phong Nha',
    rating: 5,
    comment: 'Hang động siêu rộng và mát mẻ. Hướng dẫn viên nhiệt tình, đi thuyền trên sông Son vào hang rất thú vị.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'r4',
    userEmail: 'lethid@gmail.com',
    placeName: 'Chùa Một Cột',
    rating: 3,
    comment: 'Di tích lịch sử ý nghĩa nhưng khuôn viên hơi nhỏ và đông khách du lịch nên khó chụp hình.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'r5',
    userEmail: 'spamuser@yahoo.com',
    placeName: 'Hồ Hoàn Kiếm',
    rating: 1,
    comment: 'Dịch vụ xung quanh quá đắt đỏ và chèo kéo khách, tôi không thích trải nghiệm này chút nào.',
    status: 'HIDDEN',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' (Tất cả), 'PENDING' (Chờ duyệt), 'APPROVED' (Đã duyệt), 'HIDDEN' (Đã ẩn)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  const { showToast, showConfirm } = useOutletContext();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async (status, kw, pg) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminReviewService.getAllReviews(status, kw, pg, 10);
      setReviews(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.warn('API reviews error, falling back to mock reviews:', err.message);
      const filteredMock = MOCK_REVIEWS.filter(r => !status || r.status === status)
        .filter(r => !kw || r.userEmail.toLowerCase().includes(kw.toLowerCase()));
      setReviews(filteredMock);
      setTotalPages(1);
      setTotalElements(filteredMock.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(statusFilter, debouncedSearch, page);
  }, [statusFilter, debouncedSearch, page]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="admin-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
            Đã duyệt
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="admin-badge error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
            Đã ẩn
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="admin-badge warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
            Chờ duyệt
          </span>
        );
    }
  };

  const handleUpdateStatus = (review, newStatus) => {
    const actionName = newStatus === 'APPROVED' ? 'Duyệt' : 'Ẩn';
    const type = newStatus === 'APPROVED' ? 'primary' : 'warning';

    showConfirm({
      title: `${actionName} đánh giá`,
      message: `Bạn có chắc chắn muốn ${actionName.toLowerCase()} đánh giá này của ${review.userEmail}?`,
      confirmText: actionName,
      type,
      onConfirm: async () => {
        try {
          if (typeof review.id === 'string' && review.id.startsWith('r')) {
            const index = MOCK_REVIEWS.findIndex(r => r.id === review.id);
            if (index !== -1) {
              MOCK_REVIEWS[index].status = newStatus;
            }
            showToast(`Đã ${actionName.toLowerCase()} đánh giá thành công (Dữ liệu mẫu).`, 'success');
            if (currentReview?.id === review.id) {
              setCurrentReview(prev => ({ ...prev, status: newStatus }));
            }
            loadData(statusFilter, debouncedSearch, page);
          } else {
            await adminReviewService.updateReviewStatus(review.id, newStatus);
            showToast(`Đã ${actionName.toLowerCase()} đánh giá thành công.`, 'success');
            if (currentReview?.id === review.id) {
              setCurrentReview(prev => ({ ...prev, status: newStatus }));
            }
            loadData(statusFilter, debouncedSearch, page);
          }
        } catch (err) {
          showToast(err.message || `Lỗi khi cập nhật trạng thái đánh giá`, 'error');
        }
      }
    });
  };

  const openViewModal = (review) => {
    setCurrentReview(review);
    setIsViewOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(0);
      
      let startPage = Math.max(1, page - 1);
      let endPage = Math.min(totalPages - 2, page + 1);
      
      if (page <= 2) {
        endPage = 3;
      } else if (page >= totalPages - 3) {
        startPage = totalPages - 4;
      }
      
      if (startPage > 1) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages - 1);
    }
    return pageNumbers;
  };

  if (error) {
    return (
      <div className="admin-card" style={{ padding: '40px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)', marginBottom: '16px' }}>error</span>
        <h3 className="font-headline-md text-on-surface">Đã xảy ra lỗi</h3>
        <p className="font-body-md text-on-surface-variant mt-2 mb-6">{error}</p>
        <button className="admin-btn-primary" onClick={() => loadData(statusFilter, debouncedSearch, page)}>Thử lại</button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <nav className="admin-breadcrumb">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Đánh giá</span>
          </nav>
          <h2 className="font-display-lg text-on-surface">Quản lý đánh giá</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(187, 202, 198, 0.2)', paddingBottom: '8px' }}>
        {[
          { value: '', label: 'Tất cả' },
          { value: 'PENDING', label: 'Chờ duyệt' },
          { value: 'APPROVED', label: 'Đã duyệt' },
          { value: 'HIDDEN', label: 'Đã ẩn' }
        ].map(tab => (
          <button
            key={tab.value}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              backgroundColor: statusFilter === tab.value ? 'var(--color-primary)' : 'transparent',
              color: statusFilter === tab.value ? '#ffffff' : 'var(--color-on-surface-variant)',
            }}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search" style={{ maxWidth: '400px', width: '100%' }}>
          <span className="material-symbols-outlined admin-search-icon">search</span>
          <input 
            type="text" 
            className="admin-toolbar-search-input" 
            placeholder="Tìm kiếm theo email người dùng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="admin-toolbar-btn" onClick={() => loadData(statusFilter, debouncedSearch, page)}>
          <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <EmptyState icon="hourglass_empty" message="Đang tải dữ liệu..." />
          ) : reviews.length === 0 ? (
            <EmptyState icon="reviews" message="Không có đánh giá nào" subMessage="Thử thay đổi bộ lọc tìm kiếm" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Địa điểm</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id} style={{ cursor: 'pointer' }} onClick={() => openViewModal(review)}>
                    <td>
                      <span className="font-body-md" style={{ fontWeight: '500', color: 'var(--color-on-surface)' }}>
                        {review.userEmail}
                      </span>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{review.placeName}</td>
                    <td>
                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="font-body-sm" style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.comment}
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{formatDate(review.createdAt)}</td>
                    <td>
                      {getStatusBadge(review.status)}
                    </td>
                    <td>
                      <div className="admin-table-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="admin-table-action-btn" title="Xem chi tiết" onClick={() => openViewModal(review)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                        </button>
                        {review.status !== 'APPROVED' && (
                          <button className="admin-table-action-btn edit" title="Duyệt" onClick={() => handleUpdateStatus(review, 'APPROVED')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                          </button>
                        )}
                        {review.status !== 'HIDDEN' && (
                          <button className="admin-table-action-btn delete" title="Ẩn" onClick={() => handleUpdateStatus(review, 'HIDDEN')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility_off</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && reviews.length > 0 && (
          <div className="admin-table-footer">
            <span className="font-body-sm text-on-surface-variant">
              Hiển thị {page * 10 + 1}-{Math.min((page + 1) * 10, totalElements)} trên tổng số {totalElements}
            </span>
            {totalPages > 1 && (
              <div className="admin-pagination">
                <button 
                  className="admin-page-btn" 
                  disabled={page === 0}
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {getPageNumbers().map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span 
                        key={`ellipsis-${idx}`} 
                        className="admin-page-ellipsis" 
                        style={{ padding: '0 8px', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', userSelect: 'none' }}
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button 
                      key={p} 
                      className={`admin-page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                <button 
                  className="admin-page-btn" 
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {isViewOpen && currentReview && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsViewOpen(false) }}>
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Nội dung đánh giá</h3>
              <button className="admin-modal-close" onClick={() => setIsViewOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="font-body-md" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{currentReview.userEmail}</div>
                  <div className="font-body-sm text-on-surface-variant">{formatDate(currentReview.createdAt)}</div>
                </div>
                {getStatusBadge(currentReview.status)}
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: '12px' }}>
                <div className="font-label-sm text-on-surface-variant" style={{ marginBottom: '4px' }}>Đánh giá cho địa điểm:</div>
                <div className="font-body-md" style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
                  {currentReview.placeName}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: i < currentReview.rating ? "'FILL' 1" : "'FILL' 0" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-on-surface" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {currentReview.comment}
                </p>
              </div>

            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" style={{ border: '1px solid rgba(187, 202, 198, 0.5)', borderRadius: '9999px', padding: '8px 24px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }} onClick={() => setIsViewOpen(false)}>Đóng</button>
              {currentReview.status !== 'HIDDEN' && (
                <button 
                  className="admin-btn-warning" 
                  style={{ backgroundColor: 'var(--color-error, #ba1a1a)', color: 'white', border: 'none', borderRadius: '9999px', padding: '8px 24px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }} 
                  onClick={() => handleUpdateStatus(currentReview, 'HIDDEN')}
                >
                  Ẩn đánh giá
                </button>
              )}
              {currentReview.status !== 'APPROVED' && (
                <button 
                  className="admin-btn-primary" 
                  onClick={() => handleUpdateStatus(currentReview, 'APPROVED')}
                >
                  Duyệt hiển thị
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewManagement;
