import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function HelpCenter() {
  const content = [
    {
      heading: 'Làm thế nào để tạo lịch trình bằng AI?',
      text: 'Bạn chỉ cần truy cập vào mục "Tạo lịch trình ngay" trên thanh công cụ, nhập địa điểm bạn muốn đến, ngày khởi hành và ngân sách. AI của chúng tôi sẽ tự động thiết kế cho bạn một chuyến đi hoàn hảo.'
    },
    {
      heading: 'Tôi có thể thay đổi lịch trình đã lưu không?',
      text: 'Chắc chắn rồi! Trong phần "Lịch trình của tôi", bạn có thể tự do thêm, bớt hoặc chỉnh sửa thời gian các hoạt động. Lịch trình hoàn toàn linh hoạt theo ý muốn của bạn.'
    },
    {
      heading: 'Phản hồi về lỗi',
      text: 'Nếu bạn gặp lỗi trong quá trình sử dụng (ví dụ: không thể lưu lịch trình, ảnh không tải được), xin vui lòng dùng chức năng "Liên hệ" hoặc nhắn tin với ChatBot (Mr. Roboto) để gửi báo cáo. Chúng tôi sẽ xử lý sớm nhất.'
    }
  ];

  return (
    <GenericPage 
      icon="🆘"
      title="Trung tâm hỗ trợ" 
      subtitle="Giải đáp mọi thắc mắc của bạn về việc sử dụng nền tảng Smart Travel."
      content={content} 
      image="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000&auto=format&fit=crop"
    />
  );
}
