import re

# ================== AISearch.jsx ==================
with open('c:/Frontend/smart-travel/frontend-web/src/pages/AISearch/AISearch.jsx', 'r', encoding='utf-8') as f:
    ai_search = f.read()

# Add geoError state
state_old = "  const [loading,    setLoading]    = useState(false)"
state_new = "  const [loading,    setLoading]    = useState(false)\n  const [geoError,   setGeoError]   = useState('')"
ai_search = ai_search.replace(state_old, state_new)

# Update handleCreate
create_old = """  const handleCreate = async () => {
    setLoading(true)
    try {
      const { getRecommendations } = await import('../../services/recommendationApi.js');
      const { transformPlacesToDestinations } = await import('../../services/dataTransformers.js');
      
      // Default to HCM coords for now if city is not found
      let lat = 10.762622, lng = 106.660172;
      let category = form.categories.length > 0 ? form.categories[0] : 'sightseeing';
      
      // Calculate total budget instead of per-person for the backend API
      let totalBudget = parseInt(form.budget.replace(/\D/g,'')) || 1200000;
      let budgetLevel = totalBudget <= 500000 ? 'low' : totalBudget <= 1500000 ? 'medium' : 'high';
      let radiusKm = parseFloat(form.radius) || 5;

      const data = await getRecommendations({ lat, lng, budget: budgetLevel, radiusKm, category, topK: 10 });
      let results = transformPlacesToDestinations(data.places);
      
      // If API returns no results, fallback
      if (!results || results.length === 0) throw new Error('No API results');
      
      navigate('/top-results', { state: { results, form } });
    } catch (err) {
      console.error('AISearch API failed, fallback to mock', err);
      const results = smartFilter(form)
      navigate('/top-results', { state: { results, form } })
    } finally {
      setLoading(false)
    }
  }"""
create_new = """  const handleCreate = async () => {
    setGeoError('')
    if (form.categories.length === 0) {
      setGeoError('Vui lòng chọn ít nhất một danh mục.')
      return
    }
    if (!form.city) {
      setGeoError('Vui lòng nhập vị trí tìm kiếm.')
      return
    }
    setLoading(true)
    try {
      const { getRecommendations } = await import('../../services/recommendationApi.js');
      const { transformPlacesToDestinations } = await import('../../services/dataTransformers.js');
      const { geocodeCity } = await import('../../services/geocodingApi.js');
      
      let lat, lng;
      try {
        const geo = await geocodeCity(form.city);
        lat = geo.lat;
        lng = geo.lng;
      } catch (gErr) {
        throw new Error('Geocoding: ' + gErr.message);
      }
      
      let category = form.categories[0];
      let totalBudget = parseInt(form.budget.replace(/\D/g,'')) || 1200000;
      let budgetLevel = totalBudget <= 500000 ? 'low' : totalBudget <= 1500000 ? 'medium' : 'high';
      let radiusKm = parseFloat(form.radius) || 5;

      const data = await getRecommendations({ lat, lng, budget: budgetLevel, radiusKm, category, topK: 10 });
      let results = transformPlacesToDestinations(data.places);
      
      if (!results || results.length === 0) throw new Error('No API results');
      
      navigate('/top-results', { state: { results, form, radiusUsed: data.radiusUsed } });
    } catch (err) {
      console.error('AISearch API failed', err);
      if (err.message.includes('Geocoding:')) {
        setGeoError(err.message.replace('Geocoding: ', ''));
      } else {
        const results = smartFilter(form)
        navigate('/top-results', { state: { results, form } })
      }
    } finally {
      setLoading(false)
    }
  }"""
ai_search = ai_search.replace(create_old, create_new)

# Add geoError to UI
footer_old = """        <div className="ai-card__footer">
          <span className="ai-card__sparkle">✨</span>"""
footer_new = """        <div className="ai-card__footer" style={{flexDirection: 'column', alignItems: 'center'}}>
          {geoError && <div style={{color: '#ff4d4f', marginBottom: '10px', fontSize: '14px', background: '#ffeef0', padding: '8px 12px', borderRadius: '8px'}}>{geoError}</div>}
          <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: '15px'}}>
            <span className="ai-card__sparkle">✨</span>"""
ai_search = ai_search.replace(footer_old, footer_new)

footer_close_old = """            {loading ? 'Đang tạo...' : 'Tạo ngay'}
          </button>
        </div>"""
footer_close_new = """            {loading ? 'Đang tạo...' : 'Tạo ngay'}
          </button>
          </div>
        </div>"""
ai_search = ai_search.replace(footer_close_old, footer_close_new)

with open('c:/Frontend/smart-travel/frontend-web/src/pages/AISearch/AISearch.jsx', 'w', encoding='utf-8') as f:
    f.write(ai_search)


# ================== Itinerary.jsx ==================
with open('c:/Frontend/smart-travel/frontend-web/src/pages/Itinerary/Itinerary.jsx', 'r', encoding='utf-8') as f:
    itinerary = f.read()

# Add city state and error state
state_old_itin = "  const [aiPrompt, setAiPrompt] = useState('')"
state_new_itin = "  const [aiPrompt, setAiPrompt] = useState('')\n  const [city, setCity] = useState('Hồ Chí Minh')\n  const [geoError, setGeoError] = useState('')"
itinerary = itinerary.replace(state_old_itin, state_new_itin)

# Update handleGenerateAI
generate_old = """  const handleGenerateAI = async () => {
    if (generating) return
    setGenerating(true)
    setAiList([])
    
    try {
      const { generateItinerary } = await import('../../services/recommendationApi.js');
      const { transformItinerary } = await import('../../services/dataTransformers.js');
      
      let lat = 10.762622, lng = 106.660172; // Default HCM
      // Parse preferences from prompt
      let preferences = [];
      const pLower = aiPrompt.toLowerCase();
      if (pLower.includes('biển') || pLower.includes('beach')) preferences.push('beach', 'nature');
      if (pLower.includes('lịch sử') || pLower.includes('bảo tàng')) preferences.push('history', 'museum');
      if (pLower.includes('ăn') || pLower.includes('ẩm thực')) preferences.push('food', 'restaurant');
      if (preferences.length === 0) preferences.push('cafe', 'sightseeing'); // Default
      
      let budget = pLower.includes('rẻ') || pLower.includes('miễn phí') ? 'low' : 'medium';
      
      const apiItin = await generateItinerary({ lat, lng, preferences, budget, radiusKm: 10 });
      let transformed = transformItinerary(apiItin);
      
      // Map backend slots to frontend format
      transformed = transformed.map((item, index) => {
        const slotsMap = { 'morning': 'MORNING', 'lunch': 'NOON', 'afternoon': 'AFTERNOON', 'evening': 'EVENING' };
        return {
          ...item.place,
          timeSlot: slotsMap[item.timeSlot] || 'MORNING',
          day: Math.floor(index / 4) + 1, // Assume 4 slots per day
          note: item.reason || '',
          startTime: item.timeSlot === 'morning' ? '08:00' : item.timeSlot === 'lunch' ? '11:30' : item.timeSlot === 'afternoon' ? '14:00' : '18:00',
          endTime: item.timeSlot === 'morning' ? '11:00' : item.timeSlot === 'lunch' ? '13:30' : item.timeSlot === 'afternoon' ? '17:00' : '21:00',
        };
      });
      
      if (!transformed || transformed.length === 0) throw new Error('No API results');
      setAiList(transformed);
    } catch (err) {
      console.error('Itinerary API failed, fallback to mock', err);
      const result = generateFromPrompt(aiPrompt, destinations)
      setAiList(result)
    } finally {
      setGenerating(false)
      setTab('ai')
    }
  }"""
generate_new = """  const handleGenerateAI = async () => {
    if (generating) return
    setGeoError('')
    if (!city.trim()) {
      setGeoError('Vui lòng nhập thành phố/điểm đến.');
      return;
    }
    setGenerating(true)
    setAiList([])
    
    try {
      const { generateItinerary } = await import('../../services/recommendationApi.js');
      const { transformItinerary } = await import('../../services/dataTransformers.js');
      const { geocodeCity } = await import('../../services/geocodingApi.js');
      
      let lat, lng;
      try {
        const geo = await geocodeCity(city);
        lat = geo.lat;
        lng = geo.lng;
      } catch (gErr) {
        throw new Error('Geocoding: ' + gErr.message);
      }

      let preferences = [];
      const pLower = aiPrompt.toLowerCase();
      if (pLower.includes('biển') || pLower.includes('beach')) preferences.push('beach', 'nature');
      if (pLower.includes('lịch sử') || pLower.includes('bảo tàng')) preferences.push('history', 'museum');
      if (pLower.includes('ăn') || pLower.includes('ẩm thực')) preferences.push('food', 'restaurant');
      if (preferences.length === 0) preferences.push('cafe', 'sightseeing'); // Default
      
      let budget = pLower.includes('rẻ') || pLower.includes('miễn phí') ? 'low' : 'medium';
      
      const apiItin = await generateItinerary({ lat, lng, preferences, budget, radiusKm: 10 });
      let transformed = transformItinerary(apiItin);
      
      transformed = transformed.map((item, index) => {
        const slotsMap = { 'morning': 'MORNING', 'lunch': 'NOON', 'afternoon': 'AFTERNOON', 'evening': 'EVENING' };
        return {
          ...item.place,
          timeSlot: slotsMap[item.timeSlot] || 'MORNING',
          day: Math.floor(index / 4) + 1,
          note: item.reason || '',
          startTime: item.timeSlot === 'morning' ? '08:00' : item.timeSlot === 'lunch' ? '11:30' : item.timeSlot === 'afternoon' ? '14:00' : '18:00',
          endTime: item.timeSlot === 'morning' ? '11:00' : item.timeSlot === 'lunch' ? '13:30' : item.timeSlot === 'afternoon' ? '17:00' : '21:00',
        };
      });
      
      if (!transformed || transformed.length === 0) throw new Error('No API results');
      setAiList(transformed);
    } catch (err) {
      console.error('Itinerary API failed', err);
      if (err.message.includes('Geocoding:')) {
        setGeoError(err.message.replace('Geocoding: ', ''));
      } else {
        const result = generateFromPrompt(aiPrompt, destinations)
        setAiList(result)
      }
    } finally {
      setGenerating(false)
      setTab('ai')
    }
  }"""
itinerary = itinerary.replace(generate_old, generate_new)

# Add city input to UI
ui_old = """                  <div className="itin__ai-input-wrap">
                    <span className="itin__ai-sparkle">✨</span>
                    <textarea 
                      className="itin__ai-input"
                      placeholder="Ví dụ: Tạo lịch trình 2 ngày ở Đà Nẵng, thích ăn hải sản và đi dạo biển, ngân sách tiết kiệm..."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>"""
ui_new = """                  {geoError && <div style={{color: '#ff4d4f', marginBottom: '10px', fontSize: '14px', background: '#ffeef0', padding: '8px 12px', borderRadius: '8px'}}>{geoError}</div>}
                  <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                    <input 
                      type="text" 
                      className="ai-input" 
                      placeholder="Nhập Thành phố (VD: Đà Nẵng)"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={{ flex: 1, padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
                    />
                  </div>
                  <div className="itin__ai-input-wrap">
                    <span className="itin__ai-sparkle">✨</span>
                    <textarea 
                      className="itin__ai-input"
                      placeholder="Ví dụ: Lịch trình 2 ngày thích ăn hải sản và đi dạo biển, ngân sách tiết kiệm..."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>"""
itinerary = itinerary.replace(ui_old, ui_new)

with open('c:/Frontend/smart-travel/frontend-web/src/pages/Itinerary/Itinerary.jsx', 'w', encoding='utf-8') as f:
    f.write(itinerary)

print("Frontend React components refactored successfully")
