import { API_BASE_URL } from '../env.js';
import { withLoading } from './loading.js';
import { showAlertModal, openLoginModal } from '../login.js';

const apiBaseUrl = API_BASE_URL.replace(/\/$/, '');

async function cartRequest(path, options = {}) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    showAlertModal('Authentication Required', 'Please log in before using your cart.', 'cart-outline');
    document.querySelector('.alert-btn')?.addEventListener('click', (e)=>{
      e.preventDefault();
      openLoginModal();
    });
    return; // 2. Stop execution here
  }

  const response = await withLoading(() => fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  }));

  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || 'Cart request failed');
  return data;
}

export function getCartFromApi() {
  return cartRequest('/cart');
}

export function addCartItem(menuItemId, quantity = 1) {
  return cartRequest('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ menuItemId, quantity })
  });
}

export function removeCartItem(menuItemId, quantity = 1) {
  return cartRequest('/cart/remove', {
    method: 'POST',
    body: JSON.stringify({ menuItemId, quantity })
  });
}

export function updateCartItem(menuItemId, quantity) {
  return cartRequest('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({ menuItemId, quantity })
  });
}

export function clearCartFromApi() {
  return cartRequest('/cart/clear', { method: 'DELETE' });
}
