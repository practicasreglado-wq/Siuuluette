// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Siuuluette — Premium Sportswear & Lifestyle' }
  },
  {
    path: '/producto/:slug',
    name: 'product-detail',
    component: () => import('../views/ProductDetailView.vue'),
    props: true,
    meta: { title: 'Producto — Siuuluette' }
  },
  // Catch-all: cualquier ruta no reconocida vuelve a la home
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
