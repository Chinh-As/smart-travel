# Smoke Test Checklist – Smart Travel System

> Tài liệu liệt kê các kịch bản kiểm tra nhanh (smoke test) để xác nhận luồng tích hợp hoạt động đúng.
> Mục đích: Kiểm tra nhanh trong 15-30 phút để đảm bảo hệ thống **không bị hỏng nghiêm trọng** trước khi chuyển sang test chi tiết.
> Phiên bản: v1.0 · Cập nhật: 2026-04-25

---

## Hướng dẫn sử dụng

- **Ai thực hiện:** QA Lead (Bảo) hoặc bất kỳ thành viên nào
- **Khi nào chạy:** Sau mỗi lần merge code vào `main`, trước demo, hoặc sau tích hợp mới
- **Công cụ cần:** Trình duyệt (Chrome/Firefox), Postman (hoặc curl), Terminal
- **Ký hiệu:**
  - ✅ PASS — Hoạt động đúng
  - ❌ FAIL — Lỗi, cần fix
  - ⏭️ SKIP — Chưa implement / không áp dụng
  - 🟡 PARTIAL — Hoạt động nhưng có vấn đề nhỏ

---

## Phần A: Kiểm tra Hạ tầng (Infrastructure Smoke)

> Đảm bảo tất cả services khởi động được và giao tiếp bình thường.

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|
| A1 | Frontend khởi động | Chạy `npm run dev` trong `frontend-web/`, mở `http://localhost:3000` | Trang chủ hiển thị | ☐ | |
| A2 | Backend Core khởi động | Chạy `./mvnw spring-boot:run` trong `backend-core/`, mở `http://localhost:8080` | Không lỗi 500, trả response (có thể 404 cho root) | ☐ | |
| A3 | Recommendation Service khởi động | Chạy `uvicorn src.app:app` hoặc `streamlit run src/app.py` trong `recommendation-service/` | Service ready, không exception | ☐ | |
| A4 | Database kết nối | Kết nối PostgreSQL tại `localhost:5432/smarttravel` | Connection successful | ☐ | |
| A5 | Backend → Python health check | `curl http://localhost:8000/health` | `{"status": "ok"}` hoặc 200 | ☐ | |
| A6 | Frontend → Backend connectivity | Từ browser console, gọi `fetch('http://localhost:8080/api/v1/health')` | Không bị CORS block, nhận response | ☐ | |

---

## Phần B: Kiểm tra Đăng ký & Đăng nhập (Authentication Smoke)

| # | Test Case | Precondition | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|---|
| B1 | Đăng ký thành công | Email chưa tồn tại | POST `/api/v1/auth/user/register` với `{email: "test@smoke.com", name: "Smoke", password: "Test1234!", confirm_password: "Test1234!"}` | 200 OK + `access_token` + `refresh_token` | ☐ | |
| B2 | Đăng ký trùng email | Email đã tồn tại | POST `/api/v1/auth/user/register` với email cũ | 400 + `"User is already exists"` | ☐ | |
| B3 | Đăng ký thiếu field | Không gửi password | POST `/api/v1/auth/user/register` thiếu field | 400 + validation error | ☐ | |
| B4 | Đăng nhập thành công | User đã đăng ký | POST `/api/v1/auth/user/login` với `{email, password}` đúng | 200 OK + `access_token` | ☐ | |
| B5 | Đăng nhập sai password | User đã đăng ký | POST `/api/v1/auth/user/login` với password sai | 401 + `"Unauthenticated"` | ☐ | |
| B6 | Đăng nhập Google | Có Google account | POST `/api/v1/auth/user/google` với `google_id_token` hợp lệ | 200 OK + JWT tokens | ☐ | |
| B7 | Auto-login sau đăng ký | Vừa đăng ký xong | Kiểm tra response B1 có `access_token` | Token trả về ngay, không cần login lại | ☐ | |

---

## Phần C: Kiểm tra Luồng Gợi ý (Recommendation Flow Smoke) ⭐

> Đây là phần **quan trọng nhất** — kiểm tra luồng chính end-to-end.

| # | Test Case | Precondition | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|---|
| C1 | Gợi ý cơ bản — có kết quả | Đã login, có JWT | POST `/api/v1/recommendation` với `{location: {type: "COORDINATES", lat: 10.76, lng: 106.68}, constraints: {budget: {amount: 500000}, radius_km: 5.0, main_category: "FOOD"}}` | 200 OK + `recommendations[]` có ≥ 1 item | ☐ | |
| C2 | Gợi ý với prompt text | Đã login | Thêm `prompt_text: "Quán yên tĩnh, có mèo"` vào request C1 | 200 OK + `nlp_extracted_tags` chứa tags liên quan | ☐ | |
| C3 | Gợi ý — không có kết quả | Đã login | POST với `radius_km: 0.1` (rất nhỏ) | 200 OK + `recommendations: []` (mảng rỗng) | ☐ | |
| C4 | Gợi ý — không có JWT | Không login | POST `/api/v1/recommendation` không có header Authorization | 401 Unauthorized | ☐ | |
| C5 | Gợi ý — JWT hết hạn | Token expired | POST với expired token | 401 + message rõ ràng | ☐ | |
| C6 | Kết quả có score hợp lý | Đã login | Gọi C1, kiểm tra field `match_score` | Score > 0, địa điểm đầu tiên có score cao nhất | ☐ | |
| C7 | Kết quả có match_reason | Đã login | Gọi C1, kiểm tra field `match_reason` | Mỗi item có `match_reason` không rỗng | ☐ | |
| C8 | Search history được lưu | Đã gọi C1 thành công | Kiểm tra bảng `search_history` trong DB | Có record mới với `user_id`, `prompt_text`, `search_params` | ☐ | |

---

## Phần D: Kiểm tra Profile & Preferences

| # | Test Case | Precondition | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|---|
| D1 | Xem profile | Đã login | GET `/api/v1/user/me` với Bearer token | 200 OK + `{id, email, name, base_budget, transport_type, needs_wheelchair}` | ☐ | |
| D2 | Profile có preferences mặc định | Vừa đăng ký | GET `/api/v1/user/me` | `transport_type: "MOTORBIKE"`, `needs_wheelchair: false` | ☐ | |
| D3 | Cập nhật preferences | Đã login | PUT `/api/v1/user/preferences` thay đổi `base_budget` | 200 OK, GET lại thấy giá trị mới | ☐ | |

---

## Phần E: Kiểm tra Recommendation Service (Python Standalone)

> Test riêng Python service để isolate lỗi nếu luồng E2E fail.

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|
| E1 | Health check | `curl http://localhost:8000/health` | 200 OK | ☐ | |
| E2 | Recommend — food, low budget | POST `/recommend` với `{category: "food", max_budget: "low", max_distance_km: 3.0, top_k: 3}` | Trả về danh sách food, price_level ≤ low | ☐ | |
| E3 | Recommend — sightseeing | POST `/recommend` với `{category: "sightseeing", max_budget: "medium", max_distance_km: 5.0, top_k: 5}` | Trả về sightseeing places | ☐ | |
| E4 | Recommend — no match | POST `/recommend` với `{category: "food", max_budget: "low", max_distance_km: 0.5}` | `recommendations: []` hoặc empty DataFrame | ☐ | |
| E5 | Scoring đúng công thức | Kiểm tra kết quả E2: `score = rating × 2 − distance_km × 0.25` | Giá trị score khớp công thức | ☐ | |
| E6 | Sorting đúng thứ tự | Kiểm tra kết quả E2 | Score giảm dần, nếu bằng thì rating giảm dần, nếu vẫn bằng thì distance tăng dần | ☐ | |
| E7 | Unit test pass | `cd recommendation-service && python -m pytest -q` | Tất cả tests pass | ☐ | |

---

## Phần F: Kiểm tra Giao diện (Frontend UI Smoke)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|
| F1 | Trang chủ load thành công | Mở `http://localhost:3000` | Trang hiển thị đầy đủ, không lỗi console | ☐ | |
| F2 | Thanh search hiển thị | Trang chủ | Thấy search bar / form input nổi bật | ☐ | |
| F3 | Form input validation | Bấm "Tìm kiếm" mà không điền gì | Hiển thị lỗi validation inline | ☐ | |
| F4 | Submit form → có kết quả | Điền đủ thông tin, bấm "Tìm kiếm" | Loading → Hiển thị cards kết quả | ☐ | |
| F5 | Submit form → không có kết quả | Điền radius rất nhỏ (0.1 km) | Hiển thị thông báo "Không tìm thấy" | ☐ | |
| F6 | Card hiển thị đủ thông tin | Có kết quả từ F4 | Mỗi card có: tên, category, price, distance, rating, score/match_reason | ☐ | |
| F7 | Responsive layout | Resize browser xuống 375px (mobile) | Layout không bị vỡ, cards stack dọc | ☐ | |
| F8 | Trang đăng nhập | Navigate đến trang login | Form email + password hiển thị | ☐ | |
| F9 | Trang đăng ký | Navigate đến trang register | Form đăng ký hiển thị đầy đủ fields | ☐ | |
| F10 | Error state khi mất kết nối | Tắt backend, bấm "Tìm kiếm" | Hiển thị lỗi kết nối thân thiện, không crash | ☐ | |

---

## Phần G: Kiểm tra Tích hợp End-to-End (E2E Smoke) ⭐

> Test toàn bộ luồng từ đầu đến cuối qua UI.

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Status | Ghi chú |
|---|---|---|---|---|---|
| G1 | Luồng hoàn chỉnh: Đăng ký → Tìm kiếm → Xem kết quả | 1. Mở trang đăng ký<br/>2. Điền thông tin, submit<br/>3. Được redirect về trang chủ<br/>4. Nhập tiêu chí tìm kiếm<br/>5. Bấm "Tìm kiếm"<br/>6. Xem kết quả | Tất cả bước thành công, kết quả hiển thị dạng cards | ☐ | |
| G2 | Luồng hoàn chỉnh: Đăng nhập → Tìm kiếm | 1. Đăng nhập bằng email<br/>2. Tìm kiếm food, low budget, 3km<br/>3. Xem kết quả | Kết quả trả về đúng (chỉ food, giá low, trong 3km) | ☐ | |
| G3 | Luồng hoàn chỉnh: Admin Login | 1. Mở trang admin login<br/>2. Đăng nhập admin | Đăng nhập thành công, thấy admin dashboard | ☐ | |
| G4 | Consistency kiểm tra: API vs UI | 1. Gọi API recommendation qua Postman<br/>2. Gọi cùng params qua UI<br/>3. So sánh kết quả | Kết quả trùng khớp | ☐ | |
| G5 | Demo scenario: Budget Student | 1. Login<br/>2. Tìm: food, low, 2km, top_k=3 | Kết quả hợp lý cho sinh viên tiết kiệm | ☐ | |
| G6 | Demo scenario: Foreign Tourist | 1. Login<br/>2. Tìm: sightseeing, medium, 5km, top_k=5 | Kết quả hợp lý cho du khách | ☐ | |

---

## Tổng kết Smoke Test

### Bảng tổng hợp kết quả

| Phần | Tổng test | Pass | Fail | Skip | Partial |
|---|---|---|---|---|---|
| A — Hạ tầng | 6 | | | | |
| B — Authentication | 7 | | | | |
| C — Recommendation Flow | 8 | | | | |
| D — Profile & Preferences | 3 | | | | |
| E — Python Standalone | 7 | | | | |
| F — Frontend UI | 10 | | | | |
| G — E2E | 6 | | | | |
| **Tổng cộng** | **47** | | | | |

### Tiêu chí PASS toàn bộ Smoke Test

> ✅ **PASS** nếu thỏa **tất cả** điều kiện sau:
> 1. Phần A: Tất cả services khởi động thành công (A1–A6 pass)
> 2. Phần C: Luồng recommendation chính hoạt động (C1 pass)
> 3. Phần E: Unit test pass (E7 pass)
> 4. Phần G: Ít nhất 1 luồng E2E pass (G1 hoặc G2 pass)
> 5. Không có test nào ở mức **FAIL** gây crash hoặc mất dữ liệu

### Khi Smoke Test FAIL

1. **Ghi nhận** test case nào fail vào cột "Ghi chú"
2. **Chụp screenshot** hoặc copy error log
3. **Báo ngay** cho owner tương ứng:
   - Lỗi Frontend → Hoàng / Minh
   - Lỗi Backend → Nguyên
   - Lỗi Python → Thịnh
   - Lỗi tích hợp / CORS / Docker → Chính
4. **Tạo issue** trên Trello với label `bug` + priority level
5. **Không tiếp tục** test sâu cho đến khi smoke test pass

---

### Lịch chạy Smoke Test

| Thời điểm | Trigger | Người chạy |
|---|---|---|
| Sau mỗi merge vào `main` | Tự động (CI) hoặc manual | Chính (DevOps) |
| Trước buổi demo nội bộ | Manual | Bảo (QA Lead) |
| Sau tích hợp mới (kết nối FE-BE) | Manual | Bảo + Chính |
| Trước nộp bài | Manual | Bảo + Phước |

