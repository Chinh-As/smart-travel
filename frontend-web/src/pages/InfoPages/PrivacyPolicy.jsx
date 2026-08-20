import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function PrivacyPolicy() {
  const content = [
    {
      heading: '1. Thu thập thông tin',
      text: 'Chúng tôi chỉ thu thập các thông tin cần thiết để cá nhân hóa trải nghiệm của bạn, bao gồm: tên, email, lịch sử tìm kiếm và lịch trình đã tạo. Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn.'
    },
    {
      heading: '2. Sử dụng thông tin',
      text: 'Thông tin của bạn được sử dụng để: cung cấp gợi ý du lịch chính xác hơn, cải thiện thuật toán AI, và gửi các thông báo quan trọng về tài khoản của bạn.'
    },
    {
      heading: '3. Bảo mật dữ liệu',
      text: 'Smart Travel áp dụng các tiêu chuẩn bảo mật mã hóa SSL để bảo vệ dữ liệu cá nhân của bạn. Chúng tôi cam kết KHÔNG bán hoặc chia sẻ dữ liệu người dùng cho bên thứ ba vì mục đích quảng cáo mà không có sự đồng ý của bạn.'
    },
    {
      heading: '4. Quyền của người dùng',
      text: 'Bạn có quyền xem, chỉnh sửa hoặc yêu cầu xóa toàn bộ dữ liệu cá nhân của mình khỏi hệ thống Smart Travel bất cứ lúc nào thông qua phần Cài đặt tài khoản.'
    }
  ];

  return (
    <GenericPage 
      icon="🛡️"
      title="Chính sách Bảo mật" 
      subtitle="Cam kết của chúng tôi về việc bảo vệ thông tin cá nhân của bạn."
      content={content} 
    />
  );
}
