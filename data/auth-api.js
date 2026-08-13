// ============================================================
// API AUTH INTEGRATION
// ============================================================
import { API_BASE_URL } from '../env.js';
import { withLoading } from './loading.js';

const apiBaseUrl = API_BASE_URL.replace(/\/$/, '');

// Mapping: frontend fullName -> backend name.
// The response maps backend user.name -> frontend fullName.
function mapApiUserToFrontend(user) {
  return {
    ...user,
    // Compatibility mapping: existing UI username displays should show name.
    username: user.name,
    fullName: user.name,
    phoneNumber: user.phone ?? ''
  };
}

export async function registerUserWithApi({ fullName, email, phoneNumber, password }) {
  const response = await withLoading(() => fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: fullName,
      email,
      phone: phoneNumber,
      password
    })
  }));

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return {
    token: data.token,
    user: mapApiUserToFrontend(data.user)
  };
}

export async function loginUserWithApi({ email, password }) {
  const response = await withLoading(() => fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  }));

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return {
    token: data.token,
    user: mapApiUserToFrontend(data.user)
  };
}

async function authRequest(path, body) {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Please log in first.');

  const response = await withLoading(() => fetch(`${apiBaseUrl}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  }));

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function updateProfileWithApi({ fullName, email, phoneNumber }) {
  const data = await authRequest('/auth/profile', {
    name: fullName,
    email,
    phone: phoneNumber || ''
  });

  return mapApiUserToFrontend(data.user);
}

export function changePasswordWithApi({ oldPassword, newPassword, confirmNewPassword }) {
  return authRequest('/auth/password', {
    oldPassword,
    newPassword,
    confirmNewPassword
  });
}
