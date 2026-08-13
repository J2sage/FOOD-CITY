import { API_BASE_URL } from '../env.js';
import { withLoading } from './loading.js';

const apiBaseUrl = API_BASE_URL.replace(/\/$/, '');

async function ordersRequest(path, options = {}) {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Please log in before using orders.');

  const response = await withLoading(() => fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  }));

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Order request failed');
  return data;
}

export function checkoutOrderWithApi({ subtotal, tax, shipping, total } = {}) {
  return ordersRequest('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      subtotal,
      tax,
      shipping,
      shippingFee: shipping,
      total
    })
  });
}

export function getMyOrdersFromApi({ limit } = {}) {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : '';
  return ordersRequest(`/orders/my${query}`);
}
