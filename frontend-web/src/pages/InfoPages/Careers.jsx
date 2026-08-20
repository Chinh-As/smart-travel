import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function Careers() {
  const content = [
    {
      heading: 'Môi trường làm việc',
      text: 'Tại Smart Travel, chúng tôi xây dựng một văn hóa cởi mở, sáng tạo và luôn hướng tới sự đổi mới. Bạn sẽ được làm việc cùng những người đam mê du lịch và công nghệ, luôn sẵn sàng hỗ trợ lẫn nhau.'
    },
    {
      heading: 'Phúc lợi hấp dẫn',
      list: [
        'Lương thưởng cạnh tranh và đánh giá tăng lương định kỳ.',
        'Trợ cấp du lịch hàng năm để bạn tự mình trải nghiệm sản phẩm.',
        'Làm việc linh hoạt (hybrid) và trang bị thiết bị hiện đại.',
        'Bảo hiểm sức khỏe toàn diện cho nhân viên và người thân.'
      ]
    },
    {
      heading: 'Vị trí đang tuyển dụng',
      text: 'Hiện tại chúng tôi đang tìm kiếm các tài năng cho vị trí: Frontend Developer, Backend Developer, AI Engineer và Content Creator. Gửi CV của bạn về email hr@smarttravel.vn để ứng tuyển.'
    }
  ];

  return (
    <GenericPage 
      icon="💼"
      title="Cơ hội nghề nghiệp" 
      subtitle="Gia nhập đội ngũ Smart Travel và cùng chúng tôi định hình tương lai của ngành du lịch Việt Nam."
      content={content} 
      image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"
    />
  );
}
