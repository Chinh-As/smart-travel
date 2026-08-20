/**
 * geocodingApi.js
 * Uses OpenStreetMap Nominatim API to convert city names to lat/lng.
 * Includes simple caching to avoid rate limit issues.
 */

const GEOCODE_CACHE = new Map();

export async function geocodeCity(cityName) {
  if (!cityName || !cityName.trim()) {
    throw new Error("City name is required");
  }

  const query = cityName.trim();
  
  if (GEOCODE_CACHE.has(query)) {
    return GEOCODE_CACHE.get(query);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=vn`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'vi-VN',
        'User-Agent': 'SmartTravelApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
      GEOCODE_CACHE.set(query, result);
      return result;
    } else {
      throw new Error("Không tìm thấy tọa độ cho địa điểm này.");
    }
  } catch (err) {
    console.error("Geocoding API error:", err);
    throw err;
  }
}
