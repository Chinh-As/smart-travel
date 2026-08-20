import React, { useState } from 'react';
import './TipsHelpWidget.css';

export const TipsHelpWidget = () => {
  const [activeDialog, setActiveDialog] = useState(null); // 'docs', 'faqs', 'bug', 'support'
  const [bugDescription, setBugDescription] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  const handleAction = (type) => {
    setActiveDialog(type);
    setBugSubmitted(false);
    setBugDescription('');
  };

  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugDescription.trim()) return;
    setBugSubmitted(true);
    setTimeout(() => {
      setActiveDialog(null);
    }, 2000);
  };

  return (
    <div className="tips-help-widget">
      <h3>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>lightbulb</span>
        Mẹo & Trợ giúp
      </h3>
      <div className="help-links-list">
        <button className="help-link-btn" onClick={() => handleAction('docs')}>
          <span className="material-symbols-outlined help-icon">menu_book</span>
          <span className="help-label">Tài liệu hướng dẫn</span>
        </button>
        <button className="help-link-btn" onClick={() => handleAction('faqs')}>
          <span className="material-symbols-outlined help-icon">help_outline</span>
          <span className="help-label">Câu hỏi thường gặp</span>
        </button>
        <button className="help-link-btn" onClick={() => handleAction('bug')}>
          <span className="material-symbols-outlined help-icon">bug_report</span>
          <span className="help-label">Báo cáo lỗi</span>
        </button>
        <button className="help-link-btn" onClick={() => handleAction('support')}>
          <span className="material-symbols-outlined help-icon">support_agent</span>
          <span className="help-label">Liên hệ hỗ trợ</span>
        </button>
      </div>

      {activeDialog && (
        <div className="help-dialog-overlay" onClick={() => setActiveDialog(null)}>
          <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="help-dialog-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {activeDialog === 'docs' && '📚 Tài liệu hướng dẫn'}
                {activeDialog === 'faqs' && '❓ Câu hỏi thường gặp'}
                {activeDialog === 'bug' && '🐛 Báo cáo lỗi hệ thống'}
                {activeDialog === 'support' && '💬 Liên hệ hỗ trợ'}
              </h4>
              <button className="help-dialog-close" onClick={() => setActiveDialog(null)}>✕</button>
            </div>
            <div className="help-dialog-content">
              {activeDialog === 'docs' && (
                <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  <p>Chào mừng bạn đến với hệ thống quản trị <strong>Smart Travel</strong>. Dưới đây là các tài liệu hướng dẫn cơ bản:</p>
                  <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    <li><strong>Quản lý Địa điểm:</strong> Sử dụng menu <em>Địa điểm</em> để thêm, sửa, hoặc duyệt các điểm du lịch. Bản đồ tích hợp giúp định vị tọa độ GPS chính xác.</li>
                    <li><strong>Kiểm duyệt Đánh giá:</strong> Menu <em>Đánh giá</em> cho phép lọc các đánh giá chưa được kiểm duyệt để duyệt hoặc từ chối hiển thị.</li>
                    <li><strong>Quản lý Lịch trình:</strong> Sử dụng menu <em>Lịch trình</em> để quản lý danh sách các lịch trình đã tạo và lưu của người dùng.</li>
                  </ul>
                </div>
              )}

              {activeDialog === 'faqs' && (
                <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  <p><strong>Q: Tại sao hình ảnh địa điểm không hiển thị?</strong></p>
                  <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '10px' }}>A: Hãy chắc chắn liên kết hình ảnh là chính xác và hoạt động. Nếu thiếu hình ảnh, hệ thống sẽ tự động tạo dải màu gradient đẹp mắt để làm ảnh đại diện thay thế.</p>
                  
                  <p><strong>Q: Làm sao để thay đổi tên thương hiệu hiển thị?</strong></p>
                  <p style={{ color: 'var(--color-on-surface-variant)' }}>A: Bạn có thể vào phần <em>Cài đặt</em> để chỉnh sửa Tên hệ thống hiển thị ở đầu Sidebar và Topbar.</p>
                </div>
              )}

              {activeDialog === 'bug' && (
                <div style={{ fontSize: '13px' }}>
                  {bugSubmitted ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#16a34a', fontWeight: 600 }}>
                      ✅ Đã gửi báo cáo lỗi thành công! Cảm ơn bạn đóng góp.
                    </div>
                  ) : (
                    <form onSubmit={handleBugSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: 0 }}>Mô tả lỗi bạn gặp phải:</p>
                      <textarea 
                        rows="3" 
                        value={bugDescription}
                        onChange={(e) => setBugDescription(e.target.value)}
                        placeholder="Nhập chi tiết lỗi (ví dụ: lỗi hiển thị bản đồ trên thiết bị di động...)"
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(187,202,198,0.5)', outline: 'none', resize: 'vertical' }}
                        required
                      ></textarea>
                      <button 
                        type="submit" 
                        style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Gửi báo cáo
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeDialog === 'support' && (
                <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  <p>Đội ngũ hỗ trợ kỹ thuật Smart Travel luôn sẵn sàng hỗ trợ bạn:</p>
                  <p style={{ margin: '4px 0' }}>📞 <strong>Hotline:</strong> 1900 1234 (8:00 - 18:00)</p>
                  <p style={{ margin: '4px 0' }}>✉️ <strong>Email:</strong> support@smarttravel.vn</p>
                  <p style={{ margin: '4px 0' }}>🌐 <strong>Kênh hỗ trợ:</strong> <a href="https://support.smarttravel.vn" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>support.smarttravel.vn</a></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
