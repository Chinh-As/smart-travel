import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenericPage.css';

export default function GenericPage({ title, subtitle, content, icon, image }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="generic-page">
      {/* Premium Hero Section */}
      <section className="generic-page__hero">
        <div className="generic-page__hero-bg">
          <div className="generic-page__gradient-blob"></div>
        </div>
        <div className="container generic-page__hero-content fade-in-up">
          {icon && <div className="generic-page__icon-wrap"><span className="generic-page__icon">{icon}</span></div>}
          <h1 className="generic-page__title">{title}</h1>
          {subtitle && <p className="generic-page__subtitle">{subtitle}</p>}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="generic-page__body container fade-in" style={{ animationDelay: '0.2s' }}>
        {image && (
          <div className="generic-page__image-wrap">
            <img src={image} alt={title} className="generic-page__img" />
          </div>
        )}

        <div className="generic-page__content glassmorphism">
          {content && content.map((section, idx) => (
            <div key={idx} className="generic-page__section">
              {section.heading && <h2 className="generic-page__heading">{section.heading}</h2>}
              {section.text && <p className="generic-page__text">{section.text}</p>}
              {section.list && (
                <ul className="generic-page__list">
                  {section.list.map((item, i) => (
                    <li key={i} className="generic-page__list-item">
                      <span className="generic-page__bullet"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="generic-page__cta glassmorphism">
          <div className="generic-page__cta-inner">
            <h2 className="generic-page__cta-title">Bạn cần hỗ trợ thêm?</h2>
            <p className="generic-page__cta-desc">Đừng ngần ngại liên hệ với chúng tôi để được giải đáp mọi thắc mắc nhanh chóng nhất.</p>
            <button className="btn btn-purple generic-page__cta-btn" onClick={() => navigate('/contact')}>Liên hệ ngay</button>
          </div>
        </div>
      </section>
    </div>
  );
}
