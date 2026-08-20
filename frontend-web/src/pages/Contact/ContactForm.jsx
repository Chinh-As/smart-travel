import React, { useState } from 'react';

export default function ContactForm() {
  const [autoFill, setAutoFill] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleAutoFill = (e) => {
    const isChecked = e.target.checked;
    setAutoFill(isChecked);

    if (isChecked) {
      setFormData({
        ...formData,
        name: 'Nguyễn Văn A',
        email: 'nva@gmail.com',
        phone: '0901234567'
      });
    } else {
      setFormData({
        ...formData,
        name: '',
        email: '',
        phone: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thông tin liên hệ đã được gửi!');
  };

  return (
    <div className="contact-card">
      <div className="contact-form__header">
        <h2 className="contact-card__title">LIÊN HỆ VỚI CHÚNG TÔI</h2>
        <label className="contact-form__toggle-wrap">
          <span>Tự động điền</span>
          <input
            type="checkbox"
            className="contact-form__toggle"
            checked={autoFill}
            onChange={handleAutoFill}
          />
        </label>
      </div>

      <form className="contact-form__fields" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Họ và tên"
          className="contact-form__input"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="contact-form__input"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Số điện thoại"
          className="contact-form__input"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <div className="contact-form__select-wrap">
          <select
            name="subject"
            className="contact-form__input contact-form__select"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="" disabled hidden>Chủ đề (Đánh giá, Báo lỗi, Hợp tác)</option>
            <option value="Đánh giá">Đánh giá</option>
            <option value="Báo lỗi">Báo lỗi</option>
            <option value="Hợp tác">Hợp tác</option>
            <option value="Khác">Khác</option>
          </select>
          <span className="contact-form__select-icon">▼</span>
        </div>

        <textarea
          name="message"
          placeholder="Nội dung..."
          className="contact-form__input contact-form__textarea"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit" className="contact-form__submit">
          Gửi liên hệ
          <span className="contact-form__submit-icon"></span>
        </button>
      </form>
    </div>
  );
}
