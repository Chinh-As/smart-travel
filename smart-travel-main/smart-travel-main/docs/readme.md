# 📘 README – ĐỒ ÁN TƯ DUY MÁY TÍNH (HỌC KỲ II - 2025)

## 👥 Thông tin nhóm

### 👤 Thành viên nhóm

| STT | Họ và tên            |   MSSV   | Vai trò     |
|:---:|:---------------------|:--------:|:------------|
|  1  | **Nguyễn Văn Phước** | 22120285 | Nhóm trưởng |
|  2  | Nguyễn Quốc Bảo      | 24120265 | Thành viên  |
|  3  | Nguyễn Trung Chính   | 24120271 | Thành viên  |
|  4  | Phạm Xuân Duy        | 24120295 | Thành viên  |
|  5  | Nguyễn Minh Hoàng    | 24120314 | Thành viên  |
|  6  | Nguyễn Hữu Duy Minh  | 24120382 | Thành viên  |
|  7  | Nguyễn Văn Nguyên    | 24120395 | Thành viên  |
|  8  | Đỗ Đức Thịnh         | 24120509 | Thành viên  |

---

## 📦 Tên đề tài

**Hệ Thống Gợi Ý Du Lịch Thông Minh - Smart Travel Assistant (Personalized Local Recommendations)**

---

## 📝 Mô tả ngắn gọn đề tài

Đồ án tập trung xây dựng hệ thống hỗ trợ gợi ý du lịch thông minh, giúp du khách dễ dàng tìm kiếm và lên lịch trình ăn uống, tham quan tại địa phương dựa trên các ràng buộc thực tế như ngân sách tối đa, bán kính di chuyển và danh mục mong muốn. 

Hệ thống được phát triển theo kiến trúc microservices phân rã rõ ràng để đảm bảo khả năng mở rộng:
* **Frontend Web (ReactJS + TailwindCSS):** Giao diện tương tác người dùng hiện đại, hiển thị trực quan bản đồ địa điểm và các đề xuất dưới dạng Card kèm lý do gợi ý (Explainable AI/Recommendation).
* **Core Backend (Java Spring Boot):** Đóng vai trò là API Gateway xử lý nghiệp vụ chính, bảo mật, quản lý phiên đăng nhập và định tuyến yêu cầu.
* **Recommendation Service (Python FastAPI):** Microservice xử lý tính toán thuật toán gợi ý, tiền xử lý dữ liệu và xếp hạng địa điểm.
* **Database (PostgreSQL + PostGIS):** Lưu trữ dữ liệu địa danh và tối ưu hóa các truy vấn không gian địa lý.

---

## 🧩 Phân chia công việc của các thành viên

Dưới đây là các đầu việc chi tiết mà mỗi thành viên đã thực hiện trong quá trình phát triển sản phẩm đến giai đoạn MVP:

- **Nguyễn Văn Phước (Nhóm trưởng / Product Owner)**
  - Quản lý phạm vi dự án (Scope Control), lập kế hoạch chạy các Sprint và quản lý backlog công việc trên Trello.
  - Phác thảo tài liệu dự án ban đầu (Scope Summary, FR/NFR).
  - Điều phối và kiểm soát quá trình tích hợp hệ thống.
  - Tổng hợp báo cáo kỹ thuật và thiết kế Slide thuyết trình.

- **Nguyễn Quốc Bảo (Thành viên / QA & Documentation)**
  - Biên soạn tài liệu **Phân tích vấn đề (Problem Analysis)** chi tiết.
  - Xây dựng Test Plan và hệ thống 15+ Test Cases kiểm tra luồng logic đề xuất.
  - Thực hiện kiểm thử và làm báo cáo kết quả kiểm thử (Test Report).
  - Ghi chép biên bản cuộc họp và nhật ký nhóm.

- **Nguyễn Trung Chính (Thành viên / DevOps Engineer)**
  - Cấu hình kho lưu trữ GitHub, thiết lập các branch rules và quy trình kiểm duyệt Pull Request.
  - Container hóa ứng dụng (Frontend React, Backend Spring Boot, Python FastAPI) bằng Docker và `docker-compose`.
  - Thiết lập luồng CI/CD tự động cơ bản qua GitHub Actions.
  - Vẽ sơ đồ kiến trúc hệ thống (System Architecture Diagram).

- **Phạm Xuân Duy (Thành viên / UI/UX Designer)**
  - Thiết kế sơ đồ luồng đi của người dùng (User Flow).
  - Vẽ Wireframe cấp độ thấp và trung bình (Low/Mid-Fidelity) cho các màn hình chính (Trang chủ, Form nhập liệu, Trang kết quả) trên Figma.
  - Xây dựng bộ quy tắc thiết kế giao diện (UI Guideline).

- **Nguyễn Minh Hoàng (Thành viên / Frontend Developer)**
  - Khởi tạo khung ứng dụng ReactJS và cấu hình hệ thống định tuyến (Routing).
  - Lập trình màn hình nhập liệu (Input Form) và viết logic xác thực dữ liệu đầu vào.
  - Tích hợp kết nối API nhận dữ liệu từ Core Backend.

- **Nguyễn Hữu Duy Minh (Thành viên / Frontend Developer)**
  - Phát triển component bản đồ Leaflet để hiển thị trực quan các điểm đến.
  - Hoàn thiện các component giao diện (Result Card) và tối ưu hóa hiển thị thích ứng (Responsive UI).
  - Lập trình giao diện xử lý các trạng thái trống/lỗi/chờ tải (Empty, Error, Loading states).

- **Nguyễn Văn Nguyên (Thành viên / Core Backend Developer)**
  - Thiết kế lược đồ dữ liệu cơ sở dữ liệu (Database Schema).
  - Xây dựng kiến trúc 3 lớp (Controller-Service-Repository) trên Java Spring Boot làm cổng kết nối API.
  - Thiết lập các lớp DTO chuyển đổi dữ liệu và bộ xử lý ngoại lệ toàn cục.

- **Đỗ Đức Thịnh (Thành viên / Data & AI Developer)**
  - Phát triển microservice FastAPI (Python) làm nhiệm vụ chạy thuật toán đề xuất.
  - Thu thập, chuẩn hóa và làm sạch bộ dữ liệu mẫu (Dataset CSV) gồm hơn 50 địa điểm thực tế.
  - Triển khai logic nạp dữ liệu (Data loader) và lập trình thuật toán chấm điểm địa điểm.

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

Để hiện thực hóa ý tưởng thô sơ thành một sản phẩm nguyên mẫu hoạt động trơn tru và có khả năng mở rộng tích hợp AI, nhóm đã áp dụng phương pháp luận **Tư duy Máy tính (Computational Thinking)** qua các giai đoạn sau:

### 1. Phân tích vấn đề (Problem Analysis)

Hệ thống bắt đầu từ nhu cầu thực tiễn của khách du lịch khi đến một địa điểm mới: làm sao để tìm được chỗ ăn uống, tham quan phù hợp với túi tiền và khoảng cách di chuyển. Ban đầu, ý tưởng chỉ là *"gợi ý địa điểm du lịch bằng máy tính"*. Nhóm đã phân tích và làm rõ vấn đề từ một định nghĩa mơ hồ (Ill-defined) sang một định nghĩa rõ ràng (Well-defined) có thể lập trình được:

* **Mục tiêu:** Lọc và xếp hạng **Top-K** địa điểm từ tập dữ liệu dựa trên các ràng buộc: danh mục (category), ngân sách tối đa (max_budget), và bán kính di chuyển tối đa (max_distance_km).
* **Đầu vào (Input):**
  * `category`: thể loại địa điểm (food, sightseeing, hotel).
  * `max_budget`: mức ngân sách trần (low, medium, high).
  * `max_distance_km`: bán kính tối đa cho phép (km).
  * `top_k`: số lượng kết quả mong muốn trả về.
* **Đầu ra (Output):** Danh sách địa điểm đã sắp xếp kèm thông tin cụ thể: Tên, Thể loại, Mức giá, Khoảng cách (km), Đánh giá (Rating), Điểm số tổng hợp (Score).
* **Phạm vi MVP:** Tập trung giải quyết luồng Tìm kiếm & Gợi ý (Search Flow) dựa trên luật cứng (Rule-based). Các tính năng như chatbot, đặt vé, hoặc tính tọa độ thời gian thực được tách ra khỏi scope MVP.

### 2. Phân rã bài toán (Decomposition)

Hệ thống được chia nhỏ thành các cấu phần độc lập để các thành viên dễ dàng phát triển song song:
* **Phân rã hệ thống:** Chia thành 4 cấu phần chính giao tiếp qua API RESTful:
  1. *Frontend:* Giao diện lấy input của người dùng và hiển thị đề xuất.
  2. *Gateway Backend (Spring Boot):* Quản lý logic nghiệp vụ và định tuyến.
  3. *Recommendation Service (FastAPI):* Dịch vụ chuyên biệt bằng Python để tính toán thuật toán.
  4. *Database:* Nơi lưu trữ bộ dữ liệu địa điểm.
* **Phân rã luồng xử lý gợi ý:** Pipeline xử lý một yêu cầu đề xuất trên FastAPI được tách nhỏ thành 6 bước tuần tự:
  ```text
  [Input] -> [Lọc danh mục] -> [Lọc ngân sách] -> [Lọc khoảng cách] -> [Tính composite score] -> [Sắp xếp] -> [Cắt Top-K] -> [Output]
  ```

### 3. Nhận dạng mẫu (Pattern Recognition)

Nhóm đã tìm ra các mẫu thiết kế và dữ liệu lặp đi lặp lại để chuẩn hóa mã nguồn:
* **Mẫu so sánh ngân sách (Budget Hierarchy):** Nhận diện mức độ ngân sách là thông tin dạng thứ tự. Quy đổi các mức chuỗi chữ thành số nguyên tương ứng: `low = 0`, `medium = 1`, `high = 2`. Từ đó, việc lọc ngân sách được biểu diễn bằng biểu thức toán học đơn giản: `price_rank(place) <= price_rank(max_budget)`.
* **Mẫu chấm điểm phạt khoảng cách (Distance Penalty):** Nhận diện tâm lý người dùng: thích chỗ đánh giá cao nhưng ngại di chuyển xa. Áp dụng công thức tính điểm phạt tuyến tính dựa trên khoảng cách.
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

#### A. Công thức tính điểm tổng hợp (Scoring Formula)
Điểm số tổng hợp ($Score$) dùng để xếp hạng các địa điểm thỏa mãn bộ lọc:
$$Score = Rating \times 2 - Distance(km) \times 0.25$$
*Giải thích:* Điểm đánh giá (Rating) được nhân hệ số 2 để đóng vai trò quyết định chính, khoảng cách (Distance) nhân hệ số 0.25 làm điểm phạt (phạt càng nhiều nếu ở càng xa).

#### B. Quy tắc sắp xếp kết quả
Các địa điểm sau khi tính điểm sẽ được sắp xếp theo thứ tự:
$$Score\text{ giảm dần (DESC)} \rightarrow Rating\text{ giảm dần (DESC)} \rightarrow Distance\text{ tăng dần (ASC)}$$

#### C. Mã giả thuật toán (Pseudocode)

```python
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
            place_category = place['category'].lower().strip()
            place_budget_rank = GetPriceRank(place['price_level'])
            place_distance = float(place['distance_km'])

            If (place_category == target_category) And
               (place_budget_rank <= target_budget_rank) And
               (place_distance <= max_distance_km) Then
               
               # Bước 4: Tính điểm tổng hợp (composite score)
               place['score'] = place['rating'] * 2 - place_distance * 0.25
               Append place to filtered_places
            EndIf
        EndFor

        If Length(filtered_places) == 0 Then
            Return EmptyDataFrame
        EndIf

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

Việc áp dụng **Tư duy Máy tính (Computational Thinking)** đã giúp nhóm 8 thành viên thiết kế và xây dựng thành công một nguyên mẫu MVP hoàn chỉnh và chạy ổn định. Thay vì bối rối trước các yêu cầu phức tạp của một hệ thống du lịch lớn, nhóm đã phân rã bài toán thành các dịch vụ độc lập, biểu diễn dữ liệu rõ ràng qua trừu tượng hóa và cài đặt thuật toán lọc/xếp hạng chặt chẽ. Hệ thống cung cấp kết quả gợi ý minh bạch kèm giải thích cụ thể cho du khách, tạo nền tảng vững chắc để phát triển nâng cao sang các mô hình AI/NLP (như trích xuất tag lọc từ câu thoại tự nhiên của người dùng, phân tích cảm xúc từ review thực tế) ở giai đoạn tiếp theo.
