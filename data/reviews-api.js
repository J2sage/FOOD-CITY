import { API_BASE_URL } from '../env.js';
import { withLoading } from './loading.js';

const apiBaseUrl = API_BASE_URL.replace(/\/$/, '');

async function reviewsRequest(path = '', options = {}) {
  const token = localStorage.getItem('authToken');
  const response = await withLoading(() => fetch(`${apiBaseUrl}/reviews${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  }));
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Could not load reviews.');
  return data;
}

export function getReviewsFromApi() {
  return reviewsRequest();
}

export function createReviewWithApi({ comment, rating }) {
  return reviewsRequest('', {
    method: 'POST',
    body: JSON.stringify({ comment, rating })
  });
}
