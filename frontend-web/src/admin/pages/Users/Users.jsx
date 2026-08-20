import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminUserService } from '../../services/adminUserService';
import EmptyState from '../../components/EmptyState';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', status: 'Hoạt động', role: 'User'
  });

  const { showToast, showConfirm } = useOutletContext();

  const loadData = () => {
    setLoading(true);
    adminUserService.getAllUsers().then(data => {
      setUsers(data);
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

  const handleToggleLock = (user) => {
    const isLocked = user.status !== 'Hoạt động';
    const actionName = isLocked ? 'Mở khóa' : 'Khóa';
    
    showConfirm({
      title: `${actionName} tài khoản`,
      message: `Bạn có chắc chắn muốn ${actionName.toLowerCase()} tài khoản của ${user.name}?`,
      confirmText: actionName,
      type: isLocked ? 'primary' : 'danger',
      onConfirm: async () => {
        const newStatus = isLocked ? 'Hoạt động' : 'Đã khóa';
        await adminUserService.updateUserStatus(user.id, newStatus);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        showToast(`Đã ${actionName.toLowerCase()} tài khoản "${user.name}" thành công.`);
        if (currentUser && currentUser.id === user.id) {
          setCurrentUser(prev => ({ ...prev, status: newStatus }));
        }
      }
    });
  };

  const openAddDrawer = () => {
    setDrawerMode('add');
    setFormData({ name: '', email: '', phone: '', status: 'Hoạt động', role: 'User' });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (user) => {
    setDrawerMode('edit');
    setCurrentUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      phone: user.phone || '090xxxxxxx', 
      status: user.status, 
      role: 'User' 
    });
    setIsDrawerOpen(true);
  };

  const openViewModal = (user) => {
    setCurrentUser(user);
    setIsViewOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      showToast('Vui lòng điền tên và email', 'error');
      return;
    }

    if (drawerMode === 'add') {
      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        joinDate: new Date().toLocaleDateString('vi-VN'),
        avatar: 'https://via.placeholder.com/150'
      };
      setUsers([newUser, ...users]);
      showToast('Đã thêm người dùng mới thành công.');
    } else {
      const updatedUser = { ...currentUser, ...formData };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      showToast(`Đã cập nhật thông tin của "${formData.name}".`);
    }
    setIsDrawerOpen(false);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? (statusFilter === 'Khóa' ? u.status !== 'Hoạt động' : u.status === statusFilter) : true;
    return matchSearch && matchStatus;
  });

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
        <button className="admin-btn-primary with-icon" onClick={openAddDrawer}>
          <span className="material-symbols-outlined">person_add</span>
          Thêm người dùng mới
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <span className="material-symbols-outlined admin-search-icon">search</span>
          <input 
            type="text" 
            className="admin-toolbar-search-input" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filter-group">
          <span className="font-label-md text-on-surface-variant">Trạng thái:</span>
          <select className="admin-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Khóa">Bị khóa</option>
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
          ) : filteredUsers.length === 0 ? (
            <EmptyState icon="person_off" message="Chưa có người dùng nào" subMessage="Thử thay đổi bộ lọc tìm kiếm" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Ngày tham gia</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table-user">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="admin-table-avatar" 
                          style={{ display: 'none', width: '36px', height: '36px' }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span className="font-body-md" style={{ fontWeight: '500', color: 'var(--color-on-surface)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{user.email}</td>
                    <td className="font-body-sm text-on-surface-variant">{user.joinDate}</td>
                    <td>
                      <span className={`admin-badge-pill ${user.status === 'Hoạt động' ? 'success' : 'error'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-table-action-btn" title="Xem hồ sơ" onClick={() => openViewModal(user)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                        </button>
                        <button className="admin-table-action-btn edit" title="Sửa thông tin" onClick={() => openEditDrawer(user)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                        </button>
                        <button className="admin-table-action-btn delete" title={user.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa'} onClick={() => handleToggleLock(user)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {user.status === 'Hoạt động' ? 'lock' : 'lock_open'}
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
        
        {!loading && filteredUsers.length > 0 && (
          <div className="admin-table-footer">
            <span className="font-body-sm text-on-surface-variant">Hiển thị 1-{filteredUsers.length} trên tổng số {filteredUsers.length}</span>
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

      {/* Add/Edit Drawer */}
      {isDrawerOpen && (
        <div className="admin-drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false) }}>
          <div className="admin-drawer">
            <div className="admin-drawer-header">
              <h3 className="admin-drawer-title">{drawerMode === 'add' ? 'Thêm người dùng mới' : 'Sửa thông tin người dùng'}</h3>
              <button className="admin-modal-close" onClick={() => setIsDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Họ và Tên *</label>
                <input type="text" className="admin-form-input" name="name" value={formData.name} onChange={handleFormChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email *</label>
                <input type="email" className="admin-form-input" name="email" value={formData.email} onChange={handleFormChange} disabled={drawerMode === 'edit'} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Số điện thoại</label>
                <input type="text" className="admin-form-input" name="phone" value={formData.phone} onChange={handleFormChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Vai trò</label>
                <select className="admin-form-select" name="role" value={formData.role} onChange={handleFormChange}>
                  <option value="User">Người dùng thường</option>
                  <option value="Admin">Quản trị viên</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Trạng thái</label>
                <select className="admin-form-select" name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Đã khóa">Khóa</option>
                </select>
              </div>
            </div>
            <div className="admin-drawer-footer">
              <button className="admin-btn-secondary" onClick={() => setIsDrawerOpen(false)}>Hủy</button>
              <button className="admin-btn-primary" onClick={handleSave}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {isViewOpen && currentUser && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsViewOpen(false) }}>
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div></div>
              <button className="admin-modal-close" onClick={() => setIsViewOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 0 }}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: '4px solid var(--color-surface-container)' }} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="admin-table-avatar" 
                style={{ display: 'none', width: '100px', height: '100px', fontSize: '32px', marginBottom: '16px', border: '4px solid var(--color-surface-container)' }}
              >
                {getInitials(currentUser.name)}
              </div>
              <h2 className="font-headline-md text-on-surface" style={{ marginBottom: '4px' }}>{currentUser.name}</h2>
              <p className="font-body-md text-on-surface-variant" style={{ marginBottom: '16px' }}>{currentUser.email}</p>
              
              <span className={`admin-badge-pill ${currentUser.status === 'Hoạt động' ? 'success' : 'error'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                {currentUser.status}
              </span>

              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px', textAlign: 'left' }}>
                <div>
                  <div className="font-label-sm text-on-surface-variant">Ngày tham gia</div>
                  <div className="font-body-md" style={{ fontWeight: 600 }}>{currentUser.joinDate}</div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant">Số điện thoại</div>
                  <div className="font-body-md" style={{ fontWeight: 600 }}>{currentUser.phone || 'Chưa cập nhật'}</div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant">Số lần đặt chỗ</div>
                  <div className="font-body-md" style={{ fontWeight: 600 }}>{Math.floor(Math.random() * 10) + 1}</div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant">Số đánh giá</div>
                  <div className="font-body-md" style={{ fontWeight: 600 }}>{Math.floor(Math.random() * 5)}</div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
              <button className={`admin-btn-${currentUser.status === 'Hoạt động' ? 'danger' : 'primary'}`} onClick={() => { setIsViewOpen(false); handleToggleLock(currentUser); }}>
                {currentUser.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
