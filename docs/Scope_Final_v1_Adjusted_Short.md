# Scope Final v1 (Adjusted - Short Version)

## 1) Mục tiêu MVP
Xây dựng hệ thống Smart Travel có 2 luồng chính:
- **Search (dạo chơi):** tìm và lọc danh sách địa điểm đơn lẻ để tham khảo.
- **Tạo ngay (sẵn sàng đi):** AI mix-and-match địa điểm thành lịch trình từ sáng đến tối.

## 2) In-Scope (phạm vi triển khai v1)
1. Trang chủ có thanh Search nổi bật.
2. Search trả danh sách địa điểm theo dạng card.
3. Bộ lọc thông minh cho Search: ngân sách, bán kính, danh mục.
4. Luồng Tạo ngay nhận form và sinh lịch trình cơ bản theo khung giờ.
5. Hiển thị lý do gợi ý ngắn cho kết quả (explainable recommendation).
6. Kết nối frontend-web -> backend-core -> recommendation-service hoạt động end-to-end.

## 3) Out-of-Scope (không làm trong v1)
1. Booking/payment/reservation.
2. Voice chatbot hoàn chỉnh production.
3. Realtime traffic optimization nâng cao.
4. Mobile app native.
5. Hệ thống admin đầy đủ nghiệp vụ.

## 4) Input/Output chính
### Search Input
- keyword (ví dụ: "Đà Lạt")
- budget_max (ví dụ: dưới 500k)
- radius_km (ví dụ: 2 km)
- category (hotel/cafe/sightseeing)

### Search Output
- Danh sách địa điểm đã lọc (card): tên, loại, giá, khoảng cách, rating, tag nổi bật.

### Tạo ngay Input
- ngày đi, thời lượng trong ngày
- sở thích, ngân sách, bán kính
- điều kiện tiếp cận cơ bản (nếu có)

### Tạo ngay Output
- lịch trình theo mốc thời gian (sáng - trưa - chiều - tối)
- mỗi điểm có lý do được chọn

## 5) Kiến trúc triển khai
- `docs/`: tài liệu dự án
- `frontend-web/`: ReactJS UI
- `backend-core/`: Spring Boot API core, domain, security, DTO
- `recommendation-service/`: Python FastAPI + data preprocessing + scoring

## 6) Tiêu chí nghiệm thu MVP (Acceptance Criteria)
1. Người dùng gõ địa điểm và lọc được kết quả đúng điều kiện.
2. Kết quả Search hiển thị dạng card, dễ so sánh.
3. Nút Tạo ngay tạo được lịch trình cơ bản trong ngày.
4. Luồng gọi service chạy end-to-end không lỗi nghiêm trọng.
5. Demo 3-5 phút chạy ổn định trên môi trường nhóm.

## 7) Lưu ý quản lý scope
- Mọi yêu cầu mới ngoài phạm vi trên phải đi qua PM review trước khi thêm vào backlog.
- Ưu tiên hoàn thành chất lượng 2 luồng chính trước khi mở rộng tính năng.
