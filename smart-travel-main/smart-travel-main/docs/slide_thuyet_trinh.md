# 📽️ Nội Dung Slide Thuyết Trình — Smart Travel MVP

> **Môn:** Tư Duy Tính Toán (CTT009) | **HK2 - 2025**
> **Thời lượng ước tính:** 15-20 phút

---

## SLIDE 1: Trang bìa

**Tiêu đề:** HỆ THỐNG GỢI Ý DU LỊCH THÔNG MINH — Smart Travel Assistant

**Phụ đề:** Personalized Local Recommendations

**Thông tin:**
- Môn: Tư Duy Tính Toán (CTT009) — HK2/2025
- GVHD: [Tên GV]
- Nhóm: 8 thành viên
- Nhóm trưởng: Nguyễn Văn Phước — 22120285

---

## SLIDE 2: Thành viên nhóm

| STT | Họ và tên | MSSV | Vai trò |
|:---:|:---|:---:|:---|
| 1 | **Nguyễn Văn Phước** | 22120285 | Nhóm trưởng / Product Owner |
| 2 | Nguyễn Quốc Bảo | 24120265 | QA & Documentation |
| 3 | Nguyễn Trung Chính | 24120271 | DevOps Engineer |
| 4 | Phạm Xuân Duy | 24120295 | UI/UX Designer |
| 5 | Nguyễn Minh Hoàng | 24120314 | Frontend Developer |
| 6 | Nguyễn Hữu Duy Minh | 24120382 | Frontend Developer |
| 7 | Nguyễn Văn Nguyên | 24120395 | Core Backend Developer |
| 8 | Đỗ Đức Thịnh | 24120509 | Data & AI Developer |

---

## SLIDE 3: Vấn đề thực tế

**Tiêu đề:** 🎯 Bài toán: Du khách gặp khó khi lên kế hoạch

**Nội dung:**
- Du khách đến nơi mới → **không biết ăn ở đâu, chơi chỗ nào**
- Tìm trên Google Maps → **hàng trăm kết quả, không lọc được theo túi tiền**
- Muốn lên lịch trình 1 ngày → **phải tự sắp xếp thủ công, mất thời gian**

**Câu hỏi đặt ra:**
> *"Làm sao để máy tính tự động gợi ý Top-K địa điểm phù hợp nhất dựa trên ngân sách, khoảng cách, và sở thích — rồi tự lên lịch trình trong ngày?"*

**Hình minh họa:** Icon người du lịch bối rối trước bản đồ

---

## SLIDE 4: Giải pháp — Smart Travel

**Tiêu đề:** 💡 Giải pháp: Hệ thống gợi ý thông minh

**3 tính năng cốt lõi MVP:**

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Gợi ý địa điểm** | Lọc + xếp hạng Top-K theo category, budget, radius |
| 2 | **Tạo lịch trình AI** | Tự động xếp 4 khung giờ: Sáng → Trưa → Chiều → Tối |
| 3 | **Giải thích kết quả** | Mỗi gợi ý kèm lý do: "Gần bạn 0.1km, rating 4.5⭐" |

**Điểm khác biệt:** Không chỉ tìm → mà còn **giải thích tại sao** gợi ý (Explainable Recommendation)

---

## SLIDE 5: Áp dụng Tư Duy Tính Toán — Tổng quan

**Tiêu đề:** 🧠 5 Trụ cột Tư Duy Tính Toán

```
┌─────────────────────────────────────────────────────────┐
│  1. Phân tích vấn đề   →  Từ mơ hồ → rõ ràng          │
│  2. Phân rã             →  Chia thành 4 microservices   │
│  3. Nhận dạng mẫu       →  Budget hierarchy, Scoring   │
│  4. Trừu tượng hóa      →  6 thuộc tính cốt lõi       │
│  5. Thiết kế thuật toán  →  Filter → Score → Rank       │
└─────────────────────────────────────────────────────────┘
```

---

## SLIDE 6: TDTT — Phân tích vấn đề

**Tiêu đề:** 1️⃣ Phân tích vấn đề (Problem Analysis)

**Từ Ill-defined → Well-defined:**

| Ill-defined (mơ hồ) | Well-defined (rõ ràng) |
|---|---|
| "Gợi ý du lịch bằng máy tính" | Lọc Top-K địa điểm từ dataset theo 3 ràng buộc |

**Input đầu vào:**
- `category`: cafe, food, sightseeing, hotel, park, museum
- `max_budget`: low / medium / high
- `max_distance_km`: bán kính (km) từ vị trí người dùng
- `top_k`: số kết quả mong muốn

**Output đầu ra:**
- Danh sách địa điểm xếp hạng kèm: Tên, Rating, Khoảng cách, Score, Lý do gợi ý

---

## SLIDE 7: TDTT — Phân rã bài toán

**Tiêu đề:** 2️⃣ Phân rã bài toán (Decomposition)

**Phân rã hệ thống → 4 microservices:**

```
┌──────────────┐    REST API     ┌──────────────┐    REST API    ┌────────────────────┐
│  Frontend    │ ──────────────► │ Backend Core │ ─────────────► │ Recommendation     │
│  React+Vite  │                 │ Spring Boot  │                │ Service (FastAPI)  │
│  Port 3000   │                 │ Port 8000    │                │ Port 5000          │
└──────────────┘                 └──────────────┘                └────────────────────┘
                                        │                                │
                                        ▼                                ▼
                                 ┌──────────────┐                ┌──────────────┐
                                 │ PostgreSQL   │                │ Dataset CSV  │
                                 └──────────────┘                └──────────────┘
```

**Phân rã luồng xử lý:**
```
[Input] → [Lọc category] → [Lọc budget] → [Lọc distance] → [Tính score] → [Sắp xếp] → [Top-K]
```

---

## SLIDE 8: TDTT — Nhận dạng mẫu

**Tiêu đề:** 3️⃣ Nhận dạng mẫu (Pattern Recognition)

**Mẫu 1 — Budget Hierarchy (so sánh bậc):**
```
"low" = 0,  "medium" = 1,  "high" = 2
Lọc:  price_rank(place) ≤ price_rank(max_budget)
```
→ Người chọn "high" sẽ thấy cả low, medium, high

**Mẫu 2 — Normalized Weighted Scoring:**
```
Score = 0.4 × Rating_norm + 0.3 × Distance_norm + 0.3 × Preference
```
- Rating chuẩn hóa: (rating - 1) / 4 + bonus review_count
- Distance chuẩn hóa ngược: 1 - (distance / max_distance)

**Mẫu 3 — React Design Patterns:**
- Provider Pattern → AuthContext (quản lý đăng nhập)
- Custom Hooks → useSearch (fuzzy match tách khỏi UI)

---

## SLIDE 9: TDTT — Trừu tượng hóa

**Tiêu đề:** 4️⃣ Trừu tượng hóa (Abstraction)

**Giữ lại 6 thuộc tính cốt lõi, loại bỏ chi tiết không cần thiết:**

| ✅ Giữ lại | ❌ Lược bỏ |
|---|---|
| `name` — Tên địa điểm | Hình ảnh HD, gallery |
| `category` — Phân loại | Menu chi tiết |
| `price_level` — Mức giá | Số điện thoại, email |
| `distance_km` — Khoảng cách | Tọa độ gốc lat/lng |
| `rating` — Đánh giá TB | Nội dung bình luận |
| `score` — Điểm tổng hợp | Lượt xem, bookmark |

→ **Đủ thông tin để xếp hạng, không thừa để gây nhiễu**

---

## SLIDE 10: TDTT — Thiết kế thuật toán

**Tiêu đề:** 5️⃣ Thiết kế thuật toán (Algorithm Design)

**Pseudocode:**
```
Algorithm RecommendPlaces(places, category, max_budget, max_distance_km, top_k):
    
    1. budget_rank = PriceRank(max_budget)    // "medium" → 1
    
    2. filtered = Filter places WHERE:
         category MATCH target_category
         AND price_rank ≤ budget_rank
         AND distance_km ≤ max_distance_km
    
    3. FOR each place IN filtered:
         score = 0.4 × normalize_rating(rating)
               + 0.3 × (1 - distance/max_distance)
               + 0.3 × preference_match
    
    4. SORT filtered BY score DESC, rating DESC, distance ASC
    
    5. RETURN TOP-K results
```

**Độ phức tạp:** O(N log N) — với N là số địa điểm trong dataset

---

## SLIDE 11: Demo — Kiến trúc hệ thống chạy thực

**Tiêu đề:** 🖥️ Demo: Hệ thống hoạt động

**API Endpoints đang chạy:**

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/health` | GET | Kiểm tra trạng thái server |
| `/categories` | GET | Lấy danh sách categories |
| `/recommend` | POST | Gợi ý Top-K địa điểm |
| `/itinerary` | POST | Tạo lịch trình 4 khung giờ |

**Ví dụ request `/recommend`:**
```json
{
  "location": {"type": "COORDINATES", "lat": 10.7769, "lng": 106.7009},
  "constraints": {"budget": "medium", "radius_km": 5, "category": "cafe"},
  "top_k": 3
}
```

**→ Chuyển sang demo trực tiếp trên trình duyệt**

---

## SLIDE 12: Demo — Giao diện Frontend

**Tiêu đề:** 🌐 Giao diện người dùng

**Hiển thị screenshots thực tế:**
- Trang chủ: Hero banner + Search bar + Địa điểm nổi bật
- Menu Tiện Ích: Lịch trình, Tạo lịch trình, Nhận diện địa danh, Cảnh báo
- Trang AI Tạo Lịch Trình: Input sở thích → Generate → Timeline 4 khung giờ
- Chatbot Mr. Roboto: Hỗ trợ hỏi đáp nhanh

**16 trang đã hoàn thiện:** Home, Search, AISearch, Destination, Itinerary, Trip, Favorites, Review, Profile, Login, Register, ForgotPassword, ChangePassword, Onboarding, TopResults, Utilities

---

## SLIDE 13: Kết quả đạt được

**Tiêu đề:** ✅ Kết quả MVP

| Hạng mục | Trạng thái |
|----------|------------|
| Frontend React + Vite (16 pages) | ✅ Hoàn thành |
| Recommendation API FastAPI (4 endpoints) | ✅ Hoàn thành |
| Backend Core Spring Boot (skeleton + itinerary) | ✅ Hoàn thành |
| Thuật toán scoring chuẩn hóa | ✅ Hoàn thành |
| Docker Compose (5 services) | ✅ Hoàn thành |
| CORS Guide + GitHub Templates | ✅ Hoàn thành |
| Unit Tests (data adapter) | ✅ Hoàn thành |
| Tài liệu kỹ thuật (Problem Analysis, Integration Flow, Smoke Test) | ✅ Hoàn thành |

**Số liệu:**
- 100+ files source code
- 8 API endpoints
- 47 test cases trong Smoke Test Checklist
- 8 địa điểm mẫu trong dataset

---

## SLIDE 14: Kế hoạch tiếp theo

**Tiêu đề:** 🚀 Roadmap sau MVP

| Giai đoạn | Nội dung |
|-----------|----------|
| **Sprint 4** | Kết nối Frontend ↔ API thật (bỏ mock data) |
| **Sprint 4** | Trang Admin quản lý địa điểm (CRUD) |
| **Sprint 5** | Mở rộng dataset (50+ → 500+ địa điểm) |
| **Sprint 5** | NLP: trích xuất intent từ câu thoại tự nhiên |
| **Sprint 6** | Tích hợp bản đồ Leaflet hiển thị marker |
| **Sprint 6** | Sentiment Analysis từ review người dùng |

---

## SLIDE 15: Kết luận + Q&A

**Tiêu đề:** 📌 Kết luận

**Tóm tắt:**
> Nhóm đã áp dụng 5 trụ cột **Tư Duy Tính Toán** để biến ý tưởng mơ hồ "gợi ý du lịch" thành hệ thống microservices hoạt động thực tế:
> - **Phân tích** → xác định Input/Output rõ ràng
> - **Phân rã** → 4 services độc lập phát triển song song
> - **Nhận dạng mẫu** → Budget hierarchy, Weighted scoring
> - **Trừu tượng** → 6 thuộc tính cốt lõi
> - **Thuật toán** → Filter → Score → Rank (O(N log N))

**Kết quả:** MVP hoạt động end-to-end, gợi ý minh bạch kèm giải thích, nền tảng vững chắc cho AI/NLP.

> **CẢM ƠN THẦY/CÔ & CÁC BẠN!**
> *Phần hỏi đáp — Q&A*

---

## 📋 Gợi ý phân chia trình bày

| Slide | Người trình bày đề xuất | Thời gian |
|-------|------------------------|-----------|
| 1-2 | Phước (mở đầu) | 1 phút |
| 3-4 | Bảo (vấn đề + giải pháp) | 2 phút |
| 5-6 | Thịnh (TDTT: phân tích) | 2 phút |
| 7 | Nguyên (TDTT: phân rã + kiến trúc) | 2 phút |
| 8-9 | Thịnh (TDTT: mẫu + trừu tượng) | 2 phút |
| 10 | Nguyên (TDTT: thuật toán) | 2 phút |
| 11-12 | Hoàng (demo live) | 3 phút |
| 13-14 | Chính (kết quả + roadmap) | 2 phút |
| 15 | Phước (kết luận + Q&A) | 2 phút |

**Tổng: ~18 phút**

---

## 🎬 Gợi ý quay video demo MVP

**Kịch bản quay (2-3 phút):**

1. **Mở terminal** → chạy `uvicorn` → thấy server running
2. **Mở browser** → `localhost:3000` → thấy trang chủ đẹp
3. **Test API** trên Swagger (`localhost:8000/docs`):
   - Gọi `/health` → OK
   - Gọi `/categories` → 6 categories
   - Gọi `/recommend` với tọa độ HCM → kết quả cafe kèm lý do
   - Gọi `/itinerary` → lịch trình 4 khung giờ
4. **Quay frontend**: Click qua các trang Home → Tiện Ích → AI Tạo Lịch Trình
5. **Kết thúc**: Show terminal logs chứng minh API được gọi thực
