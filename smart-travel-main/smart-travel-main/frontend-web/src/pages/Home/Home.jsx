import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";
import SearchCard from "../../components/SearchCard/SearchCard.jsx";
import Pagination from "../../components/Pagination/Pagination.jsx";
import { destinations as mockDestinations } from "../../data/mockData.js";
import { fetchFeaturedDestinations } from "../../services/recommendationApi.js";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const featuredSectionRef = useRef(null);
  
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /* V4: fetch from backend API with fallback to mock data */
  useEffect(() => {
    async function loadFeatured() {
      setLoading(true);
      try {
        // Fetch up to 50 items to support pagination across multiple pages
        const places = await fetchFeaturedDestinations(50);
        if (places && places.length > 0) {
          const transformed = await import("../../services/dataTransformers.js").then(m => m.transformPlacesToDestinations(places));
          setFeatured(transformed);
        } else {
          throw new Error('No data from API');
        }
      } catch (error) {
        console.error("Failed to fetch featured destinations:", error);
        // Fallback to mock data duplicated/extended to simulate a full list
        setFeatured(mockDestinations);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  // Pagination calculations
  const totalItems = featured.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentFeatured = featured.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (featuredSectionRef.current) {
      const yOffset = -80; // Offset for fixed/sticky header
      const element = featuredSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      {/* Hero — Full screen width, nội dung ở giữa */}
      <section className="hero-wrap">
        <div className="hero">
          <div className="hero__bg">
            <img
              src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1400&h=600&fit=crop&q=80"
              alt="Smart Travel Hero Background"
              className="hero__bg-img"
            />
            <div className="hero__overlay" />
          </div>
          <div className="hero__content">
            <h1 className="hero__headline">
              Lên Kế Hoạch Du Lịch Thông Minh
            </h1>
            <p className="hero__subtitle">
              Khám phá hàng trăm địa điểm, lập lịch trình AI và quản lý chuyến đi dễ dàng
            </p>
            <div className="hero__search">
              <SearchBar
                size="lg"
                placeholder="Bạn muốn đi đâu?"
                onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
                hideSubmit={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="popular">
        <div className="container">
          <h2 className="popular__title">Tìm kiếm phổ biến</h2>
          <div className="popular__chips">
            {[
              { label: 'Địa điểm vui chơi Hà Nội', q: 'Hà Nội' },
              { label: 'Quán cafe đẹp', q: 'cafe' },
              { label: 'Khách sạn trung tâm', q: 'hotel' },
              { label: 'Ẩm thực Hồ Chí Minh', q: 'Hồ Chí Minh' }
            ].map((item, i) => (
              <button
                key={i}
                className="pop-chip"
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.q)}`)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section with Senior-Level Pagination */}
      <section className="featured" ref={featuredSectionRef}>
        <div className="container">
          <div className="featured__hd">
            <div className="featured__title-wrap">
              <h2 className="featured__title">Địa điểm nổi bật</h2>
              {!loading && totalItems > 0 && (
                <span className="featured__count-badge">
                  Trang {currentPage} / {totalPages} ({totalItems} địa điểm)
                </span>
              )}
            </div>
            <button
              className="featured__more"
              onClick={() => navigate("/search?all=true")}
            >
              Xem tất cả
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className="featured__grid">
              {Array.from({ length: pageSize }).map((_, idx) => (
                <div key={idx} className="scard-skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentFeatured.length > 0 ? (
            <div className="featured__grid">
              {currentFeatured.map((d, i) => (
                <div
                  key={d.id || i}
                  className="fade-in-up"
                  style={{ animationDelay: `${(i % pageSize) * 60}ms` }}
                >
                  <SearchCard destination={d} />
                </div>
              ))}
            </div>
          ) : (
            <div className="featured__empty">
              <p>Không tìm thấy địa điểm nổi bật nào.</p>
            </div>
          )}

          {/* Professional Pagination Bar */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              showSummary={true}
            />
          )}
        </div>
      </section>

      {/* About — giới thiệu về Smart Travel + 3 tính năng */}
      <section className="home-about">
        <div className="container">
          {/* Intro 2 cột */}
          <div className="home-about__intro">
            <div className="home-about__intro-text">
              <span className="home-about__badge">✦ Smart Travel</span>
              <h2 className="home-about__heading">
                Trợ lý du lịch <span className="home-about__accent">thông minh</span><br/>
                dành riêng cho bạn
              </h2>
              <p className="home-about__desc">
                Smart Travel giúp bạn lên kế hoạch cá nhân hóa, tìm kiếm địa điểm phù hợp
                và di chuyển an toàn — tất cả trong một nền tảng duy nhất.
                Được phát triển bởi nhóm sinh viên Đại học Khoa học Tự nhiên — ĐHQG TP.HCM.
              </p>
              <button className="btn btn-primary home-about__cta" onClick={() => navigate("/about")}>
                Tìm hiểu thêm →
              </button>
            </div>
            <div className="home-about__intro-visual">
              <div className="home-about__blob"></div>
              <div className="home-about__dual-img">
                <img
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80"
                  alt="Vietnam Travel 1"
                  className="home-about__img home-about__img--left"
                />
                <img
                  src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80"
                  alt="Vietnam Travel 2"
                  className="home-about__img home-about__img--right"
                />
              </div>
            </div>
          </div>

          {/* 3 tính năng */}
          <div className="home-about__features">
            <div className="home-feat-card">
              <div className="home-feat-card__icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8"/>
                  <path d="M20 20l5 5"/>
                  <path d="M9 12h6M12 9v6"/>
                </svg>
              </div>
              <h3 className="home-feat-card__title">Tìm kiếm Top K</h3>
              <p className="home-feat-card__desc">
                Thuật toán gợi ý địa điểm dựa trên ngân sách, sở thích và khoảng cách của bạn.
              </p>
            </div>
            <div className="home-feat-card">
              <div className="home-feat-card__icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 3l2 5 5 .8-3.5 3.5.7 5L14 15l-4.2 2.3.7-5L7 8.8l5-.8L14 3z"/>
                  <path d="M5 22h18M8 26h12"/>
                </svg>
              </div>
              <h3 className="home-feat-card__title">Lập lịch trình AI</h3>
              <p className="home-feat-card__desc">
                AI tự động tạo hành trình tối ưu theo số ngày, phong cách và mong muốn riêng.
              </p>
            </div>
            <div className="home-feat-card">
              <div className="home-feat-card__icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6l8-3 6 3 8-3v19l-8 3-6-3-8 3V6z"/>
                  <path d="M11 3v19M17 6v19"/>
                </svg>
              </div>
              <h3 className="home-feat-card__title">Hành trình dễ dàng</h3>
              <p className="home-feat-card__desc">
                Bản đồ tích hợp, cảnh báo an toàn và gợi ý lộ trình tối ưu trong suốt chuyến đi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo */}
      <section className="promo">
        <div className="container">
          <div className="promo__inner">
            <div className="promo__text">
              <h3>Bạn đã sẵn sàng cho chuyến du lịch tiếp theo?</h3>
              <p>Để Smart Travel giúp bạn lên kế hoạch hoàn hảo</p>
            </div>
            <div className="promo__actions">
              <button
                className="btn btn-purple"
                onClick={() => navigate("/ai-search")}
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
