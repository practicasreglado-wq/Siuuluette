// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ============================================================
  //  Tienda
  // ============================================================
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Le Siuuluette® — Premium Sportswear & Lifestyle' }
  },
  {
    path: '/producto/:slug',
    name: 'product-detail',
    component: () => import('../views/ProductDetailView.vue'),
    props: true,
    meta: { title: 'Producto — Le Siuuluette®' }
  },

  // ============================================================
  //  Cuenta
  // ============================================================
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/ResetPasswordView.vue'),
    meta: { title: 'Restablecer Contraseña — Le Siuuluette®' }
  },

  // ============================================================
  //  Admin (rol admin)
  // ============================================================
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('../views/AdminOrders.vue'),
    meta: { title: 'Gestión de Pedidos — Le Siuuluette®' }
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('../views/AdminProducts.vue'),
    meta: {
      title: 'Panel Admin — Siuuluette®',
      requiresAdmin: true
    }
  },

  // ============================================================
  //  Páginas legales (footer columna LEGAL)
  // ============================================================
  {
    path: '/aviso-legal',
    name: 'legal-notice',
    component: () => import('../views/legal/LegalNoticeView.vue'),
    meta: { title: 'Aviso Legal — Le Siuuluette®' }
  },
  {
    path: '/privacidad',
    name: 'privacy',
    component: () => import('../views/legal/PrivacyView.vue'),
    meta: { title: 'Política de Privacidad — Le Siuuluette®' }
  },
  {
    path: '/cookies',
    name: 'cookies',
    component: () => import('../views/legal/CookiesView.vue'),
    meta: { title: 'Política de Cookies — Le Siuuluette®' }
  },
  {
    path: '/terminos',
    name: 'terms',
    component: () => import('../views/legal/TermsView.vue'),
    meta: { title: 'Condiciones Generales — Le Siuuluette®' }
  },
  {
    path: '/marca-registrada',
    name: 'trademark',
    component: () => import('../views/legal/TrademarkView.vue'),
    meta: { title: 'Marca Registrada — Le Siuuluette®' }
  },

  // ============================================================
  //  Páginas de ayuda (footer columna AYUDA)
  // ============================================================
  {
    path: '/ayuda/faqs',
    name: 'help-faqs',
    component: () => import('../views/help/FaqsView.vue'),
    meta: { title: 'Preguntas frecuentes — Le Siuuluette®' }
  },
  {
    path: '/ayuda/contacto',
    name: 'help-contact',
    component: () => import('../views/help/ContactView.vue'),
    meta: { title: 'Contacto — Le Siuuluette®' }
  },
  {
    path: '/ayuda/envios',
    name: 'help-shipping',
    component: () => import('../views/help/ShippingView.vue'),
    meta: { title: 'Envíos — Le Siuuluette®' }
  },
  {
    path: '/ayuda/devoluciones',
    name: 'help-returns',
    component: () => import('../views/help/ReturnsView.vue'),
    meta: { title: 'Devoluciones — Le Siuuluette®' }
  },
  {
    path: '/ayuda/seguimiento',
    name: 'help-tracking',
    component: () => import('../views/help/OrderTrackingView.vue'),
    meta: { title: 'Seguimiento de pedido — Le Siuuluette®' }
  },

  // ============================================================
  //  Páginas de comunidad (footer columna COMUNIDAD)
  // ============================================================
  {
    path: '/lista-vip',
    name: 'vip-list',
    component: () => import('../views/community/VipListView.vue'),
    meta: { title: 'Lista VIP — Le Siuuluette®' }
  },
  {
    path: '/sostenibilidad',
    name: 'sustainability',
    component: () => import('../views/community/SustainabilityView.vue'),
    meta: { title: 'Sostenibilidad — Le Siuuluette®' }
  },

  // ============================================================
  //  Catch-all: rutas desconocidas vuelven a la home
  // ============================================================
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Al volver con el botón Atrás, restaura el scroll previo
    if (savedPosition) return savedPosition
    // Si la ruta tiene hash (#inicio, #drops, ...), hace scroll a esa sección.
    // Damos un pequeño offset para no ocultar el contenido bajo el navbar fijo.
    if (to.hash) {
      return {
        el: to.hash,
        top: 121, // 36 (announcement) + 85 (navbar)
        behavior: 'smooth'
      }
    }
    // Al cambiar de ruta, sube al top
    return { top: 0, behavior: 'smooth' }
  }
})

// Actualiza el title del documento por defecto (la ficha lo sobreescribe con el nombre del producto)
router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
