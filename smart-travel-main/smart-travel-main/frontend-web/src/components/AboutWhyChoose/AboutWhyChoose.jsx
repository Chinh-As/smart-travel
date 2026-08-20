import React, { useEffect, useRef } from 'react';

export default function AboutWhyChoose() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.2 });

    const elements = sectionRef.current.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  return (
    <section className="about-why" ref={sectionRef}>
      <div className="container">
        <h2 className="about-section-title">
          <span>Vì sao chọn Smart Travel?</span>
        </h2>

        <div className="why-grid">
          <div className="why-card reveal reveal-up" style={{transitionDelay: '0ms'}}>
            <div className="why-card__icon-wrap">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3L4 15h6v10l8-12h-6L14 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="why-card__title">Đậm chất riêng</h3>
            <p className="why-card__desc">
              Không có chuyến đi nào giống nhau, mọi thứ được thiết kế dành riêng cho bạn.
            </p>
          </div>

          <div className="why-card reveal reveal-up" style={{transitionDelay: '200ms'}}>
            <div className="why-card__icon-wrap">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M14 8v6l4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="why-card__title">Nhanh chóng & Tiện lợi</h3>
            <p className="why-card__desc">
              Tiết kiệm thời gian với hệ thống gợi ý chuẩn xác chỉ trong vài giây.
            </p>
          </div>

          <div className="why-card reveal reveal-up" style={{transitionDelay: '400ms'}}>
            <div className="why-card__icon-wrap">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4L4 10v8c0 4.5 4.3 8.7 10 10 5.7-1.3 10-5.5 10-10v-8L14 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="why-card__title">An tâm tuyệt đối</h3>
            <p className="why-card__desc">
              Hệ thống cảnh báo an toàn hoạt động 24/7 để bảo vệ bạn trong suốt chuyến đi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
