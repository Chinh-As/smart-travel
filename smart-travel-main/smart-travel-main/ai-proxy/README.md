# AI Proxy — Nhận diện địa danh bằng AI Vision

Proxy nhỏ gọn (không cần thư viện ngoài) giúp tính năng **Nhận diện địa danh** gọi được AI Vision của Anthropic mà **không lộ API key** ra phía trình duyệt.

## Vì sao cần proxy?

API key không bao giờ được đặt trong code frontend (ai cũng xem được). Proxy chạy ở backend, giữ key trong biến môi trường và chuyển tiếp yêu cầu tới Anthropic giúp bạn.

> Không bắt buộc: nếu không chạy proxy, tính năng vẫn hoạt động ở chế độ **engine cục bộ** (đọc GPS trong ảnh + so khớp hình ảnh). Bật proxy để có độ chính xác cao nhất bằng AI.

## Các bước chạy

1. **Lấy API key** tại <https://console.anthropic.com>.

2. **Khởi động proxy** (yêu cầu Node >= 18):

   ```bash
   cd ai-proxy

   # macOS / Linux
   ANTHROPIC_API_KEY=sk-ant-xxxxx npm start

   # Windows (PowerShell)
   $env:ANTHROPIC_API_KEY="sk-ant-xxxxx"; npm start
   ```

   Proxy mặc định chạy ở `http://localhost:8787`.

3. **Cấu hình frontend** — tạo file `frontend-web/.env` (có thể copy từ `.env.example`):

   ```
   VITE_ANTHROPIC_PROXY_URL=http://localhost:8787/v1/messages
   ```

4. **Khởi động lại** frontend:

   ```bash
   cd ../frontend-web
   npm run dev
   ```

Khi mở trang **Nhận diện địa danh**, nếu proxy hoạt động bạn sẽ thấy huy hiệu “Nhận diện bằng AI Vision”.

## Biến môi trường

| Biến                | Bắt buộc | Mặc định | Ý nghĩa                                    |
| ------------------- | -------- | -------- | ------------------------------------------ |
| `ANTHROPIC_API_KEY` | ✅        | —        | API key Anthropic.                         |
| `PORT`              | ❌        | `8787`   | Cổng chạy proxy.                           |
| `ALLOW_ORIGIN`      | ❌        | `*`      | Origin được phép gọi (CORS).               |

## Kiểm tra nhanh

```bash
curl http://localhost:8787
# => {"ok":true,"service":"smart-travel ai-proxy","hasApiKey":true}
```
