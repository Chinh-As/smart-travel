import RECOMMENDATION_API_URL, { CORE_API_URL, API_TIMEOUT } from './apiConfig.js';
import { getAccessToken } from '../context/AuthContext.jsx';

async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function checkHealth() {
  return fetchWithTimeout(`${RECOMMENDATION_API_URL}/health`);
}

export async function fetchCategories() {
  try {
    const data = await fetchWithTimeout(`${CORE_API_URL}/api/v1/categories`);
    if (Array.isArray(data)) {
      return data.map(c => c.name ? c.name.toLowerCase() : String(c).toLowerCase());
    }
    return data.categories || [];
  } catch (e) {
    return [];
  }
}

export async function fetchFeaturedDestinations(limit = 8) {
  const data = await fetchWithTimeout(`${CORE_API_URL}/api/v1/places/featured?size=${limit}`);
  return data.content || [];
}

export async function fetchDestinationById(placeId) {
  const data = await fetchWithTimeout(`${CORE_API_URL}/api/v1/places/${encodeURIComponent(placeId)}`);
  return data || null;
}

export async function searchDestinations({ query = '', category = '', limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (query) params.set('keyword', query);
  if (category) params.set('category', category);
  params.set('size', String(limit));
  const data = await fetchWithTimeout(`${CORE_API_URL}/api/v1/places/search?${params}`);
  return { results: data.content || [], totalCount: data.totalElements || 0 };
}

export async function listDestinations({ category = '', priceLevel = '', limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  params.set('size', String(limit));
  params.set('page', String(Math.floor(offset / limit)));
  const data = await fetchWithTimeout(`${CORE_API_URL}/api/v1/places/search?${params}`);
  return { destinations: data.content || [], totalCount: data.totalElements || 0 };
}

export async function getRecommendations({ lat, lng, budget, radiusKm, category, topK = 10 }) {
  const budgetMap = {
      'low': 100000,
      'medium': 500000,
      'high': 2000000
  };
  const data = await fetchWithTimeout(`${API_BASE_URL}/api/v1/recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: { type: 'COORDINATES', lat, lng },
      constraints: { 
          budget: { amount: budgetMap[budget] || 500000, currency: 'VND' }, 
          radius_km: radiusKm, 
          category: category 
      },
      top_k: topK,
    }),
  });
  return { places: data.places || [], totalCount: data.totalCount || 0, radiusUsed: radiusKm };
}
export async function generateItinerary({ lat, lng, preferences, budget, radiusKm }) {
  const data = await fetchWithTimeout(`${API_BASE_URL}/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: { type: 'COORDINATES', lat, lng },
      preferences,
      budget,
      radius_km: radiusKm,
    }),
  });
  return data.itinerary || [];
}

export async function fetchReviewsForPlace(placeId) {
  return fetchWithTimeout(`${CORE_API_URL}/api/v1/reviews/places/${encodeURIComponent(placeId)}`);
}

export async function submitReview({ placeId, ratingPoint, reviewContent }) {
  const token = getAccessToken();
  return fetchWithTimeout(`${CORE_API_URL}/api/v1/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      placeId,
      ratingPoint,
      reviewContent
    })
  });
}
