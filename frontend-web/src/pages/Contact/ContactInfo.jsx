import React from 'react';

export default function ContactInfo() {
  return (
    <div className="contact-card">
      <h2 className="contact-card__title">THÔNG TIN LIÊN LẠC</h2>

      <div className="contact-info__list">
        <div className="contact-info__item">
          <div className="contact-info__icon">✉️</div>
          <div className="contact-info__text-wrap">
            <span className="contact-info__label">Email</span>
            <span className="contact-info__value">khtn@gmail.com</span>
          </div>
        </div>

        <div className="contact-info__item">
          <div className="contact-info__icon">📞</div>
          <div className="contact-info__text-wrap">
            <span className="contact-info__label">Số điện thoại</span>
            <span className="contact-info__value">0909 110 895</span>
          </div>
        </div>

        <div className="contact-info__item">
          <div className="contact-info__icon">📍</div>
          <div className="contact-info__text-wrap">
            <span className="contact-info__label">Trường Đại học Khoa học Tự Nhiên - ĐHQG TP.HCM</span>
            <span className="contact-info__value">Khu đô thị ĐHQG-HCM (Thủ Đức)</span>
          </div>
        </div>
      </div>

      <div className="contact-info__map">
        <iframe
          title="Google Maps KHTN"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.2323596280456!2d106.79973271146747!3d10.87001395742234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJBIUUcgSENN!5e0!3m2!1svi!2s!4v1715945115160!5m2!1svi!2s"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
