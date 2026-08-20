import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminDestinationService } from '../../services/adminDestinationService';
import EmptyState from '../../components/EmptyState';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]); // [{id, displayName}]
  const [failedImages, setFailedImages] = useState(new Set()); // track IDs of places with broken images

  const markImageFailed = (id) => setFailedImages(prev => new Set([...prev, id]));

  // Vietnamese provinces & cities list for address parsing
  const VN_PROVINCES = [
    'An Giang','Bà Rịa - Vũng Tàu','Bạc Liêu','Bắc Giang','Bắc Kạn','Bắc Ninh',
    'Bến Tre','Bình Dương','Bình Định','Bình Phước','Bình Thuận','Cà Mau',
    'Cao Bằng','Cần Thơ','Đà Nẵng','Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai',
    'Đồng Tháp','Gia Lai','Hà Giang','Hà Nam','Hà Nội','Hà Tĩnh','Hải Dương',
    'Hải Phòng','Hậu Giang','Hòa Bình','Hưng Yên','Khánh Hòa','Kiên Giang',
    'Kon Tum','Lai Châu','Lâm Đồng','Lạng Sơn','Lào Cai','Long An','Nam Định',
    'Nghệ An','Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình',
    'Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng','Sơn La',
    'Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa','Thừa Thiên Huế','Tiền Giang',
    'TP. Hồ Chí Minh','Trà Vinh','Tuyên Quang','Vĩnh Long',
    'Vĩnh Phúc','Yên Bái','Đà Lạt','Nha Trang','Phú Quốc','Vũng Tàu','Huế',
    'Hội An','Buôn Ma Thuột'
  ];
  const extractProvince = (address) => {
    if (!address) return null;
    // Try longest match first to avoid partial hits
    const sorted = [...VN_PROVINCES].sort((a, b) => b.length - a.length);
    for (const prov of sorted) {
      if (address.toLowerCase().includes(prov.toLowerCase())) return prov;
    }
    return null;
  };

  // Derive unique provinces from loaded destinations
  const uniqueProvinces = [...new Set(
    destinations.map(d => extractProvince(d.location)).filter(Boolean)
  )].sort();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cityFilter, categoryFilter]);
  
  // Drawer & Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add' or 'edit'
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentDest, setCurrentDest] = useState(null);
  const [formData, setFormData] = useState({
    name: '', categoryIds: [], status: 'Hoạt động', description: '', image: '', lng: 106.681, lat: 10.763
  });
  const [formProvince, setFormProvince] = useState('');
  const [formDetailAddress, setFormDetailAddress] = useState('');

  const { showToast, showConfirm } = useOutletContext();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminDestinationService.getAllDestinations();
      setDestinations(data);
    } catch (err) {
      console.error('Load destinations error:', err);
      showToast('Không thể tải danh sách địa điểm. Vui lòng kiểm tra kết nối.', 'error');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    adminDestinationService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleDelete = (id, name) => {
    showConfirm({
      title: 'Xóa địa điểm',
      message: `Bạn có chắc chắn muốn xóa địa điểm "${name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      onConfirm: async () => {
        await adminDestinationService.deleteDestination(id);
        setDestinations(prev => prev.filter(d => d.id !== id));
        showToast(`Đã xóa địa điểm "${name}" thành công.`);
      }
    });
  };

  const openAddDrawer = () => {
    setDrawerMode('add');
    setFormData({ name: '', categoryIds: [], status: 'Hoạt động', description: '', image: '', lng: 106.681, lat: 10.763 });
    setFormProvince('');
    setFormDetailAddress('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (dest) => {
    setDrawerMode('edit');
    setCurrentDest(dest);
    const prov = extractProvince(dest.location) || '';
    const detail = prov && dest.location
      ? dest.location.replace(new RegExp(`,?\\s*${prov.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`, 'i'), '').trim().replace(/,$/, '').trim()
      : (dest.location || '');
    setFormProvince(prov);
    setFormDetailAddress(detail);
    setFormData({
      name: dest.name,
      categoryIds: dest.categoryIds || [],
      status: dest.status || 'Hoạt động',
      description: dest.description || '',
      image: dest.image || '',
      lng: dest.lng,
      lat: dest.lat,
      rating: dest.rating,
    });
    setIsDrawerOpen(true);
  };

  const openViewModal = (dest) => {
    setCurrentDest(dest);
    setIsViewOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formProvince) {
      showToast('Vui lòng điền tên địa điểm và chọn tỉnh/thành phố', 'error');
      return;
    }
    // Combine detail address + province into full address
    const fullAddress = formDetailAddress
      ? `${formDetailAddress}, ${formProvince}, Việt Nam`
      : `${formProvince}, Việt Nam`;
    const payload = { ...formData, location: fullAddress };
    if (drawerMode === 'add') {
      const newDest = {
        ...payload,
        rating: 0,
        image: payload.image || 'https://via.placeholder.com/150'
      };
      const added = await adminDestinationService.createDestination(newDest);
      setDestinations([added, ...destinations]);
      showToast('Đã thêm địa điểm mới thành công.');
    } else {
      const updated = await adminDestinationService.updateDestination(currentDest.id, payload);
      setDestinations(prev => prev.map(d => d.id === currentDest.id ? updated : d));
      showToast(`Đã cập nhật địa điểm "${payload.name}".`);
    }
    setIsDrawerOpen(false);
  };

  const filteredDestinations = destinations.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Match city: check if the full address contains the selected province name
    const matchCity = cityFilter
      ? (d.location || '').toLowerCase().includes(cityFilter.toLowerCase())
      : true;
    // Match category: check display name against d.category string
    const matchCategory = categoryFilter
      ? d.category === categoryFilter
      : true;
    return matchSearch && matchCity && matchCategory;
  });

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'Cảnh quan':        return { icon: 'landscape',      grad: 'linear-gradient(135deg, #0ea5e9, #0369a1)' };
      case 'Lịch sử - Văn hóa': return { icon: 'account_balance', grad: 'linear-gradient(135deg, #f59e0b, #b45309)' };
      case 'Nghỉ dưỡng biển': return { icon: 'beach_access',   grad: 'linear-gradient(135deg, #06b6d4, #0e7490)' };
      case 'Ẩm thực':           return { icon: 'restaurant',      grad: 'linear-gradient(135deg, #f97316, #c2410c)' };
      case 'Giải trí':          return { icon: 'theater_comedy',  grad: 'linear-gradient(135deg, #a855f7, #7c3aed)' };
      case 'Mua sắm':           return { icon: 'shopping_bag',    grad: 'linear-gradient(135deg, #ec4899, #be185d)' };
      case 'Thiên nhiên':        return { icon: 'forest',          grad: 'linear-gradient(135deg, #22c55e, #15803d)' };
      case 'Tâm linh':           return { icon: 'temple_buddhist', grad: 'linear-gradient(135deg, #eab308, #a16207)' };
      case 'Thể thao':          return { icon: 'sports_soccer',   grad: 'linear-gradient(135deg, #f43f5e, #be123c)' };
      case 'Nghệ thuật - Bảo tàng': return { icon: 'museum',       grad: 'linear-gradient(135deg, #8b5cf6, #5b21b6)' };
      case 'Động vật hoang dã': return { icon: 'pets',            grad: 'linear-gradient(135deg, #10b981, #047857)' };
      case 'Lễ hội':            return { icon: 'festival',        grad: 'linear-gradient(135deg, #f43f5e, #b91c1c)' };
      case 'Mạo hiểm':          return { icon: 'hiking',          grad: 'linear-gradient(135deg, #d97706, #78350f)' };
      case 'Gia đình':          return { icon: 'family_restroom', grad: 'linear-gradient(135deg, #14b8a6, #0f766e)' };
      case 'Lãng mạn':          return { icon: 'favorite',        grad: 'linear-gradient(135deg, #ec4899, #be185d)' };
      case 'Sang trọng':        return { icon: 'workspace_premium', grad: 'linear-gradient(135deg, #fbbf24, #b45309)' };
      case 'Tiết kiệm':         return { icon: 'savings',         grad: 'linear-gradient(135deg, #22c55e, #15803d)' };
      case 'Du lịch sinh thái':  return { icon: 'eco',             grad: 'linear-gradient(135deg, #84cc16, #4d7c0f)' };
      case 'Tình nguyện':       return { icon: 'volunteer_activism', grad: 'linear-gradient(135deg, #f43f5e, #9f1239)' };
      case 'Sức khỏe':          return { icon: 'spa',             grad: 'linear-gradient(135deg, #06b6d4, #0891b2)' };
      case 'Giáo dục':          return { icon: 'school',          grad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' };
      case 'Cuộc sống về đêm':  return { icon: 'nightlife',       grad: 'linear-gradient(135deg, #6366f1, #312e81)' };
      case 'Đám cưới':          return { icon: 'local_florist',   grad: 'linear-gradient(135deg, #f472b6, #db2777)' };
      case 'Công tác':          return { icon: 'business_center', grad: 'linear-gradient(135deg, #475569, #1e293b)' };
      default:                  return { icon: 'place',           grad: 'linear-gradient(135deg, #6b7280, #374151)' };
    }
  };

  const ITEMS_PER_PAGE = 10;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDestinations = filteredDestinations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE) || 1;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <nav className="admin-breadcrumb">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Địa điểm</span>
          </nav>
          <h2 className="font-display-lg text-on-surface">Quản lý địa điểm</h2>
        </div>
        <button className="admin-btn-primary with-icon" onClick={openAddDrawer}>
          <span className="material-symbols-outlined">add_location_alt</span>
          Thêm địa điểm mới
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search" style={{ position: 'relative' }}>
          <span className="material-symbols-outlined admin-search-icon">search</span>
          <input 
            type="text" 
            className="admin-toolbar-search-input" 
            placeholder="Lọc nhanh theo tên địa điểm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>
        <div className="admin-filter-group">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)' }}>location_city</span>
          <select className="admin-filter-select" value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            style={cityFilter ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 } : {}}>
            <option value="">Tất cả tỉnh/thành</option>
            {[...VN_PROVINCES].filter((v, i, a) => a.indexOf(v) === i).sort().map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
          {cityFilter && (
            <button onClick={() => setCityFilter('')} title="Xóa bộ lọc thành phố" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
            </button>
          )}
        </div>
        <div className="admin-filter-group">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)' }}>category</span>
          <select className="admin-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={categoryFilter ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 } : {}}>
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.displayName}>{cat.displayName}</option>
            ))}
          </select>
          {categoryFilter && (
            <button onClick={() => setCategoryFilter('')} title="Xóa bộ lọc danh mục" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
            </button>
          )}
        </div>
        {(cityFilter || categoryFilter || searchTerm) && (
          <button
            className="admin-toolbar-btn"
            onClick={() => { setSearchTerm(''); setCityFilter(''); setCategoryFilter(''); }}
            title="Xóa tất cả bộ lọc"
            style={{ color: 'var(--color-error)', gap: '4px', display: 'flex', alignItems: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_alt_off</span>
          </button>
        )}
        <button className="admin-toolbar-btn" onClick={loadData} title="Tải lại dữ liệu">
          <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <EmptyState icon="hourglass_empty" message="Đang tải dữ liệu..." />
          ) : filteredDestinations.length === 0 ? (
            <EmptyState icon="inbox" message="Chưa có địa điểm nào" subMessage="Hãy thử thay đổi bộ lọc hoặc thêm địa điểm mới" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên địa điểm</th>
                  <th>Thành phố</th>
                  <th>Danh mục</th>
                  <th style={{ textAlign: 'center' }}>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDestinations.map(dest => (
                  <tr key={dest.id}>
                    <td>
                      {failedImages.has(dest.id) ? (
                        (() => {
                          const { icon, grad } = getCategoryMeta(dest.category);
                          return (
                            <div className="admin-table-img" style={{
                              background: grad,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '8px', flexShrink: 0
                            }}>
                              <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                            </div>
                          );
                        })()
                      ) : (
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="admin-table-img"
                          onError={() => markImageFailed(dest.id)}
                        />
                      )}
                    </td>
                    <td className="font-body-md" style={{ fontWeight: '500', color: 'var(--color-on-surface)' }}>{dest.name}</td>
                    <td className="font-body-sm text-on-surface-variant">{dest.location}</td>
                    <td>
                      <span className="admin-badge-pill" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--color-primary)' }}>
                        {dest.category || 'Chung'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span style={{ fontWeight: '600' }}>{dest.rating}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge-pill ${dest.status === 'Hoạt động' ? 'success' : 'error'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {dest.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-table-action-btn" title="Xem chi tiết" onClick={() => openViewModal(dest)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                        </button>
                        <button className="admin-table-action-btn edit" title="Chỉnh sửa" onClick={() => openEditDrawer(dest)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                        </button>
                        <button className="admin-table-action-btn delete" title="Xóa" onClick={() => handleDelete(dest.id, dest.name)}>
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
        
        {!loading && filteredDestinations.length > 0 && (
          <div className="admin-table-footer">
            <span className="font-body-sm text-on-surface-variant">
              Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredDestinations.length)} trên tổng số {filteredDestinations.length}
            </span>
            <div className="admin-pagination">
              <button 
                className="admin-page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="admin-page-btn active">{currentPage}</button>
              <button 
                className="admin-page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
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
              <h3 className="admin-drawer-title">{drawerMode === 'add' ? 'Thêm địa điểm mới' : 'Chỉnh sửa địa điểm'}</h3>
              <button className="admin-modal-close" onClick={() => setIsDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-drawer-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Tên địa điểm *</label>
                <input type="text" className="admin-form-input" name="name" value={formData.name} onChange={handleFormChange} placeholder="VD: Vịnh Hạ Long" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Tỉnh / Thành phố *</label>
                <select
                  className="admin-form-select"
                  value={formProvince}
                  onChange={e => setFormProvince(e.target.value)}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {[...VN_PROVINCES].filter((v, i, a) => a.indexOf(v) === i).sort().map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Số nhà, đường, phường/quận <span style={{fontWeight:400,color:'var(--color-on-surface-variant)'}}>(tùy chọn)</span></label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formDetailAddress}
                  onChange={e => setFormDetailAddress(e.target.value)}
                  placeholder="VD: 65 Hàng Điếu, Hoàn Kiếm"
                />
                {(formProvince || formDetailAddress) && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                    <span>{formDetailAddress ? `${formDetailAddress}, ` : ''}{formProvince}{formProvince ? ', Việt Nam' : ''}</span>
                  </div>
                )}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Danh mục</label>
                <select
                  className="admin-form-select"
                  value={formData.categoryIds && formData.categoryIds.length > 0 ? formData.categoryIds[0] : ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, categoryIds: val ? [val] : [] }));
                  }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Trạng thái</label>
                <select className="admin-form-select" name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">URL Hình ảnh</label>
                <input
                  type="text"
                  className="admin-form-input"
                  name="image"
                  value={formData.image || ''}
                  onChange={handleFormChange}
                  placeholder="https://..."
                />
                {formData.image && (
                  <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-outline-variant)', height: '150px' }}>
                    <img
                      src={formData.image}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.style.background = 'var(--color-surface-variant)'; e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-on-surface-variant);font-size:13px;gap:6px"><span class=\'material-symbols-outlined\'>broken_image</span>URL ảnh không hợp lệ</div>'; }}
                    />
                  </div>
                )}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả</label>
                <textarea className="admin-form-textarea" name="description" value={formData.description} onChange={handleFormChange} placeholder="Mô tả chi tiết về địa điểm..."></textarea>
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
      {isViewOpen && currentDest && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsViewOpen(false) }}>
          <div className="admin-modal large">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Chi tiết địa điểm</h3>
              <button className="admin-modal-close" onClick={() => setIsViewOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: 0 }}>
              {failedImages.has(currentDest.id) ? (
                (() => {
                  const { icon, grad } = getCategoryMeta(currentDest.category);
                  return (
                    <div style={{
                      width: '100%', height: '250px', background: grad,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}>
                      <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '56px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: 500 }}>{currentDest.category || 'Địa điểm du lịch'}</span>
                    </div>
                  );
                })()
              ) : (
                <img
                  src={currentDest.image}
                  alt={currentDest.name}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                  onError={() => markImageFailed(currentDest.id)}
                />
              )}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '8px' }}>{currentDest.name}</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="admin-badge-pill" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--color-primary)' }}>{currentDest.category || 'Chung'}</span>
                      <span className="font-body-sm text-on-surface-variant" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                        {currentDest.location}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fffbeb', color: '#f59e0b', padding: '8px 16px', borderRadius: '12px', fontWeight: 600 }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {currentDest.rating}
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h4 className="font-label-md text-on-surface-variant" style={{ marginBottom: '8px' }}>Mô tả</h4>
                  <p className="font-body-md text-on-surface" style={{ lineHeight: '1.6' }}>
                    {currentDest.description || 'Chưa có thông tin mô tả chi tiết cho địa điểm này. Bạn có thể thêm mô tả trong phần chỉnh sửa.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px' }}>
                  <div>
                    <div className="font-label-sm text-on-surface-variant">Trạng thái</div>
                    <div className="font-body-md" style={{ fontWeight: 600, color: currentDest.status === 'Hoạt động' ? '#10b981' : '#ef4444' }}>{currentDest.status}</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-on-surface-variant">ID Hệ thống</div>
                    <div className="font-body-md">{currentDest.id}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setIsViewOpen(false)}>Đóng</button>
              <button className="admin-btn-primary" onClick={() => { setIsViewOpen(false); openEditDrawer(currentDest); }}>Chỉnh sửa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
