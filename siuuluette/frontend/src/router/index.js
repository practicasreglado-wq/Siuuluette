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
