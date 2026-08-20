import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function Blog() {
  const content = [
    {
      heading: 'Cẩm nang du lịch Việt Nam',
      text: 'Những bài viết chia sẻ kinh nghiệm du lịch thực tế tại các địa điểm nổi bật như Đà Lạt, Nha Trang, Phú Quốc, Sapa... Từ cách chọn phòng, săn vé máy bay giá rẻ cho đến những quán ăn "núp hẻm" cực đỉnh.'
    },
    {
      heading: 'Khám phá văn hóa',
      text: 'Góc nhìn sâu sắc về văn hóa, lịch sử và con người Việt Nam thông qua những câu chuyện kể dọc đường đi. Những lễ hội truyền thống, làng nghề thủ công và những nét đẹp ẩn giấu.'
    },
    {
      heading: 'Thông báo',
      text: 'Trang Blog của chúng tôi đang trong quá trình xây dựng nội dung. Hãy quay lại sau để đón đọc những bài viết hấp dẫn nhé!'
    }
  ];

  return (
    <GenericPage 
      icon="📝"
      title="Blog Du Lịch" 
      subtitle="Nơi chia sẻ những câu chuyện, kinh nghiệm và cảm hứng khám phá mọi miền đất nước."
      content={content} 
      image="https://images.unsplash.com/photo-1499363145340-41a1b6ed3630?q=80&w=1000&auto=format&fit=crop"
    />
  );
}
