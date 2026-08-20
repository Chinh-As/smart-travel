/**
 * ai-proxy/server.js
 * ------------------------------------------------------------------
 * Proxy AI Vision cho tính năng "Nhận diện địa danh".
 *
 * Vì sao cần proxy?
 *   - API key của Anthropic KHÔNG được để lộ ở phía trình duyệt (frontend).
 *   - Proxy này chạy ở backend, giữ key trong biến môi trường ANTHROPIC_API_KEY,
 *     nhận request từ frontend rồi chuyển tiếp tới Anthropic và trả kết quả về.
 *
 * Đặc điểm:
 *   - KHÔNG cần cài thư viện ngoài (chạy bằng Node >= 18, dùng fetch sẵn có).
 *   - Tự xử lý CORS để frontend (Vite) gọi được.
 *
 * Cách chạy:
 *   1) Lấy API key tại https://console.anthropic.com
 *   2) Đặt biến môi trường rồi chạy:
 *        # macOS / Linux
 *        ANTHROPIC_API_KEY=sk-ant-... node server.js
 *        # Windows (PowerShell)
 *        $env:ANTHROPIC_API_KEY="sk-ant-..."; node server.js
 *   3) Trong frontend-web, tạo file .env:
 *        VITE_ANTHROPIC_PROXY_URL=http://localhost:8787/v1/messages
 *   4) Khởi động lại `npm run dev` của frontend.
 */

import http from 'node:http'

const PORT = process.env.PORT || 8787
const API_KEY = process.env.ANTHROPIC_API_KEY || ''
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

// Cho phép gọi từ origin của frontend. '*' cho tiện môi trường học tập/demo.
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(body)
}

const server = http.createServer((req, res) => {
  setCors(res)

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Healthcheck đơn giản
  if (req.method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      service: 'smart-travel ai-proxy',
      hasApiKey: Boolean(API_KEY),
    })
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!API_KEY) {
    sendJson(res, 500, {
      error: 'Thiếu ANTHROPIC_API_KEY. Hãy đặt biến môi trường trước khi chạy proxy.',
    })
    return
  }

  let raw = ''
  req.on('data', (chunk) => {
    raw += chunk
    // Chặn payload quá lớn (ảnh base64 lớn) — giới hạn ~12MB
    if (raw.length > 12 * 1024 * 1024) {
      req.destroy()
    }
  })

  req.on('end', async () => {
    let payload
    try {
      payload = JSON.parse(raw || '{}')
    } catch (_) {
      sendJson(res, 400, { error: 'Body không phải JSON hợp lệ.' })
      return
    }

    try {
      const upstream = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify(payload),
      })

      const text = await upstream.text()
      res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
      res.end(text)
    } catch (err) {
      console.error('[ai-proxy] Lỗi gọi Anthropic:', err)
      sendJson(res, 502, { error: 'Không gọi được Anthropic API.', detail: String(err) })
    }
  })
})

server.listen(PORT, () => {
  console.log(`\n  smart-travel AI proxy đang chạy: http://localhost:${PORT}`)
  console.log(`  Endpoint cho frontend: http://localhost:${PORT}/v1/messages`)
  console.log(`  ANTHROPIC_API_KEY: ${API_KEY ? 'da thiet lap [OK]' : 'CHUA thiet lap [LOI] (proxy se bao loi 500)'}\n`)
})
