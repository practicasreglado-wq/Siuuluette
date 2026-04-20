// frontend/src/api/index.js

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper base — maneja errores y token JWT automáticamente
async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Error ${res.status}`)
  }

  return res.json()
}

// --- API de productos ---
export const productsApi = {
  getAll: ()      => request('/api/products'),
  getOne: (id)    => request(`/api/products/${id}`),
  create: (data)  => request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
}

// --- API de auth ---
export const authApi = {
  login:    (creds) => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(creds) }),
  register: (data)  => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me:       ()      => request('/api/auth/me'),
}

// --- API de checkout ---
export const checkoutApi = {
  createIntent: (cart) => request('/api/checkout/intent', { method: 'POST', body: JSON.stringify(cart) }),
}
