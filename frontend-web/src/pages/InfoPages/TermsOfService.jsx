import React from 'react';
import GenericPage from '../../components/GenericPage/GenericPage';

export default function TermsOfService() {
  const content = [
    {
      heading: '1. Chấp nhận điều khoản',
      text: 'Bằng việc truy cập và sử dụng dịch vụ của Smart Travel, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng nền tảng.'
    },
    {
      heading: '2. Dịch vụ cung cấp',
      text: 'Smart Travel cung cấp nền tảng gợi ý lịch trình du lịch dựa trên AI, thông tin địa điểm và công cụ kết nối với các đối tác dịch vụ. Chúng tôi không trực tiếp cung cấp dịch vụ vận tải, lưu trú hay ăn uống.'
    },
    {
      heading: '3. Quyền và trách nhiệm của người dùng',
      text: 'Bạn cam kết cung cấp thông tin chính xác khi đăng ký tài khoản. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình. Không sử dụng nền tảng cho các mục đích vi phạm pháp luật.'
    },
    {
      heading: '4. Bản quyền và Sở hữu trí tuệ',
      text: 'Mọi nội dung, thiết kế, logo và thuật toán trên nền tảng Smart Travel đều thuộc quyền sở hữu của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.'
    }
  ];

  return (
    <GenericPage 
      icon="📜"
      title="Điều khoản Dịch vụ" 
      subtitle="Quy định và điều khoản sử dụng nền tảng Smart Travel."
      content={content} 
    />
  );
}
