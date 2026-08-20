# Refactor Frontend Smart Travel — Kế hoạch triển khai

Chuyển từ mock data sang API thật, redesign lịch trình theo mốc thời gian, responsive đồng bộ.

---

## Hiện trạng backend (sau nghiên cứu)

> [!WARNING]
> **Backend đang ở giai đoạn rất sớm.** Sau khi đọc toàn bộ 21 file Java:
> - **Chỉ có 1 entity `Place`** — CHƯA có entity `Itinerary`, `ItineraryItem`, `User` profile, `Review`
> - `PlaceController.search()` là **stub trống** — return `List.of()`
> - `RecommendationClient.getScores()` là **stub** — return empty map
> - `PlaceService.findByFilter()` chỉ gọi `findAll()` — chưa filter thật
> - Security **mở hết** (all requests permitted, CSRF disabled)
> - Chỉ có 2 endpoints: `GET /api/v1/places/search` (stub) + `POST /api/v1/recommendation` (gọi stub)

**→ Frontend cần thiết kế "API-ready" nhưng vẫn chạy được với mock fallback cho tới khi backend hoàn thiện.**

---

## User Review Required

> [!IMPORTANT]
> **Chiến lược tiếp cận**: Do backend chưa sẵn sàng, tôi đề xuất dùng **"dual mode"** — Frontend có thể chuyển qua lại giữa mock data và API thật bằng biến môi trường `VITE_USE_API=true/false`. Điều này cho phép:
> - Frontend dev song song với backend mà không bị block
> - Khi backend hoàn thành endpoint nào → bật API cho endpoint đó
> - Không cần xóa mock data cho tới khi 100% API sẵn sàng

> [!IMPORTANT]
> **RecommendationRequest** hiện tại backend dùng cấu trúc polymorphic phức tạp (location type COORDINATES vs CITY, nested constraints object). Frontend cần map đúng format này. Có muốn đơn giản hóa phía backend không, hay frontend sẽ adapt theo?

## Open Questions

> [!IMPORTANT]
> 1. **Backend Itinerary**: Backend CHƯA có entity/endpoint cho Itinerary. Ai sẽ làm phần này? Plan có cần include thiết kế entity cho backend luôn không?
> 2. **API URL**: Backend chạy ở `localhost:8080` — có muốn config qua `.env` không?
> 3. **Auth flow**: Security hiện mở hết. Khi nào cần gắn JWT/auth?
> 4. **AI Generate**: Có muốn `POST /itineraries/generate` gọi recommendation-service Python (hiện cũng stub), hay frontend tạm tự handle rồi chỉ lưu kết quả lên backend?

---

## Proposed Changes

### Component 1: API Service Layer (chạy cả 2 mode)

#### [NEW] `src/services/api.js` — HTTP client chung

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const USE_API  = import.meta.env.VITE_USE_API === 'true'

// Centralized fetch wrapper với auth + error handling
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw { status: res.status, ...err }
  }
  return res.json()
}

export const api = {
  get:    (url, params) => request(url + toQueryString(params)),
  post:   (url, body)   => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put:    (url, body)   => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url)         => request(url, { method: 'DELETE' }),
}
export { USE_API }
```

---

#### [NEW] `src/services/placeService.js` — Dual mode cho Places

```javascript
import { api, USE_API } from './api'
import { destinations } from '../data/mockData'  // fallback

export const placeService = {
  // Tìm kiếm địa điểm
  async search(params) {
    if (!USE_API) return mockSearch(params)  // fallback mock
    
    // Map frontend params → backend RecommendationRequest format
    return api.post('/recommendation', {
      location: params.lat ? {
        type: 'COORDINATES',
        lat: params.lat,
        lng: params.lng,
      } : {
        type: 'CITY',
        city_id: params.cityId,
      },
      constraints: {
        budget: params.maxPrice ? { amount: params.maxPrice, currency: 'VND' } : null,
        needs_wheelchair: params.wheelchair || false,
        radius_km: params.radius || 5.0,
        main_category: mapToMainCategory(params.categories),
        sub_category_id: params.subCategoryId,
      },
      prompt_text: params.q || params.description || '',
    })
  },
  
  // Chi tiết 1 place
  async getById(id) {
    if (!USE_API) return destinations.find(d => d.id === id)
    return api.get(`/places/${id}`)
  },

  // Danh sách nổi bật (trang chủ)
  async getFeatured() {
    if (!USE_API) return destinations.filter(d => d.featured)
    return api.get('/places/featured')
  },

  // Autocomplete tìm kiếm
  async autocomplete(query) {
    if (!USE_API) return mockAutocomplete(query)
    return api.get('/places/search', { keyword: query })
  },
}
```

**Bảng mapping Frontend → Backend (POST /recommendation):**

| Frontend param | Backend field | Ghi chú |
|---------------|--------------|---------|
| `lat`, `lng` | `location.lat`, `location.lng` | type = "COORDINATES" |
| `cityId` | `location.city_id` | type = "CITY", UUID |
| `maxPrice` | `constraints.budget.amount` | currency = "VND" |
| `wheelchair` | `constraints.needs_wheelchair` | boolean |
| `radius` | `constraints.radius_km` | bắt buộc khi dùng COORDINATES |
| `categories[0]` | `constraints.main_category` | enum: TRAVEL, ACCOMMODATION, ENTERTAINMENT, SHOPPING |
| `subCategoryId` | `constraints.sub_category_id` | UUID |
| `description` | `prompt_text` | Free-text NLP, backend extract tags |

> [!CAUTION]
> Backend dùng `UUID` cho place ID, nhưng mock data hiện dùng `integer`. Khi chuyển sang API thật cần đổi type ID toàn bộ frontend.

---

#### [NEW] `src/services/itineraryService.js` — API cho lịch trình

> Backend **CHƯA** có endpoints này. File này sẽ dùng mock mode trước, switch sang API khi backend sẵn sàng.

```javascript
import { api, USE_API } from './api'

export const itineraryService = {
  // Lấy danh sách lịch trình của user
  async getAll() {
    if (!USE_API) return loadFromLocalStorage()
    return api.get('/itineraries')
  },

  // Tạo lịch trình mới
  async create(data) {
    if (!USE_API) return saveToLocalStorage(data)
    return api.post('/itineraries', data)
  },

  // Chi tiết 1 lịch trình (items grouped by day + timeSlot)
  async getById(id) {
    if (!USE_API) return loadItineraryFromStorage(id)
    return api.get(`/itineraries/${id}`)
  },

  // Thêm địa điểm vào lịch trình
  async addItem(itineraryId, item) {
    // item = { placeId, day, timeSlot, startTime, endTime, note }
    if (!USE_API) return addItemToStorage(itineraryId, item)
    return api.post(`/itineraries/${itineraryId}/items`, item)
  },

  // Cập nhật item (đổi slot, note, giờ)
  async updateItem(itineraryId, itemId, data) {
    if (!USE_API) return updateItemInStorage(itineraryId, itemId, data)
    return api.put(`/itineraries/${itineraryId}/items/${itemId}`, data)
  },

  // Xóa item
  async removeItem(itineraryId, itemId) {
    if (!USE_API) return removeItemFromStorage(itineraryId, itemId)
    return api.delete(`/itineraries/${itineraryId}/items/${itemId}`)
  },

  // AI generate lịch trình
  async generate(params) {
    if (!USE_API) return mockGenerateItinerary(params)
    return api.post('/itineraries/generate', params)
  },
}
```

**Khi mock mode (`USE_API=false`)**: Dùng **localStorage** thay vì React state thuần → data persist qua reload. Đây là upgrade lớn so với hiện tại.

---

#### [NEW] `src/hooks/useDebounce.js` — Debounce cho autocomplete

```javascript
import { useState, useEffect } from 'react'
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
```

---

### Component 2: Refactor TripContext

#### [MODIFY] [TripContext.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/context/TripContext.jsx)

**Thay đổi chính:**

```diff
- import { destinations } from '../data/mockData.js'
+ import { itineraryService } from '../services/itineraryService.js'

  // State mới
+ const [activeItinerary, setActiveItinerary] = useState(null)
+ const [loading, setLoading] = useState(false)
+ const [error, setError] = useState(null)

+ // Load itinerary từ API/localStorage khi mount
+ useEffect(() => {
+   itineraryService.getAll().then(list => {
+     if (list.length > 0) {
+       setActiveItinerary(list[0])
+       setItinerary(list[0].items || [])
+     }
+   })
+ }, [])

  // addToItinerary → gọi API
- const addToItinerary = useCallback((dest) => {
-   setItinerary(prev => {
-     if (prev.find(d => d.id === dest.id)) return prev
-     return [...prev, { ...dest, addedAt: new Date().toISOString(), note: '' }]
-   })
- }, [])
+ const addToItinerary = useCallback(async (place, timeSlot = 'MORNING', day = 1) => {
+   setLoading(true)
+   try {
+     let itinId = activeItinerary?.id
+     if (!itinId) {
+       const newItin = await itineraryService.create({ title: 'Lịch trình mới', numberOfDays: 1 })
+       setActiveItinerary(newItin)
+       itinId = newItin.id
+     }
+     const item = await itineraryService.addItem(itinId, {
+       placeId: place.id, day, timeSlot,
+       startTime: getDefaultStartTime(timeSlot),
+       endTime: getDefaultEndTime(timeSlot),
+     })
+     setItinerary(prev => [...prev, item])
+   } catch (err) { setError(err) }
+   finally { setLoading(false) }
+ }, [activeItinerary])
```

**Export thêm**: `activeItinerary`, `loading`, `error`, `createItinerary`, `fetchItineraries`

---

### Component 3: Redesign Itinerary — Timeline Sáng/Trưa/Chiều/Tối

#### [MODIFY] [Itinerary.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/pages/Itinerary/Itinerary.jsx)

**Cấu trúc hiển thị mới:**

```
📅 Ngày 1 — 01/06/2026
│
├── 🌅 SÁNG (06:00 - 11:00)  ──────────────────────
│   │ 08:00-10:30 │ 📍 Nhà Thờ Đức Bà │ Miễn phí  │
│   │ 10:30-11:00 │ ☕ Cà phê Trứng    │ 40.000đ   │
│
├── 🌞 TRƯA (11:00 - 13:00)  ──────────────────────
│   │ 11:30-13:00 │ 🍜 Phở Bát Đàn     │ 70.000đ   │
│
├── 🌤️ CHIỀU (13:00 - 17:00)  ─────────────────────
│   │ 14:00-16:00 │ 🏛️ Bảo tàng        │ 40.000đ   │
│   │        ╌╌╌ + Thêm điểm ╌╌╌                    │
│
└── 🌙 TỐI (17:00 - 22:00)  ───────────────────────
    │ 18:00-20:00 │ 🎉 Phố Bùi Viện    │ Miễn phí  │
```

**Time slots constants:**
```javascript
export const TIME_SLOTS = [
  { id: 'MORNING',   label: 'Sáng',   icon: '🌅', range: '06:00 - 11:00', color: '#FF9800', defaultStart: '08:00', defaultEnd: '10:30' },
  { id: 'NOON',      label: 'Trưa',   icon: '🌞', range: '11:00 - 13:00', color: '#FFC107', defaultStart: '11:30', defaultEnd: '13:00' },
  { id: 'AFTERNOON', label: 'Chiều',   icon: '🌤️', range: '13:00 - 17:00', color: '#29B6F6', defaultStart: '14:00', defaultEnd: '16:30' },
  { id: 'EVENING',   label: 'Tối',    icon: '🌙', range: '17:00 - 22:00', color: '#7C4DFF', defaultStart: '18:00', defaultEnd: '20:00' },
]
```

**Thay đổi code chính:**

```diff
- import { destinations } from '../../data/mockData.js'
+ import { itineraryService } from '../../services/itineraryService.js'
+ import { TIME_SLOTS } from '../../constants/timeSlots.js'

- // Xóa hàm generateFromPrompt() (dòng 11-27)
- function generateFromPrompt(prompt, list) { ... }

+ // AI generate gọi API thật
  const handleGenerateAI = async () => {
    setGenerating(true)
    setAiList([])
-   setTimeout(() => {
-     const result = generateFromPrompt(aiPrompt, destinations)
-     setAiList(result)
-     setGenerating(false)
-   }, 1500)
+   try {
+     const result = await itineraryService.generate({
+       description: aiPrompt,
+       city: 'Hồ Chí Minh',  // hoặc từ context
+       numberOfDays: 2,
+     })
+     setAiList(result.days || [])
+   } catch (err) { setError(err.message) }
+   finally { setGenerating(false) }
  }
```

**JSX mới — Timeline rendering:**
```jsx
{/* Render từng ngày */}
{days.map(day => (
  <div key={day.dayNumber} className="itin__day">
    <div className="itin__day-header">
      <span className="itin__day-badge">📅 Ngày {day.dayNumber}</span>
      {day.date && <span className="itin__day-date">{formatDate(day.date)}</span>}
      <span className="itin__day-count">{countItems(day)} điểm</span>
    </div>

    {/* Render từng slot trong ngày */}
    {TIME_SLOTS.map(slot => {
      const items = (day.slots?.[slot.id]) || []
      return (
        <div key={slot.id} className="itin__slot">
          <div className="itin__slot-header" style={{ borderLeftColor: slot.color }}>
            <span className="itin__slot-icon">{slot.icon}</span>
            <span className="itin__slot-label">{slot.label}</span>
            <span className="itin__slot-range">{slot.range}</span>
            <span className="itin__slot-count">{items.length} điểm</span>
          </div>

          <div className="itin__slot-timeline">
            {items.length > 0 ? items.map((item, idx) => (
              <div key={item.itemId} className="itin__item fade-in-up"
                   style={{ animationDelay: `${idx * 60}ms` }}>
                {/* ...card content giữ nguyên, thêm startTime-endTime... */}
              </div>
            )) : (
              <div className="itin__slot-empty">
                <button onClick={() => openAddModal(day.dayNumber, slot.id)}>
                  + Thêm địa điểm buổi {slot.label.toLowerCase()}
                </button>
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
))}
```

#### [MODIFY] [Itinerary.css](file:///c:/Frontend/smart-travel/frontend-web/src/pages/Itinerary/Itinerary.css)

Thêm styles cho timeline + responsive đồng bộ:

```css
/* ── Time Slot Header ── */
.itin__slot { margin-bottom: clamp(12px, 2vw, 20px); }

.itin__slot-header {
  display: flex; align-items: center; gap: clamp(6px, 1vw, 10px);
  padding: clamp(6px, 1vw, 10px) clamp(12px, 2vw, 18px);
  border-left: 4px solid;
  background: rgba(0,0,0,0.02);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  transition: background var(--t-fast);
}
.itin__slot-header:hover { background: rgba(0,0,0,0.04); }
.itin__slot-icon  { font-size: clamp(16px, 2vw, 22px); }
.itin__slot-label { font-size: clamp(13px, 1.3vw, 15px); font-weight: 700; color: var(--text-h); }
.itin__slot-range { font-size: clamp(11px, 1vw, 13px); color: var(--text-muted); font-weight: 400; }
.itin__slot-count { margin-left: auto; font-size: 11px; color: var(--text-muted);
  background: var(--bg-soft); padding: 2px 10px; border-radius: var(--r-full); }

/* ── Timeline connector ── */
.itin__slot-timeline {
  padding-left: clamp(20px, 3vw, 36px);
  border-left: 2px dashed var(--border);
  margin-left: clamp(14px, 2vw, 22px);
  display: flex; flex-direction: column; gap: clamp(8px, 1.5vw, 14px);
  padding-top: 10px; padding-bottom: 10px;
}

/* ── Empty slot placeholder ── */
.itin__slot-empty {
  padding: clamp(10px, 1.5vw, 14px);
  border: 2px dashed var(--border-light);
  border-radius: var(--r-md);
  text-align: center;
}
.itin__slot-empty button {
  font-size: 13px; color: var(--text-muted); font-weight: 600;
  cursor: pointer; transition: color var(--t-fast);
}
.itin__slot-empty button:hover { color: var(--green-dark); }

/* ── Day date label ── */
.itin__day-date {
  font-size: 12px; color: var(--text-muted); font-weight: 400;
}
```

---

### Component 4: Responsive — Đồng bộ breakpoints

#### [MODIFY] [Itinerary.css](file:///c:/Frontend/smart-travel/frontend-web/src/pages/Itinerary/Itinerary.css)

Thay thế 2 breakpoint hiện tại (800px, 520px) bằng 4 breakpoint đồng bộ với hệ thống:

```css
/* ========== RESPONSIVE — đồng bộ với Home + Global ========== */

/* Tablet landscape */
@media (max-width: 1024px) {
  .itin__layout { grid-template-columns: clamp(150px, 18%, 200px) 1fr; gap: 14px; }
  .itin__item-actions { gap: 4px; }
  .itin__action-btn { padding: 4px 8px; font-size: 10px; }
}

/* Tablet portrait — sidebar → horizontal nav */
@media (max-width: 900px) {
  .itin__layout { grid-template-columns: 1fr; }
  .itin__side {
    position: static;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 4px;
    padding: 10px;
    -webkit-overflow-scrolling: touch;
  }
  .itin__side-link {
    flex: 0 0 auto;
    min-width: auto;
    text-align: center;
    font-size: 12px;
    padding: 8px 14px;
    white-space: nowrap;
  }
  /* AI chips horizontal scroll */
  .itin__ai-chips { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
  .itin__ai-chip { flex-shrink: 0; }
}

/* Mobile landscape */
@media (max-width: 768px) {
  .itin { padding: clamp(10px, 2vw, 16px) 0; }
  
  /* Item card → stack vertical */
  .itin__item { flex-direction: column; }
  .itin__item-img { width: 100%; height: clamp(120px, 25vw, 160px); }
  .itin__item-head { flex-direction: column; gap: 8px; }
  .itin__item-actions { flex-direction: row; flex-wrap: wrap; width: 100%; }
  
  /* Slot header compact */
  .itin__slot-header { flex-wrap: wrap; }
  .itin__slot-range { display: none; }  /* ẩn range text, chỉ giữ icon + label */
  
  /* Timeline: reduce indent */
  .itin__slot-timeline { padding-left: 20px; margin-left: 12px; }
}

/* Mobile portrait */
@media (max-width: 520px) {
  /* Tabs → stack vertical */
  .itin__tabs { flex-direction: column; }
  .itin__tab { text-align: center; padding: 10px; }
  
  /* Sidebar: 2 items/row */
  .itin__side { flex-wrap: wrap; }
  .itin__side-link { flex: 1 1 calc(50% - 4px); font-size: 11px; padding: 8px; }
  
  /* Action buttons: full width stack */
  .itin__action-btn { width: 100%; justify-content: center; }
  
  /* AI section compact */
  .itin__ai-section { padding: 10px; gap: 10px; }
  .itin__ai-prompt { font-size: 13px; }
  .itin__ai-title { font-size: 14px; }
  
  /* Timeline: minimal indent */
  .itin__slot-timeline { padding-left: 14px; margin-left: 8px; }
  .itin__slot-header { padding: 6px 10px; }
}
```

---

### Component 5: Refactor các trang dùng mock data

#### [MODIFY] [Home.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/pages/Home/Home.jsx)

```diff
- import { destinations, popularSearches } from '../../data/mockData.js'
+ import { placeService } from '../../services/placeService.js'
+ import { popularSearches } from '../../data/staticData.js'  // giữ static, không cần API

- const featured = destinations.filter((d) => d.featured)
+ const [featured, setFeatured] = useState([])
+ const [loading, setLoading] = useState(true)
+ useEffect(() => {
+   placeService.getFeatured().then(setFeatured).finally(() => setLoading(false))
+ }, [])
```

#### [MODIFY] [Destination.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/pages/Destination/Destination.jsx)

```diff
- import { destinations } from '../../data/mockData.js'
+ import { placeService } from '../../services/placeService.js'

- const dest = destinations.find(d => d.id === parseInt(id))
+ const [dest, setDest] = useState(null)
+ const [loading, setLoading] = useState(true)
+ useEffect(() => {
+   placeService.getById(id).then(setDest).finally(() => setLoading(false))
+ }, [id])
```

#### [MODIFY] [AISearch.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/pages/AISearch/AISearch.jsx)

```diff
- import { destinations, locationSuggestions } from '../../data/mockData.js'
+ import { placeService } from '../../services/placeService.js'
+ import { useDebounce } from '../../hooks/useDebounce.js'

- // Xóa hàm smartFilter() (dòng 40-114)
- // Xóa hàm norm() (dòng 28-37)

+ const debouncedDest = useDebounce(destQuery, 300)
+ useEffect(() => {
+   if (!debouncedDest) return
+   placeService.autocomplete(debouncedDest).then(setDestSuggs)
+ }, [debouncedDest])

  const handleCreate = async () => {
+   setLoading(true)
-   const results = smartFilter(form)
+   try {
+     const response = await placeService.search({
+       city: form.city,
+       categories: form.categories,
+       maxPrice: Math.floor(parseInt(form.budget) / parseInt(form.people || 1)),
+       radius: parseInt(form.radius),
+       q: form.description,
+       wheelchair: form.wheelchair,
+     })
+     const results = response.places || response
      navigate('/top-results', { state: { results, form } })
+   } catch (err) { setError(err.message) }
+   finally { setLoading(false) }
  }
```

#### [MODIFY] [TopResults.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/pages/TopResults/TopResults.jsx)
- Kết quả nhận qua `location.state` (đã gọi API từ AISearch)
- Fallback: `placeService.getFeatured()` thay vì mock

#### [MODIFY] [Trip.jsx](file:///c:/Frontend/smart-travel/frontend-web/src/pages/Trip/Trip.jsx)
- `placeService.getById(id)` thay vì `destinations.find()`

#### [MODIFY] [useSearch.js](file:///c:/Frontend/smart-travel/frontend-web/src/hooks/useSearch.js)
- `placeService.search()` thay vì client-side `scoreMatch()`

#### [NEW] `src/data/staticData.js`
- Giữ `popularSearches`, `categories`, `interests`, `budgets`, `reviewTags` — data tĩnh không cần API

---

## Tổng hợp files

| Action | File | Mô tả |
|--------|------|-------|
| 🟢 NEW | `src/services/api.js` | HTTP client chung |
| 🟢 NEW | `src/services/placeService.js` | Place API + mock fallback |
| 🟢 NEW | `src/services/itineraryService.js` | Itinerary API + localStorage fallback |
| 🟢 NEW | `src/hooks/useDebounce.js` | Debounce hook |
| 🟢 NEW | `src/constants/timeSlots.js` | TIME_SLOTS enum |
| 🟢 NEW | `src/data/staticData.js` | Static data (categories, tags...) |
| 🟡 MODIFY | `src/context/TripContext.jsx` | API integration + loading states |
| 🟡 MODIFY | `src/pages/Itinerary/Itinerary.jsx` | Timeline Sáng/Trưa/Chiều/Tối |
| 🟡 MODIFY | `src/pages/Itinerary/Itinerary.css` | Timeline styles + responsive 4 breakpoints |
| 🟡 MODIFY | `src/pages/AISearch/AISearch.jsx` | API search thay smartFilter |
| 🟡 MODIFY | `src/pages/Home/Home.jsx` | Featured từ API |
| 🟡 MODIFY | `src/pages/Destination/Destination.jsx` | Detail từ API |
| 🟡 MODIFY | `src/pages/TopResults/TopResults.jsx` | Fallback từ API |
| 🟡 MODIFY | `src/pages/Trip/Trip.jsx` | Place từ API |
| 🟡 MODIFY | `src/hooks/useSearch.js` | API search |
| 🔴 DELETE (later) | `src/data/mockData.js` | Sau khi 100% API sẵn sàng |

---

## API Contracts — Backend cần bổ sung

> [!WARNING]
> Backend hiện **CHỈ CÓ** 2 endpoints (`GET /places/search` stub + `POST /recommendation`). Cần bổ sung các endpoint sau:

| Ưu tiên | Method | Endpoint | Request | Response | Status |
|---------|--------|----------|---------|----------|--------|
| 🔴 | GET | `/places/{id}` | — | `PlaceDetailDTO` | **Cần tạo** |
| 🔴 | GET | `/places/featured` | — | `List<BasePlaceResponse>` | **Cần tạo** |
| 🔴 | GET | `/places/search` | `keyword, page, size` | `Page<BasePlaceResponse>` | Có nhưng stub |
| 🔴 | POST | `/itineraries` | `title, startDate, endDate, numberOfDays` | `ItineraryDTO` | **Cần tạo entity + endpoint** |
| 🔴 | GET | `/itineraries` | — | `List<ItineraryDTO>` | **Cần tạo** |
| 🔴 | GET | `/itineraries/{id}` | — | `ItineraryDetailDTO` (items by day+slot) | **Cần tạo** |
| 🔴 | POST | `/itineraries/{id}/items` | `placeId, day, timeSlot, startTime, endTime, note` | `ItineraryItemDTO` | **Cần tạo** |
| 🟡 | PUT | `/itineraries/{id}/items/{itemId}` | `timeSlot, startTime, endTime, note` | `ItineraryItemDTO` | **Cần tạo** |
| 🟡 | DELETE | `/itineraries/{id}/items/{itemId}` | — | `204` | **Cần tạo** |
| 🟡 | POST | `/itineraries/generate` | `city, categories, budget, numberOfDays, description` | `ItineraryDetailDTO` | **Cần tạo** |

**Entity `Itinerary` cần tạo trong backend:**
```java
@Entity
public class Itinerary {
    @Id @GeneratedValue UUID id;
    @ManyToOne User user;
    String title;
    LocalDate startDate;
    LocalDate endDate;
    int numberOfDays;
    @OneToMany List<ItineraryItem> items;
    OffsetDateTime createdAt;
}

@Entity  
public class ItineraryItem {
    @Id @GeneratedValue UUID id;
    @ManyToOne Itinerary itinerary;
    @ManyToOne Place place;
    int day;                        // ngày thứ mấy (1, 2, 3...)
    String timeSlot;                // "MORNING", "NOON", "AFTERNOON", "EVENING"
    LocalTime startTime;
    LocalTime endTime;
    String note;
    int sortOrder;                  // thứ tự trong slot
}
```

---

## Thứ tự triển khai

| Phase | Task | Chờ gì? |
|-------|------|---------|
| **1** | Tạo 6 file mới (services, hooks, constants, staticData) | Không chờ |
| **2** | Refactor `TripContext` + `Itinerary.jsx` + `Itinerary.css` (timeline + responsive) | Phase 1 |
| **3** | Refactor `AISearch`, `Home`, `Destination`, `TopResults`, `Trip`, `useSearch` | Phase 1 |
| **4** | Test toàn bộ với `VITE_USE_API=false` (mock mode) | Phase 2+3 |
| **5** | Khi backend sẵn sàng → switch `VITE_USE_API=true`, test integration | Backend ready |

---

## Verification Plan

### Automated Tests
- `npm run dev` chạy không lỗi ở cả 2 mode (mock + API)
- Kiểm tra console: không còn `import from mockData` ở các file đã refactor

### Manual Verification
1. **Mock mode**: Toàn bộ flow hoạt động như hiện tại + lịch trình persist qua localStorage
2. **Itinerary**: 4 mốc Sáng/Trưa/Chiều/Tối hiển thị đúng, có timeline connector, có empty slot placeholder
3. **Responsive**: Test ở 1200px → 900px → 768px → 520px → layout chuyển đổi mượt
4. **API mode**: Khi bật API, request đúng format backend, error handling hiển thị toast
