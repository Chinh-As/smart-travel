import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminUserService } from '../../services/adminUserService';
import EmptyState from '../../components/EmptyState';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const { showToast, showConfirm } = useOutletContext();
  const { user: currentUser } = useAuth();

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
    try {
      const data = await adminUserService.getAllUsers(kw, pg, 10);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(debouncedSearch, page);
  }, [debouncedSearch, page]);

  const handleToggleStatus = (user) => {
    const isLocking = user.isActive;
    const actionName = isLocking ? 'Khóa' : 'Mở khóa';

    showConfirm({
      title: `${actionName} tài khoản`,
      message: `Bạn có chắc chắn muốn ${actionName.toLowerCase()} tài khoản ${user.email}?`,
      confirmText: actionName,
      type: isLocking ? 'danger' : 'primary',
      onConfirm: async () => {
        try {
          await adminUserService.updateUserStatus(user.id, !isLocking);
          showToast(`Đã ${actionName.toLowerCase()} tài khoản "${user.email}" thành công.`, 'success');
          loadData(debouncedSearch, page);
        } catch (err) {
          showToast(err.message || `Lỗi khi ${actionName.toLowerCase()} tài khoản`, 'error');
        }
      }
    });
  };

  const handleToggleRole = (user) => {
    if (currentUser?.userId === user.id) return; // Prevent self-demotion

    const isPromoting = user.role !== 'ADMIN';
    const actionName = isPromoting ? 'Nâng cấp lên Admin' : 'Hạ cấp xuống User';
    const targetRole = isPromoting ? 'ADMIN' : 'USER';

    showConfirm({
      title: `${actionName}`,
      message: `Bạn có chắc chắn muốn ${actionName.toLowerCase()} cho tài khoản ${user.email}? ${!isPromoting ? 'Họ sẽ mất toàn bộ quyền truy cập Admin.' : ''}`,
      confirmText: actionName,
      type: isPromoting ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await adminUserService.updateUserRole(user.id, targetRole);
          showToast(`Đã ${actionName.toLowerCase()} cho tài khoản "${user.email}" thành công.`, 'success');
          loadData(debouncedSearch, page);
        } catch (err) {
          showToast(err.message || `Lỗi khi ${actionName.toLowerCase()} tài khoản`, 'error');
        }
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <nav className="admin-breadcrumb">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Người dùng</span>
          </nav>
          <h2 className="font-display-lg text-on-surface">Quản lý người dùng</h2>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search" style={{ maxWidth: '400px', width: '100%' }}>
          <span className="material-symbols-outlined admin-search-icon">search</span>
          <input 
            type="text" 
            className="admin-toolbar-search-input" 
            placeholder="Tìm kiếm email hoặc tên..." 
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
          ) : users.length === 0 ? (
            <EmptyState icon="person_off" message="Chưa có người dùng nào" subMessage="Thử thay đổi bộ lọc tìm kiếm" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên hiển thị</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tham gia</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table-user">
                        <div className="admin-table-avatar">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-body-md" style={{ fontWeight: '500', color: 'var(--color-on-surface)' }}>
                          {user.name || 'Người dùng'}
                        </span>
                      </div>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">
                      <div style={{ fontWeight: '500' }}>{user.email}</div>
                      <div 
                        style={{ 
                          fontSize: '11px', 
                          color: 'var(--color-outline-variant)', 
                          fontFamily: 'monospace', 
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          background: 'var(--color-surface-container-highest)',
                          borderRadius: '4px',
                          userSelect: 'all'
                        }}
                        title="Bấm để sao chép UUID"
                        onClick={() => {
                          navigator.clipboard.writeText(user.id);
                          showToast('Đã sao chép UUID người dùng', 'success');
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>content_copy</span>
                        {user.id}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge-pill`} style={{ 
                        backgroundColor: user.role === 'ADMIN' ? 'rgba(15, 76, 117, 0.1)' : 'rgba(100, 116, 139, 0.1)', 
                        color: user.role === 'ADMIN' ? '#0F4C75' : '#64748b',
                        fontWeight: '600'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`admin-badge-pill ${user.isActive ? 'success' : 'error'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                        {currentUser?.userId !== user.id && (
                          <button 
                            className={`admin-table-action-btn ${user.role === 'ADMIN' ? 'delete' : 'edit'}`} 
                            title={user.role === 'ADMIN' ? 'Hạ cấp xuống User' : 'Nâng cấp lên Admin'} 
                            onClick={() => handleToggleRole(user)}
                            style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: `1px solid ${user.role === 'ADMIN' ? 'var(--color-error)' : 'var(--color-primary)'}`,
                              color: user.role === 'ADMIN' ? 'var(--color-error)' : 'var(--color-primary)'
                            }}
                          >
                            {user.role === 'ADMIN' ? 'Hạ cấp' : 'Nâng cấp'}
                          </button>
                        )}
                        <button 
                          className={`admin-table-action-btn ${user.isActive ? 'delete' : 'edit'}`} 
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'} 
                          onClick={() => handleToggleStatus(user)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {user.isActive ? 'lock' : 'lock_open'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && users.length > 0 && (
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

export default AdminUserManagement;
