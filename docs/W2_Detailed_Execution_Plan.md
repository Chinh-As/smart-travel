# Kế hoạch triển khai chi tiết Tuần 2

## 0. Bối cảnh
Baseline Tuần 1 đã hoàn thành:
- Scope v1, backlog baseline, họp kickoff và họp tổng kết
- Bộ template tài liệu nhóm
- Quy trình repo và checklist PR
- User flow v1, đề xuất cấu trúc frontend, bản nháp component UI
- Định nghĩa input-output recommendation và khảo sát nguồn dữ liệu ban đầu

Tuần 2 bắt đầu từ baseline này và tập trung chuyển đầu ra hoạch định thành gói kỹ thuật sẵn sàng triển khai.

---

## 1. Mục tiêu Tuần 2

1. Chốt Scope final v1 đủ rõ để triển khai.
2. Hoàn thiện phần Problem Analysis theo rubric.
3. Chốt data schema và quy tắc lọc ban đầu.
4. Hoàn thiện wireframe low-fidelity cho 3 màn hình cốt lõi.
5. Dựng frontend skeleton với routing cơ bản.
6. Chuẩn bị component input/kết quả có thể tái sử dụng.
7. Bàn giao bộ dữ liệu mẫu đã làm sạch để sẵn sàng code.
8. Đảm bảo mọi task đều truy vết được qua Trello và GitHub.

---

## 2. Definition of Done cho Tuần 2

Một task Tuần 2 chỉ được chuyển sang Done khi:
1. Có đính kèm đầy đủ output yêu cầu (file/link/screenshot/PR).
2. Owner đã cập nhật kết quả cuối cùng.
3. Có ít nhất 1 người review xác nhận chất lượng.
4. Output phù hợp với Scope final v1.
5. Không còn blocker chưa xử lý trong card.

---

## 3. Nhịp vận hành Tuần 2

- Thứ Hai 21:00: họp kickoff Tuần 2 và xác nhận task
- Mỗi ngày trước 23:00: owner cập nhật trạng thái Trello
- Thứ Tư 21:00: checkpoint giữa tuần (scope/data/wireframe)
- Thứ Sáu 21:00: đồng bộ kỹ thuật (frontend-backend-data)
- Chủ Nhật 21:00: tổng kết Tuần 2 và bàn giao Tuần 3

Quy tắc escalation:
- Block quá 8 giờ: tag backup ngay
- Block quá 12 giờ: escalte cho Phước để quyết định hướng xử lý/reassign

---

## 4. Phân công Tuần 2 theo thành viên

| Thành viên | Task chính | Đầu ra bắt buộc | Deadline nội bộ | Backup |
|---|---|---|---|---|
| Phuoc | Tổng hợp và chốt scope final | Scope final v1 + FR/NFR + out-of-scope final | Thứ Năm 22:00 | Bao |
| Bao | Viết Problem Analysis | Mục báo cáo hoàn chỉnh + bảng user scenario | Chủ Nhật 20:00 | Phuoc |
| Chinh | Chuẩn hóa repo và quy trình issue/PR | Cấu trúc repo ổn định + labels + issue/PR template | Thứ Sáu 22:00 | Thinh |
| Duy | Wireframe low-fidelity | Wireframe Home, Input, Recommendation Result | Chủ Nhật 18:00 | Hoang |
| Hoang | Dựng frontend skeleton | Frontend chạy được + base routes | Chủ Nhật 22:00 | Minh |
| Minh | Xây component input/kết quả | Component form input + result card | Chủ Nhật 22:00 | Duy |
| Nguyen | Chốt schema và rule lọc | Schema final + rule lọc/xếp hạng v1 | Thứ Bảy 18:00 | Chinh |
| Thinh | Làm sạch dữ liệu mẫu | Dataset CSV/JSON + mô tả nguồn/cột dữ liệu | Thứ Bảy 20:00 | Nguyen |

---

## 5. Trello cards (bản copy-paste sẵn)

## Card 1

Title: [W2][Management][Phuoc] Chot scope final v1 va baseline yeu cau

Owner: Phuoc
Backup: Bao
Label: Management, Analysis, P0 Critical
Deadline noi bo: Thu Tuan 2, 22:00
Phu thuoc: Toan bo output W1

Muc tieu:
- Chot scope final de dong bo code va tai lieu.

Output bat buoc:
- Scope final v1
- Danh sach yeu cau chuc nang (FR)
- Danh sach yeu cau phi chuc nang (NFR)
- Danh sach out-of-scope final

Checklist:
- [ ] Tong hop feedback W1 tu UI/frontend/backend/data
- [ ] Chot danh sach tinh nang MVP
- [ ] Chot out-of-scope final
- [ ] Chia se ban final cho nhom xac nhan

Definition of Done:
- Scope final ro rang de coding
- FR/NFR du ro va do duoc
- Nhom xac nhan scope final v1

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 2

Title: [W2][Docs][Bao] Hoan thien muc Problem Analysis va user scenario

Owner: Bao
Backup: Phuoc
Label: Docs, Analysis, P1 High
Deadline noi bo: Sun Tuan 2, 20:00
Phu thuoc: Scope final v1

Muc tieu:
- Hoan thien phan Problem Analysis theo rubric.

Output bat buoc:
- Muc Problem Analysis hoan chinh (san sang dua vao bao cao)
- Bang user scenario

Checklist:
- [ ] Viet boi canh bai toan va pain points
- [ ] Mo ta input/output va rang buoc
- [ ] Tao user scenario dai dien
- [ ] Nho Nguyen review do chinh xac ky thuat

Definition of Done:
- Noi dung ro rang, khong mo ho
- Dung scope final
- Team lead review thong qua

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 3

Title: [W2][DevOps][Chinh] Chuan hoa labels va template issue/PR

Owner: Chinh
Backup: Thinh
Label: DevOps, Chore, P1 High
Deadline noi bo: Fri Tuan 2, 22:00
Phu thuoc: Repo workflow tu W1

Muc tieu:
- Chuan hoa luong quan ly cong viec va review tren GitHub.

Output bat buoc:
- Bo labels (loai task + muc uu tien)
- Issue template
- PR template
- Muc workflow cap nhat trong README

Checklist:
- [ ] Tao labels theo chuan nhom
- [ ] Tao issue template tracking task
- [ ] Tao PR template co checklist QA/review
- [ ] Cap nhat README

Definition of Done:
- Nhom dung duoc labels va templates ngay
- PM xac nhan workflow ro rang

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 4

Title: [W2][UIUX][Duy] Hoan thien wireframe low-fidelity cho 3 man hinh

Owner: Duy
Backup: Hoang
Label: UIUX, Frontend, P1 High
Deadline noi bo: Sun Tuan 2, 18:00
Phu thuoc: Scope final v1

Muc tieu:
- Co bo wireframe de frontend trien khai dong bo.

Output bat buoc:
- Wireframe Home
- Wireframe Input form
- Wireframe Recommendation Result

Checklist:
- [ ] Ve Home screen
- [ ] Ve Input form screen
- [ ] Ve Result screen
- [ ] Review voi Hoang va Minh

Definition of Done:
- Day du 3 man hinh
- Luong dieu huong thong suot
- Frontend xac nhan implement duoc

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 5

Title: [W2][Frontend][Hoang] Dung frontend skeleton va routing co ban

Owner: Hoang
Backup: Minh
Label: Frontend, P0 Critical
Deadline noi bo: Sun Tuan 2, 22:00
Phu thuoc: Wireframe low fidelity

Muc tieu:
- Khoi tao bo khung frontend chay duoc de san sang tich hop.

Output bat buoc:
- Frontend skeleton chay duoc
- Base routes cho Home/Input/Result

Checklist:
- [ ] Setup cau truc frontend
- [ ] Tao routes cho 3 man hinh
- [ ] Tao layout co ban
- [ ] Tao PR va request review

Definition of Done:
- Chay duoc local
- Route khop wireframe
- PR da duoc review

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 6

Title: [W2][Frontend][Minh] Tao component input va result card

Owner: Minh
Backup: Duy
Label: Frontend, UIUX, P1 High
Deadline noi bo: Sun Tuan 2, 22:00
Phu thuoc: Frontend skeleton

Muc tieu:
- Tao component dung chung cho phan input va ket qua.

Output bat buoc:
- Component input form
- Component recommendation result card

Checklist:
- [ ] Tao component input theo fields da chot
- [ ] Tao result card component
- [ ] Them loading/empty/error state co ban
- [ ] Xin review UI tu Duy

Definition of Done:
- Component tai su dung duoc
- Props ro rang
- Hien thi du lieu gia lap duoc

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 7

Title: [W2][Backend][Nguyen] Chot schema va quy tac loc/xep hang v1

Owner: Nguyen
Backup: Chinh
Label: Backend, Algorithm, P0 Critical
Deadline noi bo: Sat Tuan 2, 18:00
Phu thuoc: Scope final + W1 IO draft

Muc tieu:
- Chot schema du lieu va quy tac loc/xep hang ban dau cho recommendation.

Output bat buoc:
- Data schema final v1
- Filtering rules theo budget/distance/preference
- Ghi chu ranking logic ban dau

Checklist:
- [ ] Chot ten truong va kieu du lieu
- [ ] Viet rule loc theo rang buoc
- [ ] Viet quy tac xep hang ban dau
- [ ] Review voi Thinh va Bao

Definition of Done:
- Schema day du va nhat quan
- Rule loc ro rang, test duoc bang tay
- PM review thong qua

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 8

Title: [W2][Data][Thinh] Ban giao dataset mau da lam sach va mapping

Owner: Thinh
Backup: Nguyen
Label: Data, Backend, P0 Critical
Deadline noi bo: Sat Tuan 2, 20:00
Phu thuoc: Schema final tu Nguyen

Muc tieu:
- Co bo du lieu mau sach de dung ngay cho coding prototype.

Output bat buoc:
- Dataset mau da clean (CSV/JSON)
- Ghi chu nguon va field mapping

Checklist:
- [ ] Chuan hoa cot theo schema final
- [ ] Loai bo du lieu loi/thieu
- [ ] Kiem tra tinh nhat quan du lieu
- [ ] Ban giao cho Nguyen va Chinh

Definition of Done:
- Data file doc duoc ngay
- Cot du lieu khop schema
- Co tai lieu nguon va mapping ro rang

Bao cao tien do:
- Cap nhat truoc 23:00 moi ngay

---

## Card 9

Title: [W2][Meeting][Phuoc] Checkpoint giua tuan va xu ly blocker

Owner: Phuoc
Backup: Bao
Label: Management, P0 Critical
Deadline noi bo: Wed Tuan 2, 22:00
Phu thuoc: W2 tasks in progress

Muc tieu:
- Kiem tra tien do giua tuan va xu ly blocker som.

Output bat buoc:
- Bien ban checkpoint giua tuan
- Danh sach blocker + owner xu ly

Checklist:
- [ ] Review tien do tung task
- [ ] Xac dinh task cham
- [ ] Chot owner xu ly blocker
- [ ] Cap nhat Meeting Log

Definition of Done:
- Co bien ban checkpoint day du
- Blocker da co owner va deadline xu ly

Bao cao tien do:
- Cap nhat ngay sau meeting

---

## Card 10

Title: [W2][Meeting][Phuoc] Tong ket Tuan 2 va ban giao Tuan 3

Owner: Phuoc
Backup: Bao
Label: Management, P1 High
Deadline noi bo: Sun Tuan 2, 22:30
Phu thuoc: All W2 cards

Muc tieu:
- Tong ket ket qua W2 va chot dau vao cho W3.

Output bat buoc:
- Bien ban tong ket W2
- Bang trang thai Done/Review/Blocked
- Checklist ban giao W3

Checklist:
- [ ] Tong hop output tung card W2
- [ ] Liet ke task carry-over (neu co)
- [ ] Chot dau vao cho tuan decomposition
- [ ] Chia baseline task W3

Definition of Done:
- Co tong ket W2 day du
- Ban giao W3 ro owner va deadline
- Team xac nhan ke hoach W3

Bao cao tien do:
- Cap nhat ngay sau meeting

---

## 6. Tiêu chí kết thúc Tuần 2

Tuần 2 được xem là đạt khi:
1. Scope final v1 đã được xác nhận.
2. Mục Problem Analysis đã hoàn thành.
3. Schema và rule v1 đã được chốt.
4. Bộ wireframe low-fidelity 3 màn hình đã hoàn thành.
5. Frontend skeleton và component đầu tiên đã sẵn sàng.
6. Bộ dữ liệu mẫu đã clean đã được bàn giao.
7. Biên bản bàn giao sang Tuần 3 không còn blocker nghiêm trọng chưa xử lý.
