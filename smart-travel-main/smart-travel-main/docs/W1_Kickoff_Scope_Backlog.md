# Kickoff Tuần 1: Scope v1, Out-of-Scope và Backlog Baseline

## 1. Phân tích task

**Task:** `[W1][Management][Phuoc] Kickoff, scope v1, backlog baseline`

**Task này phải đạt được gì:**
- Đồng bộ cả nhóm về hướng đi của dự án trong Tuần 1.
- Chốt Scope v1 ở mức thực tế để cả nhóm bắt đầu làm việc mà không mơ hồ.
- Xác định rõ những phần ngoài phạm vi để tránh phình scope.
- Thiết lập backlog baseline cho Tuần 1 với owner, backup và output rõ ràng.
- Tạo nhịp làm việc chung cho cập nhật Trello, review và escalation.

**Vì sao task này quan trọng:**
- Đây là điểm kiểm soát của toàn bộ dự án.
- Tất cả công việc thiết kế, dữ liệu, backend, frontend và tài liệu đều phụ thuộc vào baseline này.
- Nếu không chốt bước này, nhóm dễ làm quá phạm vi hoặc bị lệch giả định giữa các thành viên.

---

## 2. Scope v1

### 2.1 Mục tiêu dự án
Xây dựng prototype **Smart Travel Assistant** có khả năng gợi ý cá nhân hóa cho món ăn địa phương và điểm tham quan dựa trên ràng buộc của người dùng.

### 2.2 Định nghĩa Scope v1
Nhóm sẽ tập trung vào **một luồng gợi ý duy nhất** với các đầu vào sau:
- Sở thích danh mục
- Mức ngân sách
- Ràng buộc khoảng cách
- Một số sở thích cơ bản của người dùng

Prototype sẽ trả về:
- Danh sách địa điểm được xếp hạng
- Giải thích ngắn cho từng gợi ý
- Metadata cơ bản như tên, danh mục, mức giá, khoảng cách và đánh giá

### 2.3 Các tính năng cốt lõi nằm trong Scope v1
- Form nhập tiêu chí gợi ý của người dùng
- Lọc đơn giản theo danh mục, ngân sách và khoảng cách
- Logic xếp hạng bằng một phương pháp điểm số có thể giải thích
- Trang kết quả với Top-K gợi ý
- Xử lý cơ bản khi không có kết quả phù hợp
- Thiết lập quy trình làm việc nhóm cho quản lý mã nguồn, review và theo dõi tiến độ

---

## 3. Out-of-Scope v1

Các mục sau **không nằm trong Scope v1**:
- Ứng dụng mobile hoàn chỉnh cấp sản phẩm
- Xác thực người dùng và tài khoản cá nhân
- Công cụ dẫn đường thời gian thực
- Tối ưu giao thông trực tiếp
- Tích hợp voice assistant và chatbot
- Huấn luyện mô hình AI nâng cao
- Triển khai microservices hoàn chỉnh ngay từ đầu
- Tối ưu database phức tạp hoặc truy vấn không gian vượt nhu cầu prototype
- Hỗ trợ đa ngôn ngữ
- Chức năng thanh toán, đặt chỗ hoặc booking
- Chia sẻ lên mạng xã hội

**Lý do loại ra khỏi phạm vi:**
Dự án phải khả thi trong thời gian học kỳ. Scope v1 cần chứng minh được ý tưởng, không phải xây dựng quá sớm một hệ thống production hoàn chỉnh.

---

## 4. Giả định và ràng buộc

### Giả định
- Nhóm sẽ bắt đầu với dữ liệu mẫu hoặc dữ liệu bán thực tế.
- Logic gợi ý sẽ đủ rõ ràng và đơn giản để có thể trình bày minh bạch.
- Prototype sẽ đủ để đáp ứng rubric môn học cho các phần phân tích, thiết kế, triển khai, kiểm thử và thuyết trình.

### Ràng buộc
- Thời gian có hạn, nên nhóm phải ưu tiên độ rõ ràng và mức độ hoàn thành thay vì mở rộng tính năng.
- Mỗi task phải có 1 owner chính và 1 backup.
- Tất cả cập nhật phải theo quy tắc Trello và được báo trước 23:00 mỗi ngày.
- Mọi thay đổi scope lớn phải được cả nhóm đồng ý trước khi triển khai.

---

## 5. Backlog baseline cho Tuần 1

| ID | Task | Owner | Backup | Ưu tiên | Output |
|---|---|---|---|---|---|
| W1-01 | Kickoff, scope v1, backlog baseline | Phuoc | Bao | P0 | Scope summary, out-of-scope, backlog baseline |
| W1-02 | Tạo nhật ký nhóm, biên bản họp, khung báo cáo | Bao | Phuoc | P1 | Template nhật ký, template biên bản, skeleton báo cáo |
| W1-03 | Chuẩn hóa quy trình repo và checklist PR | Chinh | Nguyen | P0 | README cập nhật, quy tắc branch, checklist PR |
| W1-04 | Phác user flow v1 và danh sách màn hình | Duy | Hoang | P1 | User flow và danh sách màn hình |
| W1-05 | Đề xuất stack frontend và cấu trúc thư mục | Hoang | Minh | P1 | Đề xuất stack frontend, draft thư mục |
| W1-06 | Xác định component UI và trạng thái kết quả | Minh | Duy | P1 | Danh sách component, trạng thái loading/empty/error |
| W1-07 | Xác định input-output recommendation và data fields | Nguyen | Chinh | P0 | Đặc tả input-output và data schema |
| W1-08 | Khảo sát nguồn dữ liệu và đề xuất dataset mẫu | Thinh | Nguyen | P0 | Bảng nguồn dữ liệu và bản nháp dataset mẫu |
| W1-09 | Họp kickoff và xác nhận phân công | Phuoc | Bao | P0 | Biên bản kickoff và xác nhận phân công |
| W1-10 | Tổng kết tuần và bàn giao kế hoạch Tuần 2 | Phuoc | Bao | P1 | Tóm tắt Tuần 1 và kế hoạch bàn giao Tuần 2 |

---

## 6. Các quyết định cần chốt trong buổi kickoff

### Các quyết định bắt buộc phải xác nhận
- Tên đề tài cuối cùng
- Hướng prototype cuối cùng
- Nhóm người dùng mục tiêu
- Phân công task Tuần 1
- Deadline nội bộ
- Quy trình review và escalation
- Quy tắc cập nhật Trello

### Quy tắc nghiệm thu task Tuần 1
Một task chỉ được chuyển sang **Done** khi:
- Output hoàn chỉnh và đã được đính kèm.
- Owner đã cập nhật tiến độ.
- Ít nhất 1 người review đã kiểm tra.
- Task đáp ứng Definition of Done đã thống nhất.

---

## 7. Quy tắc thực hiện Tuần 1

- Mỗi task chỉ có 1 owner chính.
- Backup phải có khả năng nhận việc nếu owner bị block.
- Cập nhật trạng thái Trello trước 23:00 mỗi ngày.
- Nếu bị block quá 8 giờ, báo ngay cho backup.
- Nếu bị block quá 12 giờ, escalate cho trưởng nhóm.
- Không triển khai khi scope chưa được chốt.

---

## 8. Đầu ra cuối cùng của task này

Khi hoàn thành task này, nhóm cần có:
- Scope v1 đã được xác nhận
- Danh sách Out-of-Scope đã được chốt
- Backlog baseline cho Tuần 1
- Cấu trúc phân công task rõ ràng
- Biên bản họp kickoff

**Owner của task này:** Phuoc

**Mục tiêu trạng thái:** Sẵn sàng triển khai Tuần 1
