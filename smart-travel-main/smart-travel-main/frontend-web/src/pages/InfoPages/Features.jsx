import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function Features() {
  const content = [
    {
      heading: 'Lập lịch trình AI thông minh',
      text: 'Với Smart Travel, bạn không còn phải tốn hàng giờ đồng hồ tìm kiếm và sắp xếp các địa điểm. Trí tuệ nhân tạo của chúng tôi sẽ tự động tạo ra một lịch trình tối ưu dựa trên sở thích, thời gian và ngân sách của bạn.'
    },
    {
      heading: 'Nhận diện địa danh qua hình ảnh',
      text: 'Chỉ cần tải lên một bức ảnh, Smart Travel sẽ ngay lập tức nhận diện địa danh và cung cấp đầy đủ thông tin chi tiết, lịch sử, giờ mở cửa và giá vé cho bạn.'
    },
    {
      heading: 'Gợi ý cá nhân hóa',
      text: 'Hệ thống học hỏi từ các địa điểm bạn yêu thích để đưa ra những gợi ý phù hợp nhất. Từ quán cafe yên tĩnh đến những nhà hàng sang trọng, tất cả đều được cá nhân hóa.'
    }
  ];

  return (
    <GenericPage 
      icon="✨"
      title="Tính năng nổi bật" 
      subtitle="Khám phá những công cụ mạnh mẽ giúp chuyến đi của bạn trở nên hoàn hảo và dễ dàng hơn bao giờ hết."
      content={content} 
      image="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1000&auto=format&fit=crop"
    />
  );
}
