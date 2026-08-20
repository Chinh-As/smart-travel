/**
 * reviewApi.js — Review/Rating API calls to backend-core
 *
 * Base URL: VITE_BACKEND_URL (defaults to http://localhost:8000)
 */
import { apiFetch } from './authApi.js';

/**
 * POST /api/v1/places/{placeId}/reviews
 * Requires a valid access token.
 *
 * @param {string} placeId
 * @param {{ rating: number, tags: string[], comment: string }} payload
 * @returns {Promise<ReviewResponse>}
 * @throws on 409 if user already reviewed this place
 */
export async function apiSubmitReview(placeId, { rating, tags = [], comment = '' }) {
  return apiFetch(`/api/v1/places/${encodeURIComponent(placeId)}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, tags, comment }),
  });
}

/**
 * GET /api/v1/places/{placeId}/reviews
 * Public — no token required.
 *
 * @param {string} placeId
 * @param {{ page?: number, size?: number }} options
 * @returns {Promise<{ content: ReviewResponse[], totalElements: number, totalPages: number }>}
 */
export async function apiGetReviews(placeId, { page = 0, size = 10 } = {}) {
  return apiFetch(
    `/api/v1/places/${encodeURIComponent(placeId)}/reviews?page=${page}&size=${size}`
  );
}
