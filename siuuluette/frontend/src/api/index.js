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
  logout:   ()      => { localStorage.removeItem('token'); window.location.reload(); }
}

// --- API de carrito ---
export const cartApi = {
  get:       ()               => request('/api/cart'),
  add:       (item)           => request('/api/cart/add', { method: 'POST', body: JSON.stringify(item) }),
  remove:    (id)             => request(`/api/cart/${id}`, { method: 'DELETE' }),
  updateQty: (id, quantity)   => request(`/api/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  merge:     (items)          => request('/api/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }),
}

// --- API de checkout ---
export const checkoutApi = {
  createIntent: (cart) => request('/api/checkout/intent', { method: 'POST', body: JSON.stringify(cart) }),
}
