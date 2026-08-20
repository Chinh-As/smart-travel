# Walkthrough: Tích hợp API Python Backend & Dữ liệu thật

Tuyệt vời! Tôi đã hoàn thành việc tích hợp toàn bộ **Frontend React** với **Python Backend** sử dụng file dữ liệu thật `places_v2_full.csv` (hơn 1180 địa điểm thực tế). Các agents gặp chút sự cố về hạn mức sử dụng (quota) ở giữa chừng, nhưng tôi đã trực tiếp tiếp quản và hoàn tất toàn bộ quy trình.

Dưới đây là tóm tắt những thay đổi đã thực hiện:

## 1. Cập nhật Python Backend 🐍
- **CORS Middleware**: Đã được thêm vào `app.py` để cho phép React frontend (`localhost:3000` / `5173`) gọi API mà không bị lỗi Cross-Origin.
- **Tương thích Data mới**: Đã cấu hình backend để load `places_v2_full.csv` và điều chỉnh lại hàm biến đổi dữ liệu (`_coerce_places_v2`, `_row_to_place`) để xử lý mượt mà các cột dữ liệu mới như `address`, `description`, `review_count`, và `opening_hours`.
- **Thêm Endpoints mới**:
  - `GET /destinations/search`: Hỗ trợ tìm kiếm theo text (tên, địa chỉ, mô tả) + filter theo category.
  - `GET /destinations/featured`: Lấy danh sách địa điểm nổi bật dựa trên điểm số (rating x review_count), giúp trang chủ hiển thị đa dạng.
  - `GET /destinations/{place_id}`: Lấy chi tiết một địa điểm bằng UUID.
  - `GET /destinations`: Endpoint danh sách chung có phân trang.

## 2. Lớp Dịch Vụ API Frontend (Service Layer) 🌐
- Đã tạo `src/services/apiConfig.js` để quản lý `API_BASE_URL` (có thể lấy từ môi trường hoặc mặc định `http://localhost:8000`).
- Đã tạo `src/services/recommendationApi.js` cung cấp tập hợp đầy đủ các hàm gọi API bằng native `fetch()`.
- Đã tạo **Data Transformers** (`src/services/dataTransformers.js`) để "biên dịch" định dạng dữ liệu trả về từ backend (tiếng Anh, schema mới) thành định dạng chuẩn mà các component UI hiện tại của bạn đang sử dụng (giá VND, icon Tiếng Việt, v.v.). Điều này đảm bảo UI không bị vỡ.

## 3. Tích hợp API vào UI (Pages & Components) ⚛️
Tất cả các trang giờ đây đều gọi API và có **cơ chế dự phòng (fallback) tự động** quay về dùng `mockData.js` nếu backend chưa chạy:
- **`Home.jsx`**: Giờ đây fetch danh sách "Địa điểm nổi bật" từ `/destinations/featured`.
- **`useSearch.js`**: Hook tìm kiếm chính đã được làm lại hoàn toàn để gọi API `/destinations/search`, đồng thời kết hợp linh hoạt bộ lọc cục bộ cho các tiêu chí chưa có trên backend.
- **`Destination.jsx` & `Trip.jsx`**: Đã sửa để load chi tiết địa điểm dựa trên UUID (`place_id`) thay vì số nguyên.
- **`Review.jsx`**: Tự động gọi API lấy một gợi ý điểm đến tiếp theo có cùng category (cùng chủ đề).
- **`AISearch.jsx`**: Nút "Tạo ngay" đã được cấu hình gọi `/recommend` của backend, tính tổng ngân sách và truyền toạ độ hiện tại.
- **`Itinerary.jsx`**: Trình tạo lịch trình AI giờ đây gọi `/itinerary` API. Dữ liệu trả ra được tự động sắp xếp vào các múi giờ Frontend tương ứng (Sáng, Trưa, Chiều, Tối).
- **`FilterPanel.jsx`**: Load động danh sách category từ backend.
- **`Favorites.jsx`**: Xử lý tải hàng loạt danh sách yêu thích bằng API nếu tồn tại.

> [!TIP]
> Bạn có thể bắt đầu cả frontend và backend ngay bây giờ để xem dữ liệu thật:
> 1. Terminal 1 (Backend): `cd c:\Frontend\smart-travel\recommendation-service` và chạy `uvicorn src.app:app --reload`
> 2. Terminal 2 (Frontend): `cd c:\Frontend\smart-travel\frontend-web` và chạy `npm run dev`

Mọi thứ đã sẵn sàng cho bạn kiểm tra! Cứ thoải mái chạy test thử tính năng tìm kiếm, xem chi tiết và tạo lịch trình AI với data mới nhé!
