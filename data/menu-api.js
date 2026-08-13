import { API_BASE_URL } from '../env.js';
import { withLoading } from './loading.js';

const apiBaseUrl = API_BASE_URL.replace(/\/$/, '');

// API MENU INTEGRATION
// GET /menu?q=&category=
export async function getMenuFromApi({ q = '', category = '' } = {}) {
  const url = new URL(`${apiBaseUrl}/menu`);

  if (q.trim()) url.searchParams.set('q', q.trim());
  if (category.trim()) url.searchParams.set('category', category.trim());

  const response = await withLoading(() => fetch(url));
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load the menu');
  }

  return data;
}

async function adminMenuRequest(path, options = {}) {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Please log in as an admin first.');

  const response = await withLoading(() => fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  }));
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Menu request failed');
  return data;
}

export function createMenuItem(item) {
  return adminMenuRequest('/menu', { method: 'POST', body: JSON.stringify(item) });
}

export function updateMenuItem(id, item) {
  return adminMenuRequest(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(item) });
}

export function deleteMenuItem(id) {
  return adminMenuRequest(`/menu/${id}`, { method: 'DELETE' });
}
