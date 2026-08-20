# Kế hoạch triển khai chi tiết Tuần 3

## 0. Bối cảnh chuyển tiếp từ Tuần 2
Tuần 2 đã có các nền tảng chính:
- Scope final v1 đã chốt.
- Đã có dữ liệu và đặc tả I/O recommendation.
- Đã có recommendation-service (Python) chạy cơ bản.
- Đã scaffold backend-core theo domain.

Tuần 3 tập trung vào chuẩn hóa kiến trúc triển khai thực tế và tạo skeleton tích hợp cho Sprint code mạnh.

---

## 1. Mục tiêu Tuần 3

1. Chuẩn hóa luồng tích hợp `frontend-web -> backend-core -> recommendation-service`.
2. Hoàn tất API contract v1 cho Search và Tạo ngay.
3. Tạo backend endpoints skeleton theo domain recommendation/place.
4. Tạo frontend skeleton thực tế (không chỉ README) cho Home + Search Results.
5. Chuẩn hóa dữ liệu mẫu theo schema chính thức.
6. Thiết lập test smoke cho các luồng quan trọng.
7. Chốt kế hoạch Sprint code Tuần 4.

---

## 2. Definition of Done Tuần 3

Một task Tuần 3 chỉ được xem là Done khi:
1. Có output cụ thể (code/tài liệu/PR/screenshot) đính kèm.
2. Có ít nhất 1 người review xác nhận.
3. Output khớp Scope final v1.
4. Không còn blocker mở trên card.

---

## 3. Nhịp vận hành Tuần 3

- Thứ Hai 21:00: Kickoff W3, chốt task và phụ thuộc
- Mỗi ngày trước 23:00: cập nhật trạng thái Trello
- Thứ Tư 21:00: checkpoint tích hợp service
- Thứ Sáu 21:00: review kỹ thuật API contract + skeleton
- Chủ Nhật 21:00: tổng kết W3, bàn giao W4

Quy tắc escalation:
- Block > 8 giờ: tag backup
- Block > 12 giờ: PM quyết định reassign hoặc cắt phạm vi

---

## 4. Phân công theo thành viên

| Thành viên | Task chính Tuần 3 | Output bắt buộc | Deadline nội bộ | Backup |
|---|---|---|---|---|
| Phuoc | Điều phối tích hợp và khóa API contract v1 | API contract final + bản đồ phụ thuộc W4 | Thứ Năm 22:00 | Bao |
| Bao | Hoàn thiện tài liệu kiến trúc và tiêu chí test smoke | Tài liệu integration flow + test checklist | Chủ Nhật 20:00 | Phuoc |
| Chinh | Thiết lập docker-compose skeleton cho 3 service | `docker-compose.yml` + hướng dẫn chạy local | Thứ Sáu 22:00 | Nguyen |
| Duy | Chốt UX flow cho Search và Tạo ngay | User flow v3 + screen-state flow | Thứ Bảy 18:00 | Hoang |
| Hoang | Dựng frontend app khung thực tế | React app skeleton + routes Home/Search | Chủ Nhật 22:00 | Minh |
| Minh | Dựng Search Results card + filter panel skeleton | Search result cards + filter UI skeleton | Chủ Nhật 22:00 | Duy |
| Nguyen | Tạo backend controller/service skeleton cho place/recommendation | Endpoint skeleton + DTO request/response | Thứ Bảy 18:00 | Chinh |
| Thinh | Chuẩn hóa data adapter cho recommendation-service | Data adapter + sample dataset v2 | Thứ Bảy 20:00 | Nguyen |

---

## 5. Trello cards Tuần 3 (copy-paste)

## Card 1
Title: [W3][Management][Phuoc] Chốt API contract v1 cho Search và Tạo ngay
Owner: Phuoc
Backup: Bao
Label: Management, Backend, Frontend, P0 Critical
Deadline nội bộ: Thứ Năm Tuần 3, 22:00
Phụ thuộc: Scope final v1, io-recommendation schema
Mục tiêu:
- Đồng bộ contract để frontend-backend-python tích hợp thống nhất.
Output bắt buộc:
- API contract final (Search, Tạo ngay)
- Bảng mapping endpoint-owner
Checklist:
- [ ] Chốt request/response schema cho Search
- [ ] Chốt request/response schema cho Tạo ngay
- [ ] Xác nhận với Hoang, Nguyen, Thinh
- [ ] Công bố contract cho team
Definition of Done:
- Contract final được team kỹ thuật xác nhận
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 2
Title: [W3][Docs][Bao] Hoàn thiện tài liệu integration flow và smoke test checklist
Owner: Bao
Backup: Phuoc
Label: Docs, Testing, P1 High
Deadline nội bộ: Chủ Nhật Tuần 3, 20:00
Phụ thuộc: Card 1, Card 3, Card 7
Mục tiêu:
- Có tài liệu để team test nhanh luồng tích hợp.
Output bắt buộc:
- Integration flow doc
- Smoke test checklist
Checklist:
- [ ] Vẽ luồng frontend-backend-python
- [ ] Liệt kê test case smoke
- [ ] Nhờ Chinh/Nguyen review
Definition of Done:
- Tài liệu sử dụng được cho test W4
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 3
Title: [W3][DevOps][Chinh] Tạo docker-compose skeleton cho 3 service
Owner: Chinh
Backup: Nguyen
Label: DevOps, Chore, P0 Critical
Deadline nội bộ: Thứ Sáu Tuần 3, 22:00
Phụ thuộc: Cấu trúc repo mới
Mục tiêu:
- Có khung chạy local cho frontend-web, backend-core, recommendation-service.
Output bắt buộc:
- docker-compose.yml skeleton
- Hướng dẫn run local
Checklist:
- [ ] Khai báo 3 service trong compose
- [ ] Thêm env placeholders
- [ ] Viết hướng dẫn start/stop
Definition of Done:
- Compose có thể run ở mức skeleton không lỗi config
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 4
Title: [W3][UIUX][Duy] Chốt user flow v3 cho Search và Tạo ngay
Owner: Duy
Backup: Hoang
Label: UIUX, Frontend, P1 High
Deadline nội bộ: Thứ Bảy Tuần 3, 18:00
Phụ thuộc: Scope final v1
Mục tiêu:
- Có user flow để frontend bố trí đúng page states.
Output bắt buộc:
- User flow v3
- State flow (empty/loading/error/result)
Checklist:
- [ ] Cập nhật luồng Search
- [ ] Cập nhật luồng Tạo ngay
- [ ] Review với Hoang, Minh
Definition of Done:
- Frontend team xác nhận implement được
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 5
Title: [W3][Frontend][Hoang] Dựng frontend-web app skeleton và routes
Owner: Hoang
Backup: Minh
Label: Frontend, P0 Critical
Deadline nội bộ: Chủ Nhật Tuần 3, 22:00
Phụ thuộc: Card 4
Mục tiêu:
- Tạo app frontend-web chạy được với route cơ bản.
Output bắt buộc:
- App React skeleton
- Routes: Home, Search Results
Checklist:
- [ ] Init frontend-web project
- [ ] Tạo route Home/Search
- [ ] Tạo layout cơ bản
- [ ] Tạo PR
Definition of Done:
- App chạy local được
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 6
Title: [W3][Frontend][Minh] Tạo Search card và bộ lọc giao diện skeleton
Owner: Minh
Backup: Duy
Label: Frontend, UIUX, P1 High
Deadline nội bộ: Chủ Nhật Tuần 3, 22:00
Phụ thuộc: Card 5
Mục tiêu:
- Hiển thị được kết quả Search theo card + bộ lọc.
Output bắt buộc:
- Card UI skeleton
- Filter panel skeleton
Checklist:
- [ ] Tạo card component
- [ ] Tạo bộ lọc giá, bán kính, category
- [ ] Tạo trạng thái empty/loading
Definition of Done:
- UI có thể demo với mock data
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 7
Title: [W3][Backend][Nguyen] Tạo place/recommendation endpoint skeleton + DTO
Owner: Nguyen
Backup: Chinh
Label: Backend, Algorithm, P0 Critical
Deadline nội bộ: Thứ Bảy Tuần 3, 18:00
Phụ thuộc: Card 1
Mục tiêu:
- Có API khung trong backend-core để tích hợp.
Output bắt buộc:
- Controller/service skeleton
- DTO request/response v1
Checklist:
- [ ] Tạo endpoint Search
- [ ] Tạo endpoint Tạo ngay
- [ ] Tạo DTO theo contract
- [ ] Tạo PR
Definition of Done:
- Endpoint khung build được
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 8
Title: [W3][Data][Thinh] Chuẩn hóa data adapter và dataset v2 cho recommendation-service
Owner: Thinh
Backup: Nguyen
Label: Data, Backend, P1 High
Deadline nội bộ: Thứ Bảy Tuần 3, 20:00
Phụ thuộc: Card 1, Card 7
Mục tiêu:
- Chuẩn bị dữ liệu và adapter để recommendation-service nhận input theo contract.
Output bắt buộc:
- Data adapter v1
- Sample dataset v2
Checklist:
- [ ] Chuẩn hóa field mapping
- [ ] Xử lý giá trị null/coercion
- [ ] Test adapter với sample payload
Definition of Done:
- Adapter nhận payload đúng contract
Báo cáo tiến độ:
- Update trước 23:00 mỗi ngày

## Card 9
Title: [W3][Meeting][Phuoc] Checkpoint giữa tuần và xử lý blocker
Owner: Phuoc
Backup: Bao
Label: Management, P0 Critical
Deadline nội bộ: Thứ Tư Tuần 3, 22:00
Phụ thuộc: W3 tasks in progress
Mục tiêu:
- Xử lý sớm blocker và cân đối workload.
Output bắt buộc:
- Biên bản checkpoint
- Bảng blocker + owner xử lý
Checklist:
- [ ] Tổng hợp tiến độ
- [ ] Xác định blocker
- [ ] Chốt hạn xử lý
Definition of Done:
- Blocker đã có owner và hạn
Báo cáo tiến độ:
- Update ngay sau họp

## Card 10
Title: [W3][Meeting][Phuoc] Tổng kết W3 và chốt baseline W4
Owner: Phuoc
Backup: Bao
Label: Management, P1 High
Deadline nội bộ: Chủ Nhật Tuần 3, 22:30
Phụ thuộc: All W3 cards
Mục tiêu:
- Tổng kết W3 và giao đầu vào sprint code W4.
Output bắt buộc:
- Biên bản tổng kết W3
- Danh sách carry-over
- Baseline task W4
Checklist:
- [ ] Tổng hợp kết quả từng card
- [ ] Chốt công việc chuyển tiếp
- [ ] Chốt owner/deadline W4
Definition of Done:
- Kế hoạch W4 đã rõ ràng
Báo cáo tiến độ:
- Update ngay sau họp

---

## 6. Tiêu chí kết thúc Tuần 3

Tuần 3 được xem là đạt khi:
1. API contract v1 đã chốt và đồng bộ 3 phía.
2. Frontend-web có skeleton thật (không còn chỉ README).
3. Backend-core có endpoint/DTO skeleton cho Search và Tạo ngay.
4. Recommendation-service có adapter nhận payload theo contract.
5. Có docker-compose skeleton và hướng dẫn chạy local cơ bản.
6. Có tài liệu integration + smoke checklist cho Tuần 4.
