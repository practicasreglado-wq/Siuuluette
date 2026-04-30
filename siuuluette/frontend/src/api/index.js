// frontend/src/api/index.js

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper base — maneja errores y token JWT automáticamente
async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  }

  // Si el body es un objeto, lo convertimos a JSON automáticamente
  let body = options.body
  if (body && typeof body === 'object') {
    body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body,
    credentials: 'include'
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
  getAdminAll:()      => request('/api/products/admin'),
  getOne:     (id)    => request(`/api/products/${id}`),
  update:     (id, d) => request(`/api/products/${id}`, { method: 'PATCH', body: d }),
  updateVariant:(id, d) => request(`/api/products/variants/${id}`, { method: 'PATCH', body: d }),
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
  updateProfile: (data) => request('/api/auth/profile', { method: 'PATCH', body: data }),
  recoverPassword: (email) => request('/api/auth/recover', { method: 'POST', body: { email } }),
  updatePassword:  (password) => request('/api/auth/update-password', { method: 'POST', body: { password } }),
  logout:   async () => { 
    try { await request('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    window.location.reload(); 
  }
}

// --- API de carrito ---
export const cartApi = {
  get:    ()      => request('/api/cart'),
  add:    (item)  => request('/api/cart/add', { method: 'POST', body: JSON.stringify(item) }),
  remove: (cartItemId) => request(`/api/cart/${cartItemId}`, { method: 'DELETE' }),
  updateQty: (cartItemId, quantity) => request(`/api/cart/${cartItemId}`, { 
    method: 'PATCH', 
    body: JSON.stringify({ quantity }) 
  }),
  clear:  ()      => request('/api/cart', { method: 'DELETE' }),
  merge:  (items) => request('/api/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }),
  update: (data) => request('/api/cart/update', { method: 'POST', body: JSON.stringify(data) }),
}

// --- API de checkout ---
export const checkoutApi = {
  createIntent: (cart) => request('/api/checkout/intent', { method: 'POST', body: JSON.stringify(cart) }),
  confirmOrder: (data) => request('/api/checkout/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getHistory:   ()     => request('/api/checkout/orders'),
}

// --- API de administración (Solo Admin) ---
export const adminApi = {
  getOrders:    ()          => request('/api/admin/orders'),
  updateOrder:  (id, status) => request(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
  getInvoiceUrl:(id)         => `${BASE}/api/checkout/orders/${id}/invoice`
}
