import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUserService } from '../../services/adminUserService';
import { adminReviewService } from '../../services/adminReviewService';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
}

const Dashboard = () => {
  const [stats, setStats] = useState({ destinations: 0, users: 0, itineraries: 0, favorites: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [backendStats, reviewsData] = await Promise.all([
          adminUserService.getAdminStats(),
          adminReviewService.getAllReviews()
        ]);
        
        setStats({
          destinations: backendStats.totalPlaces,
          users: backendStats.totalUsers,
          itineraries: backendStats.totalItineraries,
          favorites: backendStats.totalFavorites
        });
        
        const reviewsContent = reviewsData?.content || [];
        const mappedReviews = reviewsContent.slice(0, 3).map(review => ({
          id: review.id,
          userName: review.userEmail,       // Map backend field
          destinationName: review.placeName,
          rating: review.rating ? Math.round(review.rating) : 0,           // Add rating if available
          reviewText: review.comment,       // Review content
          text: review.comment,
          date: review.createdAt           // Correct field name
        }));
        
        setRecentReviews(mappedReviews);
      } catch (err) {
        console.error('Failed to fetch dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="mb-xl">
        <h2 className="font-headline-lg text-on-surface">Trung tâm Quản trị Smart Travel</h2>
      </section>

      {/* KPI Cards */}
      <section className="dashboard-grid-4">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="font-label-md text-on-surface-variant">Tổng số địa điểm</p>
              <h3 className="font-display-lg text-primary mt-2">{stats.destinations}</h3>
            </div>
            <div className="stat-icon-wrapper primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>landscape</span>
            </div>
          </div>
          <div className="stat-trend text-green-600 font-label-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>trending_up</span>
            <span>Địa điểm đang hoạt động</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="font-label-md text-on-surface-variant">Tổng số người dùng</p>
              <h3 className="font-display-lg text-primary mt-2">{stats.users}</h3>
            </div>
            <div className="stat-icon-wrapper scarcity" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'rgb(234, 179, 8)' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
          </div>
          <div className="stat-trend text-green-600 font-label-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>trending_up</span>
            <span>Tài khoản đã đăng ký</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="font-label-md text-on-surface-variant">Tổng số lịch trình</p>
              <h3 className="font-display-lg text-primary mt-2">{stats.itineraries}</h3>
            </div>
            <div className="stat-icon-wrapper secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
            </div>
          </div>
          <div className="stat-trend text-green-600 font-label-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>trending_up</span>
            <span>Lịch trình được khởi tạo</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="font-label-md text-on-surface-variant">Tổng lượt yêu thích</p>
              <h3 className="font-display-lg text-primary mt-2">{stats.favorites}</h3>
            </div>
            <div className="stat-icon-wrapper primary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
          </div>
          <div className="stat-trend text-red-600 font-label-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>favorite</span>
            <span>Số địa điểm được đánh dấu</span>
          </div>
        </div>
      </section>

      {/* Recent Reviews Widget */}
      <div className="reviews-widget">
        <h3 className="font-headline-md text-on-surface" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
          <span className="material-symbols-outlined text-primary">rate_review</span>
          📝 Đánh giá gần đây
        </h3>
        
        {loading ? (
          <p className="empty-state">Đang tải dữ liệu...</p>
        ) : recentReviews.length > 0 ? (
          <div className="reviews-list">
            {recentReviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="user-email">{review.userName}</span>
                  <span className="time">{formatTimeAgo(review.date)}</span>
                </div>
                
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)} <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', marginLeft: '4px' }}>({review.rating}/5)</span>
                </div>
                
                <div className="review-text">{review.reviewText || review.text}</div>
                
                <div className="review-place">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                  {review.destinationName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Chưa có đánh giá nào</p>
        )}
        
        <Link to="/admin/reviews" className="view-all">
          → Xem tất cả đánh giá
        </Link>
      </div>

      <style>{`
        .reviews-widget {
          background: var(--color-surface-container-lowest, #ffffff);
          border: 1px solid rgba(187, 202, 198, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }

        .review-item {
          border-left: 3px solid var(--color-primary, #006b5f);
          padding-left: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(187, 202, 198, 0.2);
        }

        .review-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: var(--color-on-surface-variant, #3c4947);
          margin-bottom: 8px;
        }

        .user-email {
          font-weight: 600;
          color: var(--color-on-surface, #161d1b);
        }

        .time {
          font-size: 12px;
        }

        .review-rating {
          font-size: 14px;
          margin-bottom: 8px;
          color: #f59e0b; /* Amber-500 star color */
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .review-text {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 8px;
          color: var(--color-on-surface, #161d1b);
          font-style: italic;
        }

        .review-place {
          font-size: 13px;
          color: var(--color-primary, #006b5f);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .view-all {
          display: inline-flex;
          align-items: center;
          margin-top: 20px;
          color: var(--color-primary, #006b5f);
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .view-all:hover {
          text-decoration: underline;
          color: var(--color-primary-container, #14b8a6);
        }

        .empty-state {
          text-align: center;
          color: var(--color-on-surface-variant, #3c4947);
          padding: 24px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
