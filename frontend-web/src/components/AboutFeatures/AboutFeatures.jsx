import React, { useEffect, useRef } from 'react';

export default function AboutFeatures() {
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
    <section className="about-features" ref={sectionRef}>
      <div className="container">
        <h2 className="about-section-title">
          <span>Trải nghiệm du lịch thông minh</span>
        </h2>

        <div className="about-features__timeline">
          
          {/* Feature 1 */}
          <div className="feature-block">
            <div className="feature-block__visual reveal reveal-left">
              <div className="feature-block__visual-bg"></div>
              <img 
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80" 
                alt="Top K Search" 
                className="feature-block__img"
              />
            </div>
            <div className="feature-block__content reveal reveal-right">
              <h3 className="feature-block__title">Tìm kiếm top K địa điểm phù hợp</h3>
              <p className="feature-block__desc">
                Thuật toán thông minh sẽ gợi ý top K địa điểm dựa trên các thông tin 
                bạn cung cấp như ngân sách, sở thích, khoảng cách... Từ đó giúp chuyến đi trở nên dễ dàng hơn.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="feature-block">
            <div className="feature-block__content reveal reveal-left">
              <h3 className="feature-block__title">Tìm kiếm nhanh địa điểm</h3>
              <p className="feature-block__desc">
                Chỉ với 1 cú nhấp chuột với tên thành phố, hệ thống sẽ trả về danh sách 
                các địa điểm đầy đủ từ vui chơi, giải trí,... và bạn có thể điều chỉnh bộ lọc 
                để chọn địa điểm phù hợp.
              </p>
            </div>
            <div className="feature-block__visual reveal reveal-right">
              <div className="feature-block__visual-bg"></div>
              <img 
                src="https://images.unsplash.com/photo-1548689816-c399f954f3dd?auto=format&fit=crop&w=400&q=80" 
                alt="Quick Search" 
                className="feature-block__img"
              />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-block">
            <div className="feature-block__visual reveal reveal-left">
              <div className="feature-block__visual-bg"></div>
              <img 
                src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=400&q=80" 
                alt="Easy Journey" 
                className="feature-block__img"
              />
            </div>
            <div className="feature-block__content reveal reveal-right">
              <h3 className="feature-block__title">Hành trình di chuyển dễ dàng</h3>
              <p className="feature-block__desc">
                Chỉ cần nhấp chuột vào bắt đầu đi, hướng dẫn map sẽ hiển thị với các 
                cảnh báo. Khi kết thúc sẽ có gợi ý lộ trình tiếp theo một cách tối ưu nhất.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
