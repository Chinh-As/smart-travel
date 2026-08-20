/**
 * landmarkEngine.js — Nhận diện địa danh (3 tầng, ưu tiên độ chính xác cao nhất)
 * ------------------------------------------------------------------------------
 * Thứ tự xử lý:
 *   (A) AI Vision  — nếu có proxy (VITE_ANTHROPIC_PROXY_URL). Đây là tầng chính
 *       cho độ chính xác cao: AI phân tích các DẤU HIỆU NỔI BẬT trong ảnh
 *       (kiến trúc, biển hiệu, tượng đài, cảnh quan...) để suy ra địa danh,
 *       đồng thời nhận gợi ý toạ độ GPS (nếu ảnh có) để tăng độ tin cậy.
 *   (B) EXIF GPS   — nếu ảnh có toạ độ, tìm địa điểm gần nhất trong dữ liệu.
 *   (C) So khớp hình ảnh — hạ ảnh thành "chữ ký màu" và so với ảnh các địa danh.
 *
 * Engine cục bộ (B, C) chạy hoàn toàn trong trình duyệt, KHÔNG cần API key,
 * và luôn là phương án dự phòng nếu AI không khả dụng hoặc lỗi.
 *
 * Cách bật AI: dựng ../ai-proxy rồi đặt VITE_ANTHROPIC_PROXY_URL trong .env.
 */

import { destinations } from '../data/mockData.js'

/* ─────────────────────────  Tiện ích chung  ───────────────────────── */

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Bỏ dấu tiếng Việt + chuẩn hoá để so khớp tên địa danh "mềm".
export function normalizeVi(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Haversine — khoảng cách giữa 2 toạ độ (km)
function haversineKm(a, b) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const la1 = a.lat * Math.PI / 180
  const la2 = b.lat * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/* ─────────────────────────  1) EXIF GPS  ──────────────────────────── */

// Đọc toạ độ GPS từ EXIF của ảnh JPEG. Trả về {lat, lng} hoặc null.
export async function readExifGps(file) {
  try {
    const buf = await file.arrayBuffer()
    const view = new DataView(buf)
    if (view.getUint16(0) !== 0xFFD8) return null // không phải JPEG

    let offset = 2
    const len = view.byteLength
    while (offset < len) {
      if (view.getUint16(offset) === 0xFFE1) {
        return parseExifApp1(view, offset + 4)
      }
      if ((view.getUint16(offset) & 0xFF00) !== 0xFF00) break
      offset += 2 + view.getUint16(offset + 2)
    }
  } catch (_) { /* bỏ qua */ }
  return null
}

function parseExifApp1(view, start) {
  // "Exif\0\0"
  if (view.getUint32(start) !== 0x45786966) return null
  const tiff = start + 6
  const little = view.getUint16(tiff) === 0x4949
  const get16 = (o) => view.getUint16(o, little)
  const get32 = (o) => view.getUint32(o, little)

  if (get16(tiff + 2) !== 0x002A) return null
  const ifd0 = tiff + get32(tiff + 4)

  // Tìm con trỏ GPS IFD (tag 0x8825) trong IFD0
  const n0 = get16(ifd0)
  let gpsPtr = 0
  for (let i = 0; i < n0; i++) {
    const e = ifd0 + 2 + i * 12
    if (get16(e) === 0x8825) { gpsPtr = tiff + get32(e + 8); break }
  }
  if (!gpsPtr) return null

  const nG = get16(gpsPtr)
  let latRef, lngRef, lat, lng
  const readRationals = (entryOff, count) => {
    const valOff = tiff + get32(entryOff + 8)
    const out = []
    for (let i = 0; i < count; i++) {
      const num = get32(valOff + i * 8)
      const den = get32(valOff + i * 8 + 4) || 1
      out.push(num / den)
    }
    return out
  }
  for (let i = 0; i < nG; i++) {
    const e = gpsPtr + 2 + i * 12
    const tag = get16(e)
    if (tag === 0x0001) latRef = String.fromCharCode(view.getUint8(e + 8))
    else if (tag === 0x0003) lngRef = String.fromCharCode(view.getUint8(e + 8))
    else if (tag === 0x0002) lat = readRationals(e, 3)
    else if (tag === 0x0004) lng = readRationals(e, 3)
  }
  if (!lat || !lng) return null

  const toDeg = (dms) => dms[0] + dms[1] / 60 + dms[2] / 3600
  let latD = toDeg(lat)
  let lngD = toDeg(lng)
  if (latRef === 'S') latD = -latD
  if (lngRef === 'W') lngD = -lngD
  if (!isFinite(latD) || !isFinite(lngD)) return null
  return { lat: latD, lng: lngD }
}

function nearestDestByCoords(coords, maxKm = Infinity) {
  let nearest = null
  for (const d of destinations) {
    if (typeof d.lat !== 'number' || typeof d.lng !== 'number') continue
    const km = haversineKm(coords, d)
    if (!nearest || km < nearest.km) nearest = { dest: d, km }
  }
  if (nearest && nearest.km <= maxKm) return nearest
  return null
}

/* ─────────────────────  2) So khớp hình ảnh  ──────────────────────── */

const GRID = 8

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const timer = setTimeout(() => reject(new Error('timeout')), 6000)
    img.onload = () => { clearTimeout(timer); resolve(img) }
    img.onerror = () => { clearTimeout(timer); reject(new Error('load error')) }
    img.src = src
  })
}

function signatureFromImage(img) {
  const canvas = document.createElement('canvas')
  canvas.width = GRID
  canvas.height = GRID
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, GRID, GRID)
  const { data } = ctx.getImageData(0, 0, GRID, GRID)
  const sig = new Float32Array(GRID * GRID * 3)
  for (let i = 0; i < GRID * GRID; i++) {
    sig[i * 3] = data[i * 4]
    sig[i * 3 + 1] = data[i * 4 + 1]
    sig[i * 3 + 2] = data[i * 4 + 2]
  }
  return sig
}

export async function buildSignature(src) {
  const img = await loadImage(src)
  return signatureFromImage(img)
}

function signatureDistance(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum / a.length) / 255
}

const sigCache = new Map()
const visualPool = destinations.filter(d => d.featured)

async function matchByImage(uploadedSig) {
  let best = null
  await Promise.all(visualPool.map(async (d) => {
    try {
      let sig = sigCache.get(d.id)
      if (!sig) { sig = await buildSignature(d.image); sigCache.set(d.id, sig) }
      const dist = signatureDistance(uploadedSig, sig)
      if (!best || dist < best.dist) best = { dest: d, dist }
    } catch (_) { /* ảnh lỗi CORS -> bỏ qua */ }
  }))
  return best
}

/* ──────────────────────  Tầng AI Vision  ──────────────────────────── */

function getProxyUrl() {
  try { return import.meta.env?.VITE_ANTHROPIC_PROXY_URL || '' } catch (_) { return '' }
}

export function isAiEnabled() {
  return Boolean(getProxyUrl())
}

// Thu nhỏ ảnh trước khi gửi AI để tiết kiệm băng thông & token (cạnh dài tối đa 1024px).
async function downscaleForAi(dataUrl, maxSide = 1024, quality = 0.85) {
  try {
    const img = await loadImage(dataUrl)
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    if (scale >= 1) {
      // Ảnh đã nhỏ — vẫn ép về JPEG để chuẩn hoá media type
      const w = img.width, h = img.height
      const c = document.createElement('canvas'); c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      return c.toDataURL('image/jpeg', quality)
    }
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const c = document.createElement('canvas'); c.width = w; c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    return c.toDataURL('image/jpeg', quality)
  } catch (_) {
    return dataUrl // fallback: dùng ảnh gốc
  }
}

const AI_SYSTEM_PROMPT = [
  'Bạn là chuyên gia nhận diện địa danh và điểm du lịch, am hiểu sâu Việt Nam.',
  'Nhiệm vụ: nhìn ảnh, xác định ĐỊA DANH/ĐIỂM ĐẾN cụ thể trong ảnh.',
  'Hãy phân tích các DẤU HIỆU NỔI BẬT để suy luận: kiến trúc đặc trưng, biển hiệu/chữ viết,',
  'tượng đài, logo, màu sắc công trình, cảnh quan thiên nhiên, bố cục xung quanh.',
  'Nếu ảnh có gợi ý toạ độ GPS, hãy ưu tiên các địa danh nằm gần toạ độ đó.',
  'CHỈ trả về JSON hợp lệ, không kèm giải thích, không markdown, theo đúng schema:',
  '{',
  '  "found": boolean,                       // có nhận ra địa danh cụ thể không',
  '  "name": string,                          // tên địa danh (tiếng Việt nếu có)',
  '  "city": string,                          // tỉnh/thành phố',
  '  "address": string,                       // địa chỉ/khu vực nếu suy được, có thể rỗng',
  '  "country": string,                       // quốc gia',
  '  "category": string,                      // loại: di tích, bảo tàng, biển, chợ, toà nhà...',
  '  "confidence": "high" | "medium" | "low",// mức độ chắc chắn',
  '  "cues": string[],                        // 2-5 dấu hiệu nổi bật đã dùng để nhận diện',
  '  "alternatives": [ {"name": string, "city": string} ],// 0-3 khả năng khác (nếu phân vân)',
  '  "description": string                    // 1-2 câu mô tả ngắn về địa danh',
  '}',
  'Nếu không đủ cơ sở để xác định, đặt found=false và vẫn liệt kê "cues" quan sát được.',
].join(' ')

async function recognizeWithProxy(proxyUrl, base64, mimeType, gps) {
  const hintText = gps
    ? `Ảnh có gợi ý toạ độ GPS: lat=${gps.lat.toFixed(5)}, lng=${gps.lng.toFixed(5)}. Hãy ưu tiên địa danh gần toạ độ này.`
    : 'Ảnh không kèm toạ độ GPS. Hãy dựa hoàn toàn vào dấu hiệu hình ảnh.'

  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: AI_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: `Nhận diện địa danh trong ảnh. ${hintText} Trả về đúng JSON theo schema.` },
        ],
      }],
    }),
  })
  if (!res.ok) throw new Error('proxy error ' + res.status)
  const data = await res.json()
  const text = data.content?.find(b => b.type === 'text')?.text || '{}'
  const cleaned = text.replace(/```json|```/g, '').trim()
  // Cắt lấy khối JSON nếu model lỡ thêm chữ thừa
  const s = cleaned.indexOf('{'); const e = cleaned.lastIndexOf('}')
  const jsonStr = (s !== -1 && e !== -1) ? cleaned.slice(s, e + 1) : cleaned
  return JSON.parse(jsonStr)
}

// Đối chiếu tên AI trả về với dữ liệu địa điểm (so khớp mềm, có cân nhắc GPS).
function matchAiToDest(ai, gps) {
  if (!ai?.found || !ai?.name) return null
  const target = normalizeVi(ai.name)
  const targetCity = normalizeVi(ai.city || '')
  const targetTokens = target.split(' ').filter(t => t.length >= 3)

  let best = null
  for (const d of destinations) {
    const title = normalizeVi(d.title)
    const city = normalizeVi(d.city || '')
    let score = 0

    if (title === target) score += 100
    else if (title.includes(target) || target.includes(title)) score += 70
    else {
      const titleTokens = title.split(' ')
      const overlap = targetTokens.filter(t => titleTokens.includes(t)).length
      if (overlap) score += overlap * 18
    }

    if (targetCity && city && (city.includes(targetCity) || targetCity.includes(city))) score += 15

    // Nếu có GPS, cộng điểm cho địa điểm ở gần
    if (gps && typeof d.lat === 'number') {
      const km = haversineKm(gps, d)
      if (km < 2) score += 25
      else if (km < 15) score += 12
      else if (km < 60) score += 4
    }

    if (score > 0 && (!best || score > best.score)) best = { dest: d, score }
  }
  // Ngưỡng tối thiểu để coi là khớp đáng tin
  return best && best.score >= 30 ? best.dest : null
}

function normalizeAiInfo(ai) {
  return {
    name: ai.name || 'Địa danh chưa rõ tên',
    city: ai.city || '',
    address: ai.address || '',
    country: ai.country || '',
    category: ai.category || '',
    description: ai.description || '',
    cues: Array.isArray(ai.cues) ? ai.cues.filter(Boolean).slice(0, 5) : [],
    alternatives: Array.isArray(ai.alternatives)
      ? ai.alternatives.filter(a => a && a.name).slice(0, 3)
      : [],
  }
}

/* ─────────────────────  Hàm điều phối chính  ──────────────────────── */

// API Base URL cho recommendation service (FastAPI)
function getApiBaseUrl() {
  try { return import.meta.env?.VITE_RECOMMENDATION_API_URL || 'http://localhost:5000' } catch (_) { return 'http://localhost:5000' }
}

/**
 * recognizeLandmark(file) → {
 *   found, method: 'ai'|'gps'|'visual'|'none',
 *   confidence: 'high'|'medium'|'low',
 *   dest,            // địa điểm khớp trong dữ liệu (hoặc null)
 *   aiInfo,          // {name, city, address, country, category, description, cues[], alternatives[]}
 *   distanceKm,      // khoảng cách GPS (nếu có)
 *   score            // độ giống hình ảnh 0..100 (nếu dùng so khớp ảnh)
 * }
 */
export async function recognizeLandmark(file) {
  const dataUrl = await fileToDataUrl(file)

  // Đọc GPS sớm để vừa gửi lên API, vừa dùng cho fallback.
  const gps = await readExifGps(file)

  // (A) Gọi API FastAPI /landmarks/recognize — tầng chính
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (gps) {
      formData.append('lat', gps.lat.toString())
      formData.append('lng', gps.lng.toString())
    }

    const apiUrl = getApiBaseUrl()
    const response = await fetch(`${apiUrl}/landmarks/recognize`, {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()

      // Map API dest format to frontend dest format
      if (data.dest) {
        // Map backend properties (name, address, main_image_url, description) to frontend format
        data.dest.title = data.dest.name;
        data.dest.location = data.dest.address;
        data.dest.image = data.dest.main_image_url;
        data.dest.overview = data.dest.description;

        // Tìm trong danh sách destinations cục bộ để bổ sung thông tin khác nếu có
        const localDest = matchAiToDest(data.aiInfo, gps)
        if (localDest) {
          data.dest = { ...localDest, ...data.dest }
        }
      }

      return data
    }
    console.warn('[landmarkEngine] API trả về lỗi, dùng engine cục bộ:', response.status)
  } catch (err) {
    console.warn('[landmarkEngine] API lỗi, dùng engine cục bộ:', err)
  }

  // (B) Fallback: AI Vision qua proxy Anthropic (nếu có cấu hình)
  const proxyUrl = getProxyUrl()
  if (proxyUrl) {
    try {
      const mimeType = 'image/jpeg'
      const aiDataUrl = await downscaleForAi(dataUrl)
      const aiBase64 = aiDataUrl.split(',')[1]
      const ai = await recognizeWithProxy(proxyUrl, aiBase64, mimeType, gps)
      const aiInfo = normalizeAiInfo(ai)

      if (ai?.found) {
        const dest = matchAiToDest(ai, gps)
        const result = {
          found: true,
          method: 'ai',
          confidence: ai.confidence || 'medium',
          dest,
          aiInfo,
        }
        if (gps && dest && typeof dest.lat === 'number') {
          result.distanceKm = haversineKm(gps, dest)
        }
        return result
      }
      const fallback = await localRecognize(dataUrl, gps)
      if (fallback.found) return { ...fallback, aiInfo }
      return { found: false, method: 'none', aiInfo }
    } catch (err) {
      console.warn('[landmarkEngine] AI proxy lỗi, dùng engine cục bộ:', err)
    }
  }

  // (C) Engine cục bộ: GPS rồi tới so khớp hình ảnh
  return localRecognize(dataUrl, gps)
}

// Engine cục bộ: GPS rồi tới so khớp hình ảnh.
async function localRecognize(dataUrl, gps) {
  // (B) EXIF GPS
  if (gps) {
    const nearest = nearestDestByCoords(gps)
    if (nearest && nearest.km < 80) {
      const km = nearest.km
      const confidence = km < 2 ? 'high' : km < 30 ? 'medium' : 'low'
      return { found: true, method: 'gps', confidence, dest: nearest.dest, distanceKm: km }
    }
  }

  // (C) So khớp hình ảnh
  try {
    const uploadedSig = await buildSignature(dataUrl)
    const best = await matchByImage(uploadedSig)
    if (best && best.dist < 0.42) {
      const score = Math.max(0, Math.round((1 - best.dist / 0.55) * 100))
      const confidence = best.dist < 0.18 ? 'high' : best.dist < 0.30 ? 'medium' : 'low'
      return { found: true, method: 'visual', confidence, dest: best.dest, score }
    }
  } catch (_) { /* bỏ qua */ }

  return { found: false, method: 'none' }
}

