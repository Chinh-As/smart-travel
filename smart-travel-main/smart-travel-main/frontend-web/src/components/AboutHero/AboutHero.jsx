import React from 'react';

export default function AboutHero() {
  return (
    <section className="about-hero fade-in-up">
      <div className="container about-hero__inner">
        <div className="about-hero__content">
          <h1 className="about-hero__title">
            Smart Travel,<br/> 
            <span className="text-gradient">Smart Choice</span>
          </h1>
          <p className="about-hero__desc">
            Smart Travel là trợ lý du lịch thông minh, giúp bạn lên kế hoạch cá nhân hóa 
            và đảm bảo an toàn cho mọi chuyến đi. Một sản phẩm tâm huyết được phát triển 
            bởi nhóm sinh viên trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM.
          </p>
          <button className="btn btn-purple about-hero__btn">
            Khám phá ngay <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{display:'inline',verticalAlign:'-1px',marginLeft:'4px'}}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        
        <div className="about-hero__visuals">
          <div className="about-hero__blob"></div>
          <img 
            src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80" 
            alt="Vietnam Travel 1" 
            className="about-hero__img about-hero__img--1"
          />
          <img 
            src="https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=600&q=80" 
            alt="Vietnam Travel 2" 
            className="about-hero__img about-hero__img--2"
          />
        </div>
      </div>
    </section>
  );
}
