// frontend/src/api/index.js

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
let csrfToken = null

// --- CLIENTE API CENTRALIZADO ---
// Esta función maneja todas las peticiones al backend, añadiendo automáticamente
// el token de sesión (JWT) y el token de seguridad CSRF.
async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  // Obtener CSRF token si es una petición de escritura y no lo tenemos
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(options.method) && !csrfToken && path !== '/api/auth/csrf') {
    try {
      const res = await fetch(`${BASE}/api/auth/csrf`, { credentials: 'include' })
      const data = await res.json()
      csrfToken = data.csrfToken
    } catch (e) {
      console.error('Error fetching CSRF token:', e)
    }
  }

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
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
    if (res.status === 401) {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // No recargamos inmediatamente para evitar bucles infinitos en rutas públicas
      // pero el estado queda limpio para la próxima acción del usuario
    }
    const data = await res.json().catch(() => ({}))
    const msg = data.error || data.detail || data.message || `Error ${res.status}`
    throw new Error(msg)
  }

  return res.json()
}

// --- SERVICIOS DE COLECCIONES ---
export const collectionsApi = {
  getAll: () => request('/api/collections'),
}

// --- SERVICIOS DE PRODUCTOS ---
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

// --- SERVICIOS DE FAVORITOS ---
export const favoritesApi = {
  list:   ()           => request('/api/favorites'),
  add:    (productId)  => request(`/api/favorites/${productId}`, { method: 'POST' }),
  remove: (productId)  => request(`/api/favorites/${productId}`, { method: 'DELETE' }),
}

// --- SERVICIOS DE AUTENTICACIÓN ---
export const authApi = {
  login:    (creds) => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(creds) }),
  register: (data)  => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me:       ()      => request('/api/auth/me'),
  updateProfile: (data) => request('/api/auth/profile', { method: 'PATCH', body: data }),
  recoverPassword: (email) => request('/api/auth/recover', { method: 'POST', body: { email } }),
  updatePassword:  (password) => request('/api/auth/update-password', { method: 'POST', body: { password } }),
  getCsrf:  ()      => request('/api/auth/csrf'),
  logout:   async () => { 
    try { await request('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    window.location.reload(); 
  }
}

// --- SERVICIOS DE CARRITO ---
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

// --- SERVICIOS DE PAGO Y PEDIDOS (CHECKOUT) ---
export const checkoutApi = {
  createIntent:   (cart) => request('/api/checkout/intent',  { method: 'POST', body: JSON.stringify(cart) }),
  // Adjunta shipping + items + userId al PaymentIntent (metadata) ANTES de confirmar el pago.
  // Esto permite que el webhook reconstruya el pedido si el frontend cae despues.
  attachMetadata: (data) => request('/api/checkout/attach',  { method: 'POST', body: JSON.stringify(data) }),
  confirmOrder:   (data) => request('/api/checkout/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getHistory:     ()     => request('/api/checkout/orders'),
}

// --- SERVICIOS DE ADMINISTRACIÓN ---
export const adminApi = {
  getOrders:    ()          => request('/api/admin/orders'),
  updateOrder:  (id, status) => request(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
  getInvoiceUrl:(id)         => `${BASE}/api/checkout/orders/${id}/invoice`
}
