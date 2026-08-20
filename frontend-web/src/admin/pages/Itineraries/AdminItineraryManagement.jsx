import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminItineraryService } from '../../services/adminItineraryService';
import EmptyState from '../../components/EmptyState';

const AdminItineraryManagement = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // States for expanded rows and their details
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({});
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);

  const { showToast } = useOutletContext();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async (kw, pg) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminItineraryService.getItineraries(kw, pg, 10);
      setItineraries(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách lịch trình');
      showToast(err.message || 'Không thể tải danh sách lịch trình', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(debouncedSearch, page);
  }, [debouncedSearch, page]);

  const handleToggleExpand = async (id) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
      return;
    }

    setExpandedRowId(id);

    // Fetch details if not cached
    if (!detailsCache[id]) {
      setLoadingDetailsId(id);
      try {
        const details = await adminItineraryService.getItineraryDetails(id);
        setDetailsCache(prev => ({ ...prev, [id]: details }));
      } catch (err) {
        showToast(err.message || 'Không thể lấy thông tin chi tiết lịch trình', 'error');
        setExpandedRowId(null);
      } finally {
        setLoadingDetailsId(null);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="admin-badge-pill success">Đã xác nhận</span>;
      case 'COMPLETED':
        return <span className="admin-badge-pill" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="admin-badge-pill error">Đã hủy</span>;
      case 'DRAFT':
      default:
        return <span className="admin-badge-pill warning">Nháp</span>;
    }
  };

  if (error) {
    return (
      <div className="admin-card" style={{ padding: '40px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)', marginBottom: '16px' }}>error</span>
        <h3 className="font-headline-md text-on-surface">Đã xảy ra lỗi</h3>
        <p className="font-body-md text-on-surface-variant mt-2 mb-6">{error}</p>
        <button className="admin-btn-primary" onClick={() => loadData(debouncedSearch, page)}>Thử lại</button>
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
            <span className="text-primary">Lịch trình</span>
          </nav>
          <h2 className="font-display-lg text-on-surface">Quản lý lịch trình</h2>
        </div>
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
        <button className="admin-toolbar-btn" onClick={() => loadData(debouncedSearch, page)}>
          <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <EmptyState icon="hourglass_empty" message="Đang tải dữ liệu..." />
          ) : itineraries.length === 0 ? (
            <EmptyState icon="route" message="Không có lịch trình nào" subMessage="Thử thay đổi bộ lọc tìm kiếm" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>ID Lịch trình</th>
                  <th>Email người dùng</th>
                  <th>Ngày tạo</th>
                  <th>Số hoạt động</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {itineraries.map(itinerary => {
                  const isExpanded = expandedRowId === itinerary.id;
                  return (
                    <React.Fragment key={itinerary.id}>
                      <tr>
                        <td>
                          <button 
                            className="admin-table-action-btn"
                            style={{ padding: '4px', display: 'flex', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            onClick={() => handleToggleExpand(itinerary.id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                          </button>
                        </td>
                        <td className="font-body-sm text-on-surface-variant" style={{ fontFamily: 'monospace' }}>
                          {itinerary.id}
                        </td>
                        <td className="font-body-md" style={{ fontWeight: '500' }}>
                          {itinerary.userEmail}
                        </td>
                        <td className="font-body-sm text-on-surface-variant">
                          {formatDate(itinerary.createdAt)}
                        </td>
                        <td className="font-body-sm text-on-surface-variant" style={{ fontWeight: '600' }}>
                          {itinerary.slotCount}
                        </td>
                        <td>
                          {getStatusBadge(itinerary.status)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="admin-btn-secondary" 
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            onClick={() => handleToggleExpand(itinerary.id)}
                          >
                            {isExpanded ? 'Đóng' : 'Xem chi tiết'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Detail Section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '20px 40px' }}>
                            {loadingDetailsId === itinerary.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface-variant)' }}>
                                <span className="material-symbols-outlined" style={{ animation: 'spin 1.5s linear infinite' }}>sync</span>
                                <span>Đang tải thông tin hoạt động chi tiết...</span>
                              </div>
                            ) : detailsCache[itinerary.id]?.activities?.length === 0 ? (
                              <div className="text-on-surface-variant font-body-md">Không có hoạt động nào trong lịch trình này.</div>
                            ) : (
                              <div>
                                <h4 className="font-headline-sm text-on-surface mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="material-symbols-outlined text-primary">route</span>
                                  <span>Chi tiết hoạt động ({detailsCache[itinerary.id]?.slotCount} slots)</span>
                                </h4>

                                <div className="admin-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--color-outline-variant)', paddingLeft: '20px', marginLeft: '10px', position: 'relative' }}>
                                  {detailsCache[itinerary.id]?.activities.map((act, index) => (
                                    <div key={index} className="admin-timeline-item" style={{ position: 'relative' }}>
                                      <div className="admin-timeline-dot" style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', border: '2px solid var(--color-surface)' }}></div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <span className="font-label-md" style={{ color: 'var(--color-primary)', fontWeight: '600', backgroundColor: 'rgba(15, 76, 117, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {formatTime(act.startTime)} - {formatTime(act.endTime)}
                                          </span>
                                          <span className="font-body-md" style={{ fontWeight: '600', color: 'var(--color-on-surface)' }}>
                                            {act.placeName}
                                          </span>
                                        </div>
                                        {act.note && (
                                          <div className="font-body-sm text-on-surface-variant" style={{ fontStyle: 'italic', backgroundColor: 'var(--color-surface)', padding: '6px 12px', borderRadius: '6px', marginTop: '4px', borderLeft: '3px solid var(--color-primary-container)' }}>
                                            Ghi chú: {act.note}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && itineraries.length > 0 && (
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
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`admin-page-btn ${page === i ? 'active' : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
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
    </div>
  );
};

export default AdminItineraryManagement;
