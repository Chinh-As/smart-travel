/**
 * useSearch.js — Advanced Travel Search Engine with Multi-tier Scoring,
 * City Alias Resolution, Direct Match Filtering, Spatial Proximity Suggestions & Verified Filter Logic
 */
import { useState, useCallback } from 'react'
import { destinations } from '../data/mockData.js'

// Vietnamese accent normalization for fuzzy search
export function normalize(str) {
  if (!str) return ''
  return String(str).toLowerCase()
    .replace(/[àáạảãăắặẳẵâầấậẩẫ]/g,'a')
    .replace(/[èéẹẻẽêềếệểễ]/g,'e')
    .replace(/[ìíịỉĩ]/g,'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g,'o')
    .replace(/[ùúụủũưừứựửữ]/g,'u')
    .replace(/[ỳýỵỷỹ]/g,'y')
    .replace(/đ/g,'d')
    .replace(/[^a-z0-9\s]/g,'')
    .trim()
}

// Comprehensive City / Location Aliases
const CITY_ALIASES = {
  'sai gon': 'Hồ Chí Minh', 'saigon': 'Hồ Chí Minh', 'sg': 'Hồ Chí Minh', 'hcm': 'Hồ Chí Minh',
  'tphcm': 'Hồ Chí Minh', 'tp hcm': 'Hồ Chí Minh', 'tp.hcm': 'Hồ Chí Minh', 'tp. hcm': 'Hồ Chí Minh',
  'tp ho chi minh': 'Hồ Chí Minh', 'ho chi minh': 'Hồ Chí Minh', 'hcmc': 'Hồ Chí Minh',
  'quan 1': 'Hồ Chí Minh', 'q1': 'Hồ Chí Minh', 'quan 3': 'Hồ Chí Minh', 'q3': 'Hồ Chí Minh',
  'ha noi': 'Hà Nội', 'hanoi': 'Hà Nội', 'hn': 'Hà Nội', 'tp ha noi': 'Hà Nội',
  'da nang': 'Đà Nẵng', 'danang': 'Đà Nẵng', 'dn': 'Đà Nẵng',
  'hoi an': 'Hội An', 'hoian': 'Hội An',
  'da lat': 'Đà Lạt', 'dalat': 'Đà Lạt',
  'phu quoc': 'Phú Quốc', 'phuquoc': 'Phú Quốc',
  'nha trang': 'Nha Trang', 'nhatrang': 'Nha Trang',
  'vung tau': 'Vũng Tàu', 'vungtau': 'Vũng Tàu',
  'ha long': 'Hạ Long', 'halong': 'Hạ Long',
  'sa pa': 'Sa Pa', 'sapa': 'Sa Pa',
  'hue': 'Huế',
  'ninh binh': 'Ninh Bình', 'ninhbinh': 'Ninh Bình',
  'phan thiet': 'Phan Thiết', 'phanthiet': 'Phan Thiết', 'mui ne': 'Phan Thiết',
  'quang binh': 'Quảng Bình', 'quangbinh': 'Quảng Bình',
}

// Major cities reference center coordinates
const CITY_CENTERS = {
  'Hồ Chí Minh': { lat: 10.7769, lng: 106.7009 },
  'Hà Nội': { lat: 21.0285, lng: 105.8542 },
  'Đà Nẵng': { lat: 16.0544, lng: 108.2022 },
  'Hội An': { lat: 15.8800, lng: 108.3380 },
  'Đà Lạt': { lat: 11.9347, lng: 108.4388 },
  'Nha Trang': { lat: 12.2388, lng: 109.1967 },
  'Vũng Tàu': { lat: 10.3460, lng: 107.0843 },
  'Hạ Long': { lat: 20.9101, lng: 107.1839 },
  'Phú Quốc': { lat: 10.2899, lng: 103.9840 },
  'Phan Thiết': { lat: 10.9804, lng: 108.2615 },
  'Sa Pa': { lat: 22.3364, lng: 103.8438 },
  'Ninh Bình': { lat: 20.2506, lng: 105.9744 },
  'Quảng Bình': { lat: 17.4690, lng: 106.6225 },
};

// Haversine distance formula in kilometers
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Category synonyms mapping for precise filtering
const CATEGORY_SYNONYMS = {
  cafe: ['cafe', 'ca phe', 'cà phê', 'quán trà', 'coffee'],
  food: ['food', 'ẩm thực', 'nhà hàng', 'quán ăn', 'ăn uống', 'phở', 'bún', 'cơm', 'lẩu', 'bánh mì'],
  restaurant: ['food', 'ẩm thực', 'nhà hàng', 'quán ăn', 'ăn uống'],
  hotel: ['hotel', 'khách sạn', 'nghỉ dưỡng', 'homestay', 'resort'],
  sightseeing: ['sightseeing', 'tham quan', 'cảnh quan', 'di tích', 'văn hóa'],
  museum: ['museum', 'bảo tàng', 'lịch sử'],
  park: ['park', 'công viên', 'vui chơi', 'giải trí'],
  beach: ['beach', 'biển', 'đảo', 'bãi biển'],
  shopping: ['shopping', 'chợ', 'mua sắm'],
  // Normalized Vietnamese keys from database/API
  'ca phe': ['cafe', 'ca phe', 'cà phê', 'quán trà', 'coffee'],
  'am thuc': ['food', 'ẩm thực', 'nhà hàng', 'quán ăn', 'ăn uống', 'phở', 'bún', 'cơm', 'lẩu', 'bánh mì'],
  'nha hang': ['food', 'ẩm thực', 'nhà hàng', 'quán ăn', 'ăn uống'],
  'khach san': ['hotel', 'khách sạn', 'nghỉ dưỡng', 'homestay', 'resort'],
  'tham quan': ['sightseeing', 'tham quan', 'cảnh quan', 'di tích', 'văn hóa'],
  'bao tang': ['museum', 'bảo tàng', 'lịch sử'],
  'cong vien': ['park', 'công viên', 'vui chơi', 'giải trí'],
};

// Multi-tier Relevance Scoring algorithm
export function scoreMatch(dest, query) {
  if (!query?.trim()) return 100
  const q = normalize(query)
  const title    = normalize(dest.title || dest.name || '')
  const city     = normalize(dest.city || '')
  const location = normalize(dest.location || dest.address || '')
  const category = normalize(dest.category || '')
  const overview = normalize(dest.overview || dest.description || '')
  const cats     = (dest.categories || []).map(c => normalize(String(c))).join(' ')

  // Check if query contains city alias
  let targetCityNorm = ''
  for (const [alias, realCity] of Object.entries(CITY_ALIASES)) {
    if (q === alias || q.includes(alias)) {
      targetCityNorm = normalize(realCity)
      break
    }
  }

  let score = 0

  // Title match Tiers
  if (title === q) score += 150
  else if (title.startsWith(q)) score += 110
  else if (title.includes(q)) score += 90

  // City match (direct or alias)
  if (targetCityNorm && city.includes(targetCityNorm)) score += 40
  else if (city === q) score += 40
  else if (city.includes(q)) score += 30

  // Location / Address match
  if (location.includes(q)) score += 50

  // Category / Tags match
  if (category.includes(q) || cats.includes(q)) score += 30

  // Overview / Description match
  if (overview.includes(q)) score += 15

  // Word-by-word token match
  const qWords = q.split(/\s+/).filter(w => w.length >= 2)
  let matchedWordCount = 0
  const titleWords = title.split(/\s+/)

  qWords.forEach(w => {
    let wordMatched = false
    if (titleWords.some(tw => tw === w || tw.startsWith(w))) {
      score += 15
      wordMatched = true
    } else if (title.includes(w)) {
      score += 8
      wordMatched = true
    }
    if (location.includes(w)) { score += 5; wordMatched = true }
    if (category.includes(w) || cats.includes(w)) { score += 4; wordMatched = true }
    if (overview.includes(w)) { score += 2; wordMatched = true }
    if (wordMatched) matchedWordCount++
  })

  // All words match bonus
  if (qWords.length > 1 && matchedWordCount === qWords.length) {
    score += 50
  }

  return score
}

/**
 * Separate candidates into Direct Keyword Matches vs Nearby Proximity Suggestions
 */
function partitionResults(candidates, q) {
  if (!q?.trim()) {
    return { directResults: candidates, suggestions: [] };
  }

  const qNorm = normalize(q);
  const qWords = qNorm.split(/\s+/).filter(w => w.length >= 2);
  const isMultiWord = qWords.length >= 2;

  const directResults = [];
  const rawSuggestions = [];

  candidates.forEach(d => {
    const titleNorm = normalize(d.title || d.name || '');
    const locationNorm = normalize(d.location || d.address || '');
    const overviewNorm = normalize(d.overview || d.description || '');

    if (isMultiWord) {
      // Strict direct match for multi-word queries (e.g. "nhà thờ đức bà")
      const fullPhraseMatched = titleNorm.includes(qNorm) || locationNorm.includes(qNorm) || overviewNorm.includes(qNorm);
      const titleWords = titleNorm.split(/\s+/);
      const matchedTitleCount = qWords.filter(qw => titleWords.some(tw => tw === qw || tw.startsWith(qw))).length;
      const titleRatio = matchedTitleCount / qWords.length;

      const isDirect = fullPhraseMatched || titleRatio >= 0.75 || d._score >= 90;

      if (isDirect) {
        directResults.push(d);
      } else {
        rawSuggestions.push(d);
      }
    } else {
      if (d._score >= 35) {
        directResults.push(d);
      } else {
        rawSuggestions.push(d);
      }
    }
  });

  // Determine target search city / center coordinates
  let targetCity = '';
  let refCenter = null;

  // 1. Infer target city from directResults
  if (directResults.length > 0) {
    const cityCounts = {};
    directResults.forEach(d => {
      if (d.city) cityCounts[d.city] = (cityCounts[d.city] || 0) + 1;
    });
    const sortedCities = Object.keys(cityCounts).sort((a,b) => cityCounts[b] - cityCounts[a]);
    if (sortedCities.length > 0) targetCity = sortedCities[0];
  }

  // 2. Infer target city from CITY_ALIASES
  if (!targetCity) {
    for (const [alias, realCity] of Object.entries(CITY_ALIASES)) {
      if (qNorm === alias || qNorm.includes(alias)) {
        targetCity = realCity;
        break;
      }
    }
  }

  // 3. Set reference coordinates
  if (targetCity && CITY_CENTERS[targetCity]) {
    refCenter = CITY_CENTERS[targetCity];
  } else if (directResults.length > 0 && directResults[0].lat && directResults[0].lng) {
    refCenter = { lat: directResults[0].lat, lng: directResults[0].lng };
  }

  // Filter rawSuggestions strictly by Proximity (Same city or <= 35km distance)
  const nearbySuggestions = rawSuggestions.filter(d => {
    if (d._score < 5) return false;

    // Check city match
    if (targetCity) {
      const dCityNorm = normalize(d.city || '');
      const tCityNorm = normalize(targetCity);
      const dLocNorm  = normalize(d.location || '');
      if (dCityNorm.includes(tCityNorm) || dLocNorm.includes(tCityNorm)) {
        return true;
      }
    }

    // Check Haversine distance if reference center available
    if (refCenter && d.lat && d.lng) {
      const dist = getHaversineDistance(refCenter.lat, refCenter.lng, d.lat, d.lng);
      return dist <= 35; // Maximum 35km radius for nearby suggestions
    }

    // If no city or center could be inferred from query, keep suggestions with high score
    return !targetCity && d._score >= 20;
  });

  // Sort nearby suggestions by distance to refCenter (if available) or score
  nearbySuggestions.sort((a, b) => {
    if (refCenter && a.lat && a.lng && b.lat && b.lng) {
      const distA = getHaversineDistance(refCenter.lat, refCenter.lng, a.lat, a.lng);
      const distB = getHaversineDistance(refCenter.lat, refCenter.lng, b.lat, b.lng);
      if (distA !== distB) return distA - distB;
    }
    return b._score - a._score;
  });

  return { directResults, suggestions: nearbySuggestions };
}

/**
 * Sort destinations by specific user preference, with relevance score as tie-breaker
 */
function sortDestinations(list, sortBy) {
  return [...list].sort((a, b) => {
    if (sortBy === 'rating') {
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
      return (b._score || 0) - (a._score || 0);
    }
    if (sortBy === 'price_asc') {
      if ((a.price || 0) !== (b.price || 0)) return (a.price || 0) - (b.price || 0);
      return (b._score || 0) - (a._score || 0);
    }
    if (sortBy === 'price_desc') {
      if ((b.price || 0) !== (a.price || 0)) return (b.price || 0) - (a.price || 0);
      return (b._score || 0) - (a._score || 0);
    }
    if (sortBy === 'distance') {
      if ((a.distance || 9999) !== (b.distance || 9999)) return (a.distance || 9999) - (b.distance || 9999);
      return (b._score || 0) - (a._score || 0);
    }
    // Default: suitability / relevance score
    if ((b._score || 0) !== (a._score || 0)) return (b._score || 0) - (a._score || 0);
    return (b.suitability || 0) - (a.suitability || 0);
  });
}

export function useSearch() {
  const [query,       setQuery]       = useState('')
  const [status,      setStatus]      = useState('idle')
  const [results,     setResults]     = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [filters,     setFilters]     = useState({
    category:'all', priceRange:'all', minRating:0, maxDistance:100, sortBy:'suitability'
  })

  const performSearch = useCallback(async (q, f = filters) => {
    if (!q?.trim()) { setStatus('idle'); setResults([]); setSuggestions([]); return }
    setStatus('loading')

    try {
      const { searchDestinations } = await import('../services/recommendationApi.js');
      const { transformPlacesToDestinations } = await import('../services/dataTransformers.js');
      
      const apiCategory = f.category !== 'all' ? f.category : '';
      
      const qNorm = normalize(q);
      const mappedCity = CITY_ALIASES[qNorm] || '';
      const searchQuery = mappedCity || q;

      const response = await searchDestinations({ query: searchQuery, category: apiCategory, limit: 100 });
      let apiResults = transformPlacesToDestinations(response.results || []);
      apiResults = applyFilters(apiResults, f);

      apiResults = apiResults.map(d => ({ ...d, _score: scoreMatch(d, q) }));

      let localScored = destinations
        .map(d => ({ ...d, _score: scoreMatch(d, q) }))
        .filter(d => d._score > 0);
      localScored = applyFilters(localScored, f);

      const seenIds = new Set(apiResults.map(r => String(r.id)));
      const uniqueLocal = localScored.filter(d => !seenIds.has(String(d.id)));

      let combinedResults = [...apiResults, ...uniqueLocal];
      combinedResults = sortDestinations(combinedResults, f.sortBy);

      const { directResults, suggestions: simSuggestions } = partitionResults(combinedResults, q);

      if (directResults.length === 0 && simSuggestions.length === 0) {
        setStatus('empty');
        setResults([]);
        setSuggestions([]);
      } else {
        setStatus('results');
        setResults(directResults);
        setSuggestions(simSuggestions);
      }
    } catch (error) {
      console.error("Search API failed, falling back to local dataset", error);
      try {
        let scored = destinations
          .map(d => ({ ...d, _score: scoreMatch(d, q) }))
          .filter(d => d._score > 0);

        scored = applyFilters(scored, f);
        scored = sortDestinations(scored, f.sortBy);

        const { directResults, suggestions: simSuggestions } = partitionResults(scored, q);

        if (directResults.length === 0 && simSuggestions.length === 0) {
          setStatus('empty');
          setResults([]);
          setSuggestions([]);
        } else {
          setStatus('results');
          setResults(directResults);
          setSuggestions(simSuggestions);
        }
      } catch { setStatus('error') }
    }
  }, [filters])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const searchWithFilters = useCallback(async (q, f) => {
    setStatus('loading')
    try {
      const { searchDestinations, listDestinations } = await import('../services/recommendationApi.js');
      const { transformPlacesToDestinations } = await import('../services/dataTransformers.js');
      
      const apiCategory = f.category !== 'all' ? f.category : '';
      let response;
      if (q?.trim()) {
        const qNorm = normalize(q);
        const mappedCity = CITY_ALIASES[qNorm] || '';
        const searchQuery = mappedCity || q;
        response = await searchDestinations({ query: searchQuery, category: apiCategory, limit: 100 });
      } else {
        response = await listDestinations({ category: apiCategory, limit: 200 });
        if (!response.results) response.results = response.destinations;
      }
      
      let apiResults = transformPlacesToDestinations(response.results || []);
      apiResults = applyFilters(apiResults, f);
      apiResults = apiResults.map(d => ({ ...d, _score: scoreMatch(d, q || '') }));

      let localScored = destinations
        .map(d => ({ ...d, _score: scoreMatch(d, q || '') }))
        .filter(d => !q?.trim() || d._score > 0);
      localScored = applyFilters(localScored, f);

      const seenIds = new Set(apiResults.map(r => String(r.id)));
      const uniqueLocal = localScored.filter(d => !seenIds.has(String(d.id)));

      let combinedResults = [...apiResults, ...uniqueLocal];
      combinedResults = sortDestinations(combinedResults, f.sortBy);

      const { directResults, suggestions: simSuggestions } = partitionResults(combinedResults, q || '');

      if (directResults.length === 0 && simSuggestions.length === 0) {
        setStatus('empty');
        setResults([]);
        setSuggestions([]);
      } else {
        setStatus('results');
        setResults(directResults);
        setSuggestions(simSuggestions);
      }
    } catch (error) {
      console.error("Filter API failed, falling back to local dataset", error);
      try {
        let scored = destinations
          .map(d => ({ ...d, _score: scoreMatch(d, q || '') }))
          .filter(d => !q?.trim() || d._score > 0);
        scored = applyFilters(scored, f);
        scored = sortDestinations(scored, f.sortBy);
        const { directResults, suggestions: simSuggestions } = partitionResults(scored, q || '');
        setStatus(directResults.length === 0 && simSuggestions.length === 0 ? 'empty' : 'results');
        setResults(directResults);
        setSuggestions(simSuggestions);
      } catch { setStatus('error') }
    }
  }, [])

  const resetSearch = useCallback(() => { setQuery(''); setStatus('idle'); setResults([]); setSuggestions([]) }, [])

  return { query, setQuery, status, results, suggestions, filters, updateFilter, performSearch, searchWithFilters, resetSearch }
}

/**
 * Filter application logic with verified synonym mapping & precise thresholds
 */
function applyFilters(list, f) {
  let out = [...list]

  // 1. Category Filter with Synonym Matching
  if (f.category && f.category !== 'all') {
    const targetCatKey = normalize(f.category);
    const synonyms = CATEGORY_SYNONYMS[targetCatKey] || [targetCatKey];

    out = out.filter(d => {
      const mainCatNorm = normalize(d.category || '');
      const itemCats = (d.categories || []).map(c => normalize(String(c)));
      
      const matchesMain = synonyms.some(syn => mainCatNorm.includes(syn));
      const matchesArray = synonyms.some(syn => itemCats.some(ic => ic.includes(syn)));
      return matchesMain || matchesArray;
    });
  }

  // 2. Price Range Filter
  if (f.priceRange && f.priceRange !== 'all') {
    if (f.priceRange === 'free') {
      out = out.filter(d => d.price === 0);
    } else if (f.priceRange === 'budget') {
      out = out.filter(d => d.price >= 0 && d.price <= 50000);
    } else if (f.priceRange === 'mid') {
      out = out.filter(d => d.price > 50000 && d.price <= 150000);
    } else if (f.priceRange === 'premium') {
      out = out.filter(d => d.price > 150000);
    }
  }

  // 3. Minimum Rating Filter
  if (f.minRating > 0) {
    out = out.filter(d => (d.rating || 0) >= f.minRating);
  }

  // 4. Maximum Distance Filter
  if (f.maxDistance < 100) {
    out = out.filter(d => (d.distance || 0) <= f.maxDistance);
  }

  // 5. Sorting Logic
  switch (f.sortBy) {
    case 'rating':
      out.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'price_asc':
      out.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price_desc':
      out.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'distance':
      out.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      break;
    default:
      break;
  }

  return out;
}
