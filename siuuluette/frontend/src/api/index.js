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
    const data = await res.json().catch(() => ({}))
    const msg = data.error || data.detail || data.message || `Error ${res.status}`
    throw new Error(msg)
  }

  return res.json()
}

// --- API de colecciones ---
export const collectionsApi = {
  getAll: () => request('/api/collections'),
}

// --- API de productos ---
export const productsApi = {
  getAll:     ()      => request('/api/products'),
  getOne:     (id)    => request(`/api/products/${id}`),
  getBySlug:  (slug)  => request(`/api/products/slug/${slug}`),
  getRelated: (id)    => request(`/api/products/${id}/related`),
  getVariants:(id)    => request(`/api/products/${id}/variants`),
  create:     (data)  => request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
}

// --- API de favoritos ---
export const favoritesApi = {
  list:   ()           => request('/api/favorites'),
  add:    (productId)  => request(`/api/favorites/${productId}`, { method: 'POST' }),
  remove: (productId)  => request(`/api/favorites/${productId}`, { method: 'DELETE' }),
}

// --- API de auth ---
export const authApi = {
  login:    (creds) => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(creds) }),
  register: (data)  => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me:       ()      => request('/api/auth/me'),
  updateProfile: (data) => request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  logout:   ()      => { localStorage.removeItem('token'); window.location.reload(); }
}

// --- API de carrito ---
export const cartApi = {
  get:    ()      => request('/api/cart'),
  add:    (item)  => request('/api/cart/add', { method: 'POST', body: JSON.stringify(item) }),
  remove: (productId, size) => request('/api/cart/remove', { 
    method: 'POST', 
    body: JSON.stringify({ product_id: productId, size }) 
  }),
  merge:  (items) => request('/api/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }),
  update: (data) => request('/api/cart/update', { method: 'POST', body: JSON.stringify(data) }),
}

// --- API de checkout ---
export const checkoutApi = {
  createIntent: (cart) => request('/api/checkout/intent', { method: 'POST', body: JSON.stringify(cart) }),
  confirmOrder: (data) => request('/api/checkout/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getHistory:   ()     => request('/api/checkout/orders'),
}
