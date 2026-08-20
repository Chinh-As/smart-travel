import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function Partnership() {
  const content = [
    {
      heading: 'Đối tác nhà cung cấp dịch vụ',
      text: 'Bạn là chủ khách sạn, nhà hàng, hoặc đơn vị cung cấp tour du lịch? Hợp tác cùng Smart Travel để quảng bá hình ảnh của bạn đến hàng ngàn du khách đang lên kế hoạch mỗi ngày trên nền tảng của chúng tôi.'
    },
    {
      heading: 'Quyền lợi khi hợp tác',
      list: [
        'Tiếp cận tệp khách hàng lớn và có nhu cầu du lịch thực tế.',
        'Được ưu tiên gợi ý trong lịch trình AI của người dùng.',
        'Hệ thống quản lý đặt chỗ và đánh giá minh bạch.',
        'Hỗ trợ truyền thông đa kênh miễn phí từ Smart Travel.'
      ]
    },
    {
      heading: 'Liên hệ hợp tác',
      text: 'Vui lòng gửi email hồ sơ năng lực của đơn vị bạn về địa chỉ partnership@smarttravel.vn. Đội ngũ phát triển kinh doanh của chúng tôi sẽ liên hệ lại trong vòng 24 giờ làm việc.'
    }
  ];

  return (
    <GenericPage 
      icon="🤝"
      title="Hợp tác cùng phát triển" 
      subtitle="Đồng hành cùng Smart Travel mang đến trải nghiệm du lịch tốt nhất cho người dùng và mở rộng cơ hội kinh doanh cho bạn."
      content={content} 
      image="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop"
    />
  );
}
