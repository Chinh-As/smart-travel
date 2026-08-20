import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminReviewService } from '../../services/adminReviewService';
import EmptyState from '../../components/EmptyState';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  const { showToast, showConfirm } = useOutletContext();

  const loadData = () => {
    setLoading(true);
    adminReviewService.getAllReviews().then(data => {
      setReviews(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusClass = (status) => {
    if (status === 'Đã duyệt') return 'success';
    if (status === 'Đã ẩn') return 'error';
    return 'warning';
  };

  const openViewModal = (review) => {
    setCurrentReview(review);
    setIsViewOpen(true);
  };

  const handleAction = (actionType, review) => {
    let title, message, confirmText, type;

    switch (actionType) {
      case 'approve':
        title = 'Duyệt đánh giá';
        message = 'Bạn có chắc chắn muốn duyệt đánh giá này?';
        confirmText = 'Duyệt';
        type = 'primary';
        break;
      case 'hide':
        title = 'Ẩn đánh giá';
        message = 'Bạn có chắc chắn muốn ẩn đánh giá này khỏi người dùng?';
        confirmText = 'Ẩn';
        type = 'warning';
        break;
      case 'delete':
        title = 'Xóa đánh giá';
        message = 'Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này? Hành động không thể hoàn tác.';
        confirmText = 'Xóa';
        type = 'danger';
        break;
      default:
        return;
    }

    showConfirm({
      title,
      message,
      confirmText,
      type,
      onConfirm: async () => {
        if (actionType === 'delete') {
          await adminReviewService.deleteReview(review.id);
          setReviews(prev => prev.filter(r => r.id !== review.id));
          showToast('Đã xóa đánh giá thành công.');
          if (currentReview?.id === review.id) setIsViewOpen(false);
        } else if (actionType === 'approve') {
          await adminReviewService.approveReview(review.id);
          setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'Đã duyệt' } : r));
          showToast('Đã duyệt đánh giá.');
          if (currentReview?.id === review.id) setCurrentReview(prev => ({ ...prev, status: 'Đã duyệt' }));
        } else if (actionType === 'hide') {
          await adminReviewService.hideReview(review.id);
          setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'Đã ẩn' } : r));
          showToast('Đã ẩn đánh giá.');
          if (currentReview?.id === review.id) setCurrentReview(prev => ({ ...prev, status: 'Đã ẩn' }));
        }
      }
    });
  };

  const filteredReviews = reviews.filter(r => {
    const matchSearch = r.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? r.status === statusFilter : true;
    const matchRating = ratingFilter ? r.rating.toString() === ratingFilter : true;
    return matchSearch && matchStatus && matchRating;
  });

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

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <span className="material-symbols-outlined admin-search-icon">search</span>
          <input 
            type="text" 
            className="admin-toolbar-search-input" 
            placeholder="Tìm kiếm nội dung đánh giá..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span className="font-label-md text-on-surface-variant">Trạng thái:</span>
          <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã ẩn">Đã ẩn</option>
          </select>
        </div>
        <div className="admin-filter-group">
          <span className="font-label-md text-on-surface-variant">Số sao:</span>
          <select className="admin-filter-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
            <option value="">Tất cả mức sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>
        <button className="admin-toolbar-btn" onClick={loadData}>
          <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <EmptyState icon="hourglass_empty" message="Đang tải dữ liệu..." />
          ) : filteredReviews.length === 0 ? (
            <EmptyState icon="reviews" message="Chưa có đánh giá nào" subMessage="Hãy thử thay đổi bộ lọc tìm kiếm" />
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
                {filteredReviews.map(review => (
                  <tr key={review.id} style={{ cursor: 'pointer' }} onClick={() => openViewModal(review)}>
                    <td>
                      <div className="admin-table-user">
                        <div className="admin-table-avatar" style={{ width: '32px', height: '32px' }}>
                          {getInitials(review.userName)}
                        </div>
                        <span className="font-body-md" style={{ fontWeight: '500', color: 'var(--color-on-surface)' }}>{review.userName}</span>
                      </div>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{review.destinationName}</td>
                    <td>
                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="font-body-sm" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.content}
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{review.date}</td>
                    <td>
                      <span className={`admin-badge-pill ${getStatusClass(review.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {review.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="admin-table-action-btn" title="Xem chi tiết" onClick={() => openViewModal(review)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                        </button>
                        {review.status !== 'Đã duyệt' && (
                          <button className="admin-table-action-btn edit" title="Duyệt" onClick={() => handleAction('approve', review)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                          </button>
                        )}
                        {review.status !== 'Đã ẩn' && (
                          <button className="admin-table-action-btn" title="Ẩn" onClick={() => handleAction('hide', review)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility_off</span>
                          </button>
                        )}
                        <button className="admin-table-action-btn delete" title="Xóa" onClick={() => handleAction('delete', review)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && filteredReviews.length > 0 && (
          <div className="admin-table-footer">
            <span className="font-body-sm text-on-surface-variant">Hiển thị 1-{filteredReviews.length} trên tổng số {filteredReviews.length}</span>
            <div className="admin-pagination">
              <button className="admin-page-btn">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="admin-page-btn active">1</button>
              <button className="admin-page-btn">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="admin-table-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                    {getInitials(currentReview.userName)}
                  </div>
                  <div>
                    <div className="font-body-md" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{currentReview.userName}</div>
                    <div className="font-body-sm text-on-surface-variant">{currentReview.date}</div>
                  </div>
                </div>
                <span className={`admin-badge-pill ${getStatusClass(currentReview.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                  {currentReview.status}
                </span>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}>
                <div className="font-label-sm text-on-surface-variant" style={{ marginBottom: '4px' }}>Đánh giá cho:</div>
                <div className="font-body-md" style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
                  {currentReview.destinationName}
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
                  {currentReview.content}
                </p>
              </div>

            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setIsViewOpen(false)}>Đóng</button>
              {currentReview.status !== 'Đã ẩn' && (
                <button className="admin-btn-warning" style={{ backgroundColor: '#f59e0b', color: 'white' }} onClick={() => handleAction('hide', currentReview)}>Ẩn đánh giá</button>
              )}
              {currentReview.status !== 'Đã duyệt' && (
                <button className="admin-btn-primary" onClick={() => handleAction('approve', currentReview)}>Duyệt hiển thị</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
