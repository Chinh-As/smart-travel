# 📘 README – ĐỒ ÁN TƯ DUY TÍNH TOÁN (HỌC KỲ II - 2025)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Chinh-As/smart-travel)

## 🎬 Video Demo Sản Phẩm MVP

> **📺 Link YouTube (Unlisted):** [https://youtu.be/rn6cj8IdtCo](https://youtu.be/rn6cj8IdtCo)

*Video demo các chức năng chính của sản phẩm (không quá 5 phút, không lồng tiếng, không lồng nhạc).*

---

## 👥 Thông tin nhóm 8

### 👤 Thành viên nhóm

| STT | Họ và tên            |   MSSV   | Vai trò                          |
|:---:|:---------------------|:--------:|:---------------------------------|
|  1  | **Nguyễn Văn Phước** | 22120285 | Nhóm trưởng / Product Owner      |
|  2  | Nguyễn Quốc Bảo      | 24120265 | QA & Documentation               |
|  3  | Nguyễn Trung Chính   | 24120271 | DevOps Engineer                  |
|  4  | Phạm Xuân Duy        | 24120295 | UI/UX Designer                   |
|  5  | Nguyễn Minh Hoàng    | 24120314 | Frontend Developer               |
|  6  | Nguyễn Hữu Duy Minh  | 24120382 | Frontend Developer               |
|  7  | Nguyễn Văn Nguyên    | 24120395 | Core Backend Developer           |
|  8  | Đỗ Đức Thịnh         | 24120509 | Data & AI Developer              |

---

## 📦 Tên đề tài

**Hệ Thống Gợi Ý Du Lịch Thông Minh - Smart Travel Assistant (Personalized Local Recommendations)**

---

## 📝 Mô tả ngắn gọn đề tài

Đồ án tập trung xây dựng hệ thống hỗ trợ gợi ý du lịch thông minh, giúp du khách dễ dàng tìm kiếm và lên lịch trình ăn uống, tham quan tại địa phương dựa trên các ràng buộc thực tế như ngân sách tối đa, bán kính di chuyển và danh mục mong muốn.

Hệ thống được phát triển theo kiến trúc microservices phân rã rõ ràng để đảm bảo khả năng mở rộng:
* **Frontend Web (ReactJS + Vite):** Giao diện tương tác người dùng hiện đại, hiển thị trực quan các đề xuất dưới dạng Card kèm lý do gợi ý (Explainable Recommendation).
* **Core Backend (Java Spring Boot):** Đóng vai trò là API Gateway xử lý nghiệp vụ chính, bảo mật, quản lý phiên đăng nhập và định tuyến yêu cầu.
* **Recommendation Service (Python FastAPI):** Microservice xử lý tính toán thuật toán gợi ý, tiền xử lý dữ liệu và xếp hạng địa điểm.
* **Database (PostgreSQL):** Lưu trữ dữ liệu địa danh.

---

## 🧩 Phân chia công việc của các thành viên

Dưới đây là các đầu việc chi tiết mà mỗi thành viên đã thực hiện trong quá trình phát triển sản phẩm đến giai đoạn MVP:

- **Nguyễn Văn Phước (Nhóm trưởng / Product Owner)**
  - Quản lý phạm vi dự án (Scope Control), lập kế hoạch chạy các Sprint và quản lý backlog công việc trên Trello.
  - Phác thảo tài liệu dự án ban đầu (Scope Summary, FR/NFR).
  - Điều phối và kiểm soát quá trình tích hợp hệ thống (merge branches, review code).
  - Tổng hợp báo cáo kỹ thuật và thiết kế Slide thuyết trình.

- **Nguyễn Quốc Bảo (Thành viên / QA & Documentation)**
  - Biên soạn tài liệu **Phân tích vấn đề (Problem Analysis)** chi tiết.
  - Xây dựng Test Plan và hệ thống 15+ Test Cases kiểm tra luồng logic đề xuất.
  - Thực hiện kiểm thử và làm báo cáo kết quả kiểm thử (Test Report).
  - Ghi chép biên bản cuộc họp và nhật ký nhóm.

- **Nguyễn Trung Chính (Thành viên / DevOps Engineer)**
  - Cấu hình kho lưu trữ GitHub, thiết lập các branch rules và quy trình kiểm duyệt Pull Request.
  - Container hóa ứng dụng (Frontend React, Backend Spring Boot, Python FastAPI) bằng Docker và `docker-compose`.
  - Thiết lập hướng dẫn CORS cho tích hợp Frontend-Backend và fix build backend-core (Maven Wrapper).
  - Vẽ sơ đồ kiến trúc hệ thống (System Architecture Diagram).

- **Phạm Xuân Duy (Thành viên / UI/UX Designer)**
  - Thiết kế sơ đồ luồng đi của người dùng (User Flow).
  - Vẽ Wireframe cấp độ thấp và trung bình (Low/Mid-Fidelity) cho các màn hình chính (Trang chủ, Form nhập liệu, Trang kết quả) trên Figma.
  - Xây dựng bộ quy tắc thiết kế giao diện (UI Guideline).

- **Nguyễn Minh Hoàng (Thành viên / Frontend Developer)**
  - Khởi tạo khung ứng dụng ReactJS + Vite và cấu hình hệ thống định tuyến (Routing) với 16 trang.
  - Lập trình các trang chức năng: Home, Search, AISearch, Itinerary, Destination, Trip, Favorites, Review, Profile.
  - Phát triển component Header, Footer, ChatBot, FilterPanel, SearchBar, SearchCard.

- **Nguyễn Hữu Duy Minh (Thành viên / Frontend Developer)**
  - Phát triển các trang About Us, Contact và component liên quan.
  - Hoàn thiện các component giao diện (Result Card) và tối ưu hóa hiển thị thích ứng (Responsive UI).
  - Lập trình giao diện xử lý các trạng thái trống/lỗi/chờ tải (Empty, Error, Loading states).

- **Nguyễn Văn Nguyên (Thành viên / Core Backend Developer)**
  - Thiết kế lược đồ dữ liệu cơ sở dữ liệu (Database Schema).
  - Xây dựng kiến trúc 3 lớp (Controller-Service-Repository) trên Java Spring Boot làm cổng kết nối API.
  - Phát triển Itinerary scheduling logic (ItineraryController, ItineraryService, ItineraryScheduler).
  - Thiết lập các lớp DTO chuyển đổi dữ liệu và bộ xử lý ngoại lệ toàn cục.
  - Cải tiến công thức scoring sang Normalized Weighted Formula.

- **Đỗ Đức Thịnh (Thành viên / Data & AI Developer)**
  - Phát triển microservice FastAPI (Python) với 4 REST API endpoints: `/health`, `/recommend`, `/itinerary`, `/categories`.
  - Thu thập, chuẩn hóa và làm sạch bộ dữ liệu mẫu (Dataset CSV).
  - Triển khai Data Adapter v1 (normalize payload, haversine distance, budget mapping) kèm unit tests.
  - Lập trình thuật toán chấm điểm và xếp hạng địa điểm.

---

## 📊 Tỉ lệ đóng góp của các thành viên (Tổng = 100%)

| Thành viên | Tỉ lệ đóng góp | Điểm đề xuất |
|:---|:---:|:---:|
| Nguyễn Văn Phước | 100% | 10 / 10 |
| Nguyễn Quốc Bảo | 100% | 10 / 10 |
| Nguyễn Trung Chính | 100% | 10 / 10 |
| Phạm Xuân Duy | 100% | 10 / 10 |
| Nguyễn Minh Hoàng | 100% | 10 / 10 |
| Nguyễn Hữu Duy Minh | 100% | 10 / 10 |
| Nguyễn Văn Nguyên | 100% | 10 / 10 |
| Đỗ Đức Thịnh | 100% | 10 / 10 |

---

## 💡 Áp dụng Kiến thức Tư duy Tính toán (Computational Thinking) đến giai đoạn MVP

Để hiện thực hóa ý tưởng thô sơ thành một sản phẩm nguyên mẫu hoạt động trơn tru và có khả năng mở rộng tích hợp AI, nhóm đã áp dụng phương pháp luận **Tư duy Tính toán (Computational Thinking)** qua các giai đoạn sau:

### 1. Phân tích vấn đề (Problem Analysis)

Hệ thống bắt đầu từ nhu cầu thực tiễn của khách du lịch khi đến một địa điểm mới: làm sao để tìm được chỗ ăn uống, tham quan phù hợp với túi tiền và khoảng cách di chuyển. Ban đầu, ý tưởng chỉ là *"gợi ý địa điểm du lịch bằng máy tính"*. Nhóm đã phân tích và làm rõ vấn đề từ một định nghĩa mơ hồ (Ill-defined) sang một định nghĩa rõ ràng (Well-defined) có thể lập trình được:

* **Mục tiêu:** Lọc và xếp hạng **Top-K** địa điểm từ tập dữ liệu dựa trên các ràng buộc: danh mục (category), ngân sách tối đa (max_budget), và bán kính di chuyển tối đa (max_distance_km).
* **Đầu vào (Input):**
  * `category`: thể loại địa điểm (cafe, food, sightseeing, hotel, park, museum).
  * `max_budget`: mức ngân sách trần (low, medium, high).
  * `max_distance_km`: bán kính tối đa cho phép (km).
  * `top_k`: số lượng kết quả mong muốn trả về.
* **Đầu ra (Output):** Danh sách địa điểm đã sắp xếp kèm thông tin cụ thể: Tên, Thể loại, Mức giá, Khoảng cách (km), Đánh giá (Rating), Điểm số tổng hợp (Score), và Lý do gợi ý (Match Reason).
* **Phạm vi MVP:** Tập trung giải quyết luồng Tìm kiếm & Gợi ý (Search Flow) dựa trên luật cứng (Rule-based). Các tính năng như chatbot AI, đặt vé, hoặc tính tọa độ thời gian thực được tách ra khỏi scope MVP.

### 2. Phân rã bài toán (Decomposition)

Hệ thống được chia nhỏ thành các cấu phần độc lập để các thành viên dễ dàng phát triển song song:
* **Phân rã hệ thống:** Chia thành 4 cấu phần chính giao tiếp qua API RESTful:
  1. *Frontend (React + Vite):* Giao diện lấy input của người dùng và hiển thị đề xuất.
  2. *Gateway Backend (Spring Boot):* Quản lý logic nghiệp vụ, lập lịch trình và định tuyến.
  3. *Recommendation Service (FastAPI):* Dịch vụ chuyên biệt bằng Python để tính toán thuật toán.
  4. *Database:* Nơi lưu trữ bộ dữ liệu địa điểm.
* **Phân rã luồng xử lý gợi ý:** Pipeline xử lý một yêu cầu đề xuất trên FastAPI được tách nhỏ thành 6 bước tuần tự:
  ```text
  [Input] -> [Lọc danh mục] -> [Lọc ngân sách] -> [Lọc khoảng cách] -> [Tính composite score] -> [Sắp xếp] -> [Cắt Top-K] -> [Output]
  ```

### 3. Nhận dạng mẫu (Pattern Recognition)

Nhóm đã tìm ra các mẫu thiết kế và dữ liệu lặp đi lặp lại để chuẩn hóa mã nguồn:
* **Mẫu so sánh ngân sách (Budget Hierarchy):** Nhận diện mức độ ngân sách là thông tin dạng thứ tự. Quy đổi các mức chuỗi chữ thành số nguyên tương ứng: `low = 0`, `medium = 1`, `high = 2`. Từ đó, việc lọc ngân sách được biểu diễn bằng biểu thức toán học đơn giản: `price_rank(place) <= price_rank(max_budget)`.
* **Mẫu chuẩn hóa điểm đa tiêu chí (Normalized Multi-criteria Scoring):** Nhận diện rằng rating (thang 1-5) và khoảng cách (thang 0-N km) có đơn vị khác nhau. Áp dụng chuẩn hóa Min-Max đưa tất cả về thang [0, 1] trước khi tính tổng trọng số, tránh hiện tượng một yếu tố áp đảo yếu tố khác.
* **Mẫu kiến trúc React (React Design Patterns):** Sử dụng *Provider Pattern* để quản lý trạng thái phiên đăng nhập toàn cục và *Custom Hooks Pattern* (`useSearch.js`) cô lập thuật toán fuzzy match chữ khỏi giao diện.

### 4. Trừu tượng hóa (Abstraction)

Để hệ thống hoạt động hiệu quả, nhóm đã trừu tượng hóa thông tin địa điểm trong thực tế thành các thuộc tính mô hình hóa cốt lõi, loại bỏ các thuộc tính không cần thiết cho thuật toán xếp hạng tại giai đoạn MVP:

| Thuộc tính giữ lại (Core Attributes) | Thuộc tính lược bỏ (Non-core Attributes) |
|---|---|
| `name` (Tên địa điểm) | Hình ảnh chất lượng cao (chỉ tải ở trang chi tiết) |
| `category` (Danh mục phân loại) | Số điện thoại, website, email |
| `price_level` (Mức giá đại diện) | Menu chi tiết các món ăn/thức uống |
| `distance_km` (Khoảng cách tính từ vị trí người dùng) | Toạ độ vĩ độ/kinh độ gốc (trừu tượng thành khoảng cách số thực) |
| `rating` (Điểm đánh giá trung bình) | Danh sách và nội dung các bình luận cũ |

### 5. Thiết kế và biểu diễn thuật toán (Algorithm Design)

Thuật toán gợi ý cốt lõi được xây dựng gồm hai giai đoạn chính:

#### A. Công thức tính điểm tổng hợp (Normalized Weighted Scoring Formula)

Điểm số tổng hợp dùng để xếp hạng các địa điểm thỏa mãn bộ lọc, sử dụng **công thức trọng số chuẩn hóa**:

$$Score = W_r \times R_{norm} + W_d \times D_{norm} + W_p \times P_{match}$$

Trong đó:
* **W_r = 0.4** (trọng số Rating), **W_d = 0.3** (trọng số Distance), **W_p = 0.3** (trọng số Preference)
* **R_norm** = (rating - 1.0) / 4.0 + bonus_review — chuẩn hóa rating từ thang [1, 5] về [0, 1], cộng thêm bonus nhỏ nếu có nhiều lượt đánh giá (review_count)
* **D_norm** = 1.0 - (distance_km / max_distance_km) — chuẩn hóa ngược: càng gần thì điểm càng cao
* **P_match** = 1.0 (placeholder cho phát triển sau — khớp sở thích chi tiết)

*Giải thích:* Tất cả yếu tố được chuẩn hóa về thang [0, 1] trước khi nhân trọng số. Điều này đảm bảo rating và khoảng cách đóng góp công bằng vào điểm tổng hợp, không bị lệch do đơn vị khác nhau.

#### B. Quy tắc sắp xếp kết quả
Các địa điểm sau khi tính điểm sẽ được sắp xếp theo thứ tự:

$$Score\text{ giảm dần (DESC)} \rightarrow Rating\text{ giảm dần (DESC)} \rightarrow Distance\text{ tăng dần (ASC)}$$

#### C. Mã giả thuật toán (Pseudocode)

```
Algorithm RecommendPlaces:
    Input:
        places_df: DataFrame chứa danh sách các địa điểm
        category: string (danh mục lọc)
        max_budget: string ('low', 'medium', hoặc 'high')
        max_distance_km: float (bán kính tối đa)
        top_k: integer (số lượng kết quả tối đa cần lấy)
    Output:
        ranked_places: DataFrame chứa Top-K địa điểm phù hợp nhất

    Begin
        # Bước 1: Hàm quy đổi mức giá sang số nguyên để so sánh bậc
        Function GetPriceRank(budget_str):
            Switch budget_str.lower().strip():
                Case 'low': Return 0
                Case 'medium': Return 1
                Case 'high': Return 2
                Default: Return 3
            EndSwitch
        EndFunction

        # Bước 2: Chuẩn hóa tham số đầu vào
        target_category = category.lower().strip()
        target_budget_rank = GetPriceRank(max_budget)

        # Bước 3: Áp dụng bộ lọc ràng buộc
        filtered_places = []
        For each place in places_df:
            If (place.category == target_category) And
               (GetPriceRank(place.price_level) <= target_budget_rank) And
               (place.distance_km <= max_distance_km) Then
               Append place to filtered_places
            EndIf
        EndFor

        If Length(filtered_places) == 0 Then
            Return EmptyDataFrame
        EndIf

        # Bước 4: Chuẩn hóa và tính điểm tổng hợp (Normalized Weighted Score)
        For each place in filtered_places:
            R_norm = (place.rating - 1.0) / 4.0        // Chuẩn hóa rating [1,5] -> [0,1]
            D_norm = 1.0 - (place.distance_km / max_distance_km)  // Gần = cao
            P_match = 1.0                               // Placeholder cho preference

            place.score = 0.4 * R_norm + 0.3 * D_norm + 0.3 * P_match
        EndFor

        # Bước 5: Sắp xếp danh sách kết quả
        Sort filtered_places by:
            score Descending,
            rating Descending,
            distance_km Ascending

        # Bước 6: Cắt lát lấy Top-K kết quả đầu tiên
        ranked_places = TakeFirst(filtered_places, top_k)

        Return ranked_places
    End
```

### 6. Kết luận

Việc áp dụng **Tư duy Tính toán (Computational Thinking)** đã giúp nhóm 8 thành viên thiết kế và xây dựng thành công một nguyên mẫu MVP hoàn chỉnh và chạy ổn định. Thay vì bối rối trước các yêu cầu phức tạp của một hệ thống du lịch lớn, nhóm đã phân rã bài toán thành các dịch vụ độc lập, biểu diễn dữ liệu rõ ràng qua trừu tượng hóa và cài đặt thuật toán lọc/xếp hạng chặt chẽ. Hệ thống cung cấp kết quả gợi ý minh bạch kèm giải thích cụ thể cho du khách, tạo nền tảng vững chắc để phát triển nâng cao sang các mô hình AI/NLP (như trích xuất tag lọc từ câu thoại tự nhiên của người dùng, phân tích cảm xúc từ review thực tế) ở giai đoạn tiếp theo.

---

## 🗂️ Cấu trúc mã nguồn

```
smart-travel/
├── frontend-web/          # React + Vite (16 pages)
│   ├── src/components/    # Header, Footer, ChatBot, SearchBar, ...
│   ├── src/pages/         # Home, Search, AISearch, Itinerary, ...
│   ├── src/context/       # AuthContext, TripContext
│   └── src/hooks/         # useSearch
├── backend-core/          # Java Spring Boot (API Gateway)
│   └── src/main/java/com/smarttravel/
│       ├── place/         # PlaceController, PlaceService, PlaceRepository
│       ├── recommendation/ # RecommendationController, RecommendationService
│       └── itinerary/     # ItineraryController, ItineraryScheduler
├── recommendation-service/ # Python FastAPI (Thuật toán gợi ý)
│   ├── src/app.py         # 4 endpoints: /health, /recommend, /itinerary, /categories
│   ├── src/core/recommender.py  # Thuật toán scoring & ranking
│   ├── src/services/      # Data adapter, Data loader
│   └── data/processed/    # Dataset CSV
├── docs/                  # Tài liệu kỹ thuật
├── docker-compose.yml     # 5 services: frontend, backend, recommendation, PostgreSQL, Redis
└── readme.md              # File này
```

---

## 🚀 Hướng dẫn khởi chạy hệ thống nhanh (Quick Start)

Dưới đây là các bước để cài đặt và khởi chạy dự án. Quá trình này được chia thành hai phần: **Thiết lập 1 lần duy nhất** (khi cài lần đầu) và **Khởi chạy hàng ngày** (mỗi lần muốn sử dụng).

### 🔑 Tài khoản đăng nhập kiểm thử (Mặc định)
Sau khi Backend Java khởi chạy thành công lần đầu tiên, hệ thống sẽ tự động tạo sẵn 2 tài khoản mẫu trong cơ sở dữ liệu để bạn sử dụng:
* **Tài khoản User:** `user@smarttravel.com` / mật khẩu: `user123`
* **Tài khoản Admin:** `admin@smarttravel.com` / mật khẩu: `admin123`

---

### 🛠️ PHẦN I: THIẾT LẬP 1 LẦN DUY NHẤT (Chỉ làm lần đầu tiên)

Nếu bạn không sử dụng Docker, bạn cần chuẩn bị môi trường trên Windows như sau:

#### 1. Cài đặt các công cụ cần thiết
* **PostgreSQL (phiên bản >= 15):** Tải và cài đặt từ trang chủ [PostgreSQL](https://www.postgresql.org/).
* **Extension PostGIS:** Trong hoặc sau quá trình cài PostgreSQL, mở công cụ **Stack Builder** đi kèm, chọn cài đặt **PostGIS** (nằm trong phần *Spatial Extensions*).
* **JDK 17 trở lên** (để chạy Java Backend) và **Node.js** (để chạy Frontend Web).

#### 2. Khởi tạo Cơ sở dữ liệu
1. Mở pgAdmin 4, tạo một database trống tên là `smarttravel`.
2. Mở **Query Tool** trên database `smarttravel` mới tạo và chạy câu lệnh SQL sau để kích hoạt PostGIS:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Cấu hình mật khẩu kết nối database: Mở file [application.yml](file:///c:/coding/antigravity/smart-travel-1/backend-core/src/main/resources/application.yml) ở thư mục `backend-core/src/main/resources/`, chỉnh sửa mật khẩu PostgreSQL của máy bạn tại dòng số 8 (mặc định là `123456`).

#### 3. Cấu hình API Key cho Chatbot (Gemini AI)
Tùy thuộc vào phương thức khởi chạy bạn chọn ở Phần II, bạn cần cấu hình khóa API Gemini tại tệp tương ứng:

* **Trường hợp 1: Nếu khởi chạy bằng Docker Compose (Khuyên dùng):**
  1. Mở file `.env` ở **thư mục gốc** của dự án (`smart-travel-1/.env`) (nếu chưa có, sao chép từ `.env.example`).
  2. Điền **Gemini API Key cá nhân** của bạn vào dòng:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
* **Trường hợp 2: Nếu khởi chạy thủ công từng dịch vụ (Không dùng Docker):**
  1. Mở file `.env` trong thư mục `recommendation-service/` (nếu chưa có, sao chép từ `.env.example`).
  2. Điền **Gemini API Key cá nhân** của bạn vào dòng:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

---

### 🏃 PHẦN II: KHỞI CHẠY HÀNG NGÀY (Mỗi lần muốn sử dụng web)

Khi đã thiết lập xong ở Phần I, mỗi lần muốn sử dụng web, bạn **chỉ cần chạy các lệnh khởi chạy dưới đây** (Database PostgreSQL thường đã được Windows chạy ngầm sẵn, bạn không cần mở pgAdmin 4 nữa).

Bạn có thể chọn một trong hai cách khởi chạy sau:

#### Cách 1: Sử dụng Docker Compose (Khuyên dùng - Nhanh và đơn giản nhất)
*Yêu cầu: Máy tính của bạn đã bật sẵn phần mềm **Docker Desktop**.*

Mở Terminal tại thư mục gốc của dự án (`smart-travel-1`) và chạy các lệnh tương ứng:

* **Khởi chạy toàn bộ dịch vụ (chạy ngầm):**
  ```bash
  docker compose up -d
  ```
* **Build lại code mới nhất và khởi chạy:**
  ```bash
  docker compose up --build -d
  ```
* **Mở trang web trực tiếp trên trình duyệt (sau khi hệ thống chạy):**
  * *Trên PowerShell:*
    ```powershell
    Start-Process "http://localhost:3000"
    ```
  * *Trên CMD:*
    ```cmd
    start http://localhost:3000
    ```
* **Kiểm tra trạng thái các dịch vụ đang chạy:**
  ```bash
  docker compose ps
  ```
* **Tắt trang web và dừng toàn bộ dịch vụ:**
  ```bash
  docker compose down
  ```

#### Cách 2: Khởi chạy thủ công từng dịch vụ (Không dùng Docker)
Mở 3 cửa sổ Terminal (hoặc 3 tab Terminal độc lập trong VS Code) và chạy đồng thời các dịch vụ sau:

* **Terminal 1: Khởi chạy Backend Python (FastAPI - Cổng 5000) (Bắt buộc)**
  ```bash
  cd recommendation-service
  # Kích hoạt môi trường ảo Python
  .\venv\Scripts\activate   # Trên Windows
  # source venv/bin/activate # Trên Mac/Linux
  
  # Chạy service
  uvicorn src.app:app --port 5000 --host 127.0.0.1 --reload
  ```

* **Terminal 2: Khởi chạy Backend Java (Spring Boot - Cổng 8000) (Bắt buộc)**
  ```bash
  cd backend-core
  .\mvnw spring-boot:run
  ```

* **Terminal 3: Khởi chạy Frontend Web (React Vite - Cổng 3000) (Bắt buộc)**
  ```bash
  cd frontend-web
  npm run dev
  ```

---

### 4. Quy trình kiểm tra & Sử dụng
* Khi cả 3 Terminal báo chạy thành công, truy cập trình duyệt tại địa chỉ: 👉 **http://localhost:3000**
* Đăng nhập bằng tài khoản **Admin** hoặc **User** ở trên (hoặc nhấn nút **"Dùng tài khoản demo →"** trên màn hình Login để đăng nhập nhanh).
* Thử tính năng Chatbot AI hoặc trải nghiệm lên lịch trình để kiểm tra tích hợp giữa Frontend, Java Backend và Python Service.
