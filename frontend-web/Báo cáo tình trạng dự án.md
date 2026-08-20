# BÁO CÁO TÌNH TRẠNG DỰ ÁN & LỘ TRÌNH CẢI THIỆN

## 1. Tại sao vẫn còn Mock Data trong dự án?
Hiện tại, tôi đã tích hợp thành công backend Python (FastAPI) vào các tính năng cốt lõi (AI Search, Itinerary, Featured Destinations). Tuy nhiên, **mock data vẫn đang tồn tại vì 2 lý do chính:**

> [!NOTE] 
> **Lý do 1: Cơ chế Fallback (Dự phòng an toàn)**
> Ở các trang như `AISearch`, `Itinerary` hay `TopResults`, tôi đã lập trình để nếu Backend Python bị tắt, quá tải hoặc gọi API thất bại, hệ thống sẽ **tự động chuyển sang dùng mock data**. Điều này giúp UI/UX không bị "chết" hay hiển thị màn hình trắng khi đang phát triển. Khi dự án lên môi trường thực tế (production), ta có thể tắt cơ chế này.

> [!NOTE] 
> **Lý do 2: Quá trình chuyển đổi (Migration) chưa hoàn tất 100%**
> Backend Python tập trung vào AI, hiện chúng ta mới chỉ thay thế API cho các tính năng quan trọng nhất. Một số trang cơ bản như `Search` (Tìm kiếm văn bản), `Destination` (Chi tiết địa điểm), hay `Favorites` vẫn đang đọc từ `mockData.js` do chưa được thay bằng các hàm gọi API tương ứng.

---

## 2. Dự án hiện tại ĐÃ CÓ NHỮNG GÌ?

### ✅ Về phía Backend Python (FastAPI):
- **Cơ sở dữ liệu:** Đã chuyển sang sử dụng bộ dữ liệu thật từ file `places_v2_full.csv` (hơn 1100+ địa điểm thực tế).
- **Endpoint AI cốt lõi:** Đã xử lý logic gợi ý điểm đến (`/recommend`) và sinh lịch trình (`/itinerary`) bằng tính toán khoảng cách tọa độ và khớp danh mục.
- **Endpoint truy xuất dữ liệu:** Đã viết xong các API:
  - `GET /destinations` (Lấy danh sách điểm đến)
  - `GET /destinations/search` (Tìm kiếm theo tên/địa chỉ)
  - `GET /destinations/featured` (Địa điểm nổi bật)
  - `GET /destinations/{place_id}` (Lấy chi tiết 1 địa điểm)
- **Hệ thống:** Đã cấu hình xong CORS để cho phép Frontend React gọi data thoải mái.

### ✅ Về phía Frontend (React/Vite):
- **Giao diện:** Đã sửa dứt điểm các lỗi render vô tận (gây giật lag thanh tìm kiếm) và lỗi crash trắng trang ở `/top-results`. Giao diện hiện tại đã chạy cực kì mượt mà.
- **Tích hợp API thực:** 
  - Trang chủ (`Home.jsx`) đã gọi API lấy địa điểm nổi bật thực tế từ Backend.
  - Trang AI Search (`AISearch.jsx`) đã tích hợp API Geocoding (chuyển đổi chữ "Đà Nẵng" thành tọa độ Lat/Lng) và gọi thẳng lên Backend Python để lấy gợi ý thật.
  - Trang Lịch trình (`Itinerary.jsx`) đã kết nối với Backend Python để tự động chia lịch các buổi (sáng/trưa/chiều/tối).

---

## 3. CẦN CẢI THIỆN GÌ TIẾP THEO?

Để loại bỏ hoàn toàn `mock data` và đưa dự án vào trạng thái hoàn chỉnh, chúng ta cần thực hiện các bước sau:

### 🚀 Giai đoạn 1: Kết nối nốt các trang Frontend còn lại với Backend Python
1. **Trang `Search.jsx` (Tìm kiếm thông thường):** Xóa bỏ file `useSearch.js` (đang lọc mock data tĩnh) và thay bằng việc gọi API `GET /destinations/search` mà tôi đã viết sẵn dưới Backend.
2. **Trang `Destination.jsx` (Chi tiết địa điểm):** Thay vì đọc id từ mock, sẽ gọi API `GET /destinations/{place_id}` để render trang chi tiết.
3. **Cập nhật hình ảnh (Database):** Trong file CSV hiện tại, ảnh đang là URL giữ chỗ (placeholder). Backend cần được cập nhật dữ liệu URL ảnh thật.

### 🔐 Giai đoạn 2: Tích hợp Backend Java
1. **Xử lý Đăng nhập / Phân quyền:** Kết nối trang Đăng nhập / Đăng ký hiện tại với JWT token của Backend Java.
2. **Lưu trữ dữ liệu cá nhân:** Hiện tại các chức năng "Yêu thích" (Favorites), "Lịch trình đã lưu" đang được lưu tạm trên RAM/LocalStorage (qua `TripContext.jsx`). Khi Backend Java sẵn sàng, ta sẽ đẩy dữ liệu này lên database của Java để đồng bộ giữa các thiết bị.

### 🎨 Giai đoạn 3: Tối ưu UX/Performance
1. Gỡ bỏ hoàn toàn `mockData.js` khỏi code base.
2. Bổ sung các trang báo lỗi 404 hoặc trang "Server đang bảo trì" để người dùng không bị bỡ ngỡ khi API sập thay vì lén lút dùng mock data.

> [!TIP]
> Bạn có thể đọc file đính kèm dưới đây. Nếu bạn đồng ý, bạn có thể bảo tôi "Bắt đầu làm Giai đoạn 1" để tôi tiến hành xóa sạch mock data ở trang Tìm kiếm và trang Chi tiết nhé!
