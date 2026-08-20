# Input-Output Recommendation and Data Schema
Tài liệu này mô tả I/O Recommendation và Database Schema.

## I/O Recommendation
I/O (Input/Output) là cách hệ thống của ta giao tiếp với thế giới bên ngoài.
### 1. User Login

#### Đăng nhập bằng Google (user)
* **Mô tả:** Nhận token từ Google do Frontend gửi lên, xác thực và trả về JWT của hệ thống.
* **Endpoint:** `POST /api/v1/auth/user/google`
* **Người gọi:** React Frontend

**Input (Request Body):**
```json
{
  "google_id_token": "string (bắt buộc)"
}
```

**Output (Response - 200 OK):**
```json
{
    "status": "success",
    "data": {
        "access_token": "string (JWT)",
        "refresh_token": "string (JWT)"
    }
}
```

**Output (Response - 401 Error):**
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```



#### Đăng nhập bằng email (user)
* **Mô tả:** Nhận email, password do Frontend gửi lên, xác thực và trả về JWT của hệ thống.
* **Endpoint:** `POST /api/v1/auth/user/login`
* **Người gọi:** React Frontend

**Input (Request Body):**
```json
{
  "email": "string",
  "password": "string"
}
```

**Output:**
```json
{
  "status": "success",
  "data": {
    "access_token": "string (JWT)",
    "refresh_token": "string (JWT)"
  }
}
```


### 2. Admin Login

#### Đăng nhập bằng email (admin)
* **Mô tả:** Nhận email, password do Admin Dashboard Frontend gửi lên, xác thực và trả về JWT của hệ thống.
* **Endpoint:** `POST /api/v1/auth/admin/login`
* **Người gọi:** React Frontend

**Input (Request Body):**
```json
{
  "email": "string",
  "password": "string"
}
```

**Output:**
```json
{
  "status": "success",
  "data": {
    "access_token": "string (JWT)", // sub: userID; iat: issue at; exp: expiration; role: admin
    "refresh_token": "string (JWT)"
  }
}
```


### 3. User Register
* **Mô tả:** Nhận thông tin đăng ký, kiểm tra trùng lặp, mã hóa mật khẩu, tạo dữ liệu ở cả bảng users và user_preferences, cuối cùng trả về Token để tự động đăng nhập (Auto-login).
* **Endpoint:** `POST /api/v1/auth/user/register`
* **Người gọi:** React Frontend

**Input (Request Body):**
```json
{
  "email": "leon@example.com",
  "name": "Leon",
  "password": "StrongPassword123!",
  "confirm_password": "StrongPassword123!"
}
```

**Output (Response - 200 OK)**
```json
{
  "status": "success",
  "message": "Đăng ký thành công!",
  "data": {
    "access_token": "string (JWT)",
    "refresh_token": "string (JWT)"
  }
}
```

**Output (Response - 400 Bad Request):**
```json
{
  "status": "error",
  "message": "User is already exists"
}
```

*Lưu ý:*

* **Mã hóa (Hashing):** Tuyệt đối không lưu chuỗi `StrongPassword123!` xuống DB. Phải dùng `BCryptPasswordEncoder` của Spring Security băm nó ra thành một chuỗi loằng ngoằng trước khi Insert.

* **Atomic Transaction (@Transactional):** Khi user đăng ký thành công, phải thực hiện 2 lệnh INSERT liên tiếp: Một cái vào bảng `users` và một cái vào bảng `user_preferences` (với các giá trị default như `base_budget = null`, `transport_type = 'MOTORBIKE'`). Phải gắn `@Transactional` trên hàm Service để lỡ cái lệnh thứ 2 bị lỗi thì cái thứ 1 cũng bị hủy theo (Rollback), tránh tình trạng có user mà không có bảng sở thích.

* **Auto-login:** Đăng ký xong đừng bắt người ta ra màn hình Đăng nhập gõ lại pass. Trả luôn JWT về cho Frontend để họ vào thẳng app luôn (UX đỉnh cao là ở chỗ này).

### 4. Get User Profile
* **Mô tả:** Lấy thông tin người dùng hiện tại (profile + preferences). Lấy `user_id` từ JWT trong header.
* **Endpoint:** `GET /api/v1/user/me`
* **Người gọi:** React Frontend
* **Header:** `Authorization: Bearer <access_token>`

**Output (Response - 200 OK):**
```json
{
  "status": "success",
  "message": "Get Me Successful",
  "data": {
    "id": "UUID",
    "email": "string",
    "name": "string",
    "has_completed_onboarding": true,
    "auth_provider": "string",
    "base_budget": 5000000.0,
    "transport_type": "MOTORBIKE",
    "needs_wheelchair": false,
    "created_at": "yyyy-MM-dd HH:mm:ss"
  }
}
```

### 5. Lấy danh sách gợi ý địa điểm
* **Mô tả:** Nhận các ràng buộc phần cứng (ngân sách, khoảng cách) và phần mềm (văn bản tự do) từ Frontend. Trích xuất NLP và tính toán Top K địa điểm phù hợp nhất.
* **Endpoint:** `POST /api/v1/recommendation`
* **Người gọi:** React Frontend
* **Header:** `Authorization: Bearer <access_token>`

**Input (Request Body):**

> Khi người dùng chọn COORDINATES
```json
{
  "location": {
    "type": "COORDINATES",
    "lat": 10.762622,
    "lng": 106.681043
  },
  "constraints": {
    "budget": {
      "amount": 50000000.0,
      "currency": "VND"
    },
    "radius_km": 5.0,
    "number_of_people": 3,
    "transport_type": "MOTORBIKE",
    "needs_wheelchair": false,
    "main_category": "FOOD",
    "sub_category": "CAFE"
  },
  "prompt_text": "Mình muốn một không gian yên tĩnh, có mèo và đồ uống không quá ngọt"
}
```

> Khi người dùng chọn CITY
```json
{
  "location": {
    "type": "CITY",
    "city_name": "Đắk Lắk"
  },
  "constraints": {
    "budget": {
      "amount": 50000000.0,
      "currency": "VND"
    },
    "radius_km": 5.0,
    "number_of_people": 3,
    "transport_type": "MOTORBIKE",
    "needs_wheelchair": false,
    "main_category": "FOOD",
    "sub_category": "CAFE"
  },
  "prompt_text": "Mình muốn đến nơi có Voi, có các hàng quán ăn ngon ít người biết"
}
```

**Output (Response):**
```json
{
  "status": "success",
  "data": {
    "nlp_extracted_tags": ["Yên tĩnh", "quán cà phê mèo", "ít ngọt"],
    "recommendations": [
      {
        "places_id": "uuid-1234-5678",
        "name": "Cafe Mèo Cỏ",
        "lat": 10.765112,
        "lng": 106.682334,
        "images_url": "https://example.com/catfe.jpg",
        "match_score": 95.72,
        "distance_km": 1.2,
        "price_level": 2,
        "match_reason": "Khớp 100% với ngân sách và nằm trong bán kính. LLM đánh giá phù hợp với tiêu chí: yên tĩnh, có mèo."
      },
      {
        "places_id": "uuid-1234-5679",
        "name": "Mèo Lười - Cafe Mèo",
        "lat": 10.768001,
        "lng": 106.685120,
        "images_url": "https://example.com/meoluoicf.jpg",
        "match_score": 80.8,
        "distance_km": 3.5,
        "price_level": 3,
        "match_reason": "Vượt ngân sách nhẹ nhưng phù hợp cao với yêu cầu có mèo."
      }
    ]
  }
}
```

*Lưu ý:*
* Field `distance_km` (thay cho `distances` không rõ nghĩa) — đơn vị km tính từ toạ độ user đến địa điểm.
* Field `needs_wheelchair` trong `constraints` phải khớp với tên cột trong DB (`needs_wheelchair`).

---

## Database Schema

> **Users Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `email` | VARCHAR(255) | Unique, Not Null | Dùng làm định danh chung cho cả 2 luồng |
| `name` | NVARCHAR(255) | Not Null | Tên người dùng |
| `has_completed_onboarding` | BOOLEAN | Default FALSE | Người dùng đã hoàn tất thiết lập ban đầu (sở thích/ngân sách) hay chưa |
| `created_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được tạo (thời điểm tài khoản được tạo) |
| `updated_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được cập nhật gần nhất |
| `deleted_at` | TIMESTAMP | Nullable | Thời điểm bản ghi bị xoá mềm (soft delete) |

> **User Auth Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `user_id` | UUID | Foreign Key → Users | Khoá ngoại trỏ tới bảng `Users` |
| `password_hash` | VARCHAR(255) | Nullable | Mã băm mật khẩu. Đăng nhập Google thì cột này để NULL |
| `auth_provider` | VARCHAR(50) | Default 'CREDENTIALS' | Phân biệt người dùng đăng nhập bằng `CREDENTIALS` hay `GOOGLE` |
| `role` | VARCHAR(20) | Default 'USER' | Phân quyền: `USER` hoặc `ADMIN` |


> **User Preferences Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `user_id` | UUID | Foreign Key → Users | Khoá ngoại trỏ tới bảng `Users` |
| `base_budget` | DECIMAL | Nullable | Ngân sách mặc định của người dùng |
| `currency` | VARCHAR(5) | Default 'VND' | Loại tiền tệ mà người dùng sử dụng |
| `needs_wheelchair` | BOOLEAN | Default FALSE | Người dùng có cần xe lăn hay không |
| `created_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được tạo |
| `updated_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được cập nhật gần nhất |
| `deleted_at` | TIMESTAMP | Nullable | Thời điểm bản ghi bị xoá mềm (soft delete) |

> **Search History Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `user_id` | UUID | Foreign Key → Users | Khoá ngoại trỏ tới bảng `Users` |
| `prompt_text` | TEXT | Nullable | Lưu lại câu hỏi của user: `"Yên tĩnh, có mèo"` |
| `search_params` | JSONB | Not Null | Lưu toàn bộ cụm `constraints` (bán kính, ngân sách...) dạng JSON |
| `timestamp` | TIMESTAMP | Not Null | Thời điểm tìm kiếm |
| `created_at` | TIMESTAMP | Not Null | Thời điểm tạo bản ghi |
| `updated_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được cập nhật gần nhất |
| `deleted_at` | TIMESTAMP | Nullable | Thời điểm bản ghi bị xoá mềm (soft delete) |


> **Cities Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `name` | NVARCHAR(100) | Unique, Not Null | Tên thành phố / tỉnh |

> **Places Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `name` | NVARCHAR(255) | Not Null | Tên quán / địa điểm |
| `description` | TEXT | Nullable | Mô tả ngắn về địa điểm |
| `geom` | GEOMETRY(Point, 4326) | Not Null | Toạ độ của quán (PostGIS) |
| `city_id` | UUID | Foreign Key → Cities, Nullable | Thành phố trực thuộc |
| `images_url` | VARCHAR(500) | Nullable | Link ảnh đại diện |
| `wheelchair_access` | BOOLEAN | Default FALSE | Quán có lối đi xe lăn không |
| `nlp_tags` | TEXT[] | Nullable | Mảng từ khoá: `{mèo, yên tĩnh}`. LLM match output với cột này |
| `created_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được tạo |
| `updated_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được cập nhật gần nhất |
| `deleted_at` | TIMESTAMP | Nullable | Thời điểm bản ghi bị xoá mềm (soft delete) |

> **Categories Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `name` | VARCHAR(100) | Unique, Not Null | Tên danh mục (ví dụ: `FOOD`, `SIGHTSEEING`, `HOTEL`) |
| `parent_id` | UUID | Foreign Key → Categories, Nullable | Danh mục cha (dùng cho sub-category, ví dụ `CAFE` thuộc `FOOD`) |

> **Place Categories Table** *(bảng trung gian Many-to-Many)*

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `place_id` | UUID | Foreign Key → Places | Khoá ngoại trỏ tới bảng `Places` |
| `category_id` | UUID | Foreign Key → Categories | Khoá ngoại trỏ tới bảng `Categories` |

> **Price Types Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `code` | VARCHAR(20) | Unique, Not Null | Mã loại giá: `ADULT`, `STUDENT`, `CHILD` |
| `name` | NVARCHAR(100) | Not Null | Tên loại giá (ví dụ: `Người lớn`) |

> **Place Prices Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `place_id` | UUID | Foreign Key → Places | Khoá ngoại trỏ tới bảng `Places` |
| `price_type_id` | UUID | Foreign Key → Price Types | Khoá ngoại trỏ tới bảng `Price Types` |
| `price` | DECIMAL | Not Null | Giá vé / chi phí |
| `currency` | VARCHAR(5) | Default 'VND' | Loại tiền tệ |

> **Opening Hours Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `place_id` | UUID | Foreign Key → Places | Khoá ngoại trỏ tới bảng `Places` |
| `day_of_week` | SMALLINT | Not Null | Ngày trong tuần: `0` (CN) → `6` (Thứ 7) |
| `open_time` | TIME | Nullable | Giờ mở cửa |
| `close_time` | TIME | Nullable | Giờ đóng cửa |
| `is_closed` | BOOLEAN | Default FALSE | Nghỉ nguyên ngày hôm đó hay không |

> **Ratings Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `id` | UUID | Primary Key | Khoá chính tự sinh |
| `place_id` | UUID | Foreign Key → Places | Khoá ngoại trỏ tới bảng `Places` |
| `user_id` | UUID | Foreign Key → Users | Khoá ngoại trỏ tới bảng `Users` |
| `rating_point` | DECIMAL(2,1) | Not Null | Điểm đánh giá từ `1.0` đến `5.0` |
| `review_content` | TEXT | Nullable | Nội dung đánh giá |
| `created_at` | TIMESTAMP | Not Null | Thời điểm bản ghi được tạo |

> **Saved Places Table**

| Field | Type | Constraints | Mô tả |
|:--|:--|:--|:--|
| `user_id` | UUID | Foreign Key → Users, PK | Khoá ngoại trỏ tới bảng `Users` |
| `place_id` | UUID | Foreign Key → Places, PK | Khoá ngoại trỏ tới bảng `Places` |
| `saved_at` | TIMESTAMP | Not Null | Thời điểm lưu |