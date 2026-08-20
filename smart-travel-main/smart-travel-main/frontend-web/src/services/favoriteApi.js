import { apiFetch } from './authApi.js';

/**
 * Get user's favorite places
 */
export async function apiGetFavorites() {
  const data = await apiFetch('/api/favorites');
  return data;
}

/**
 * Add a place to favorites
 * @param {string} placeId UUID of the place
 */
export async function apiAddFavorite(placeId) {
  const data = await apiFetch('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ placeId }),
  });
  return data;
}

/**
 * Remove a place from favorites
 * @param {string} placeId UUID of the place
 */
export async function apiRemoveFavorite(placeId) {
  await apiFetch(`/api/favorites/${encodeURIComponent(placeId)}`, {
    method: 'DELETE',
  });
}

/**
 * Check if a place is in favorites
 * @param {string} placeId UUID of the place
 */
export async function apiCheckFavorite(placeId) {
  const data = await apiFetch(`/api/favorites/check/${encodeURIComponent(placeId)}`);
  return data;
}
