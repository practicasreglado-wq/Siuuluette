<template>
  <!-- ==========================================
       SIUULUETTE — App Root
       Layout global: Navbar + router-view + Cart + Toast
       El estado del carrito vive en useCart() (composable).
       ========================================== -->
  <div id="siuuluette-app" :class="{ 'cart-open': isCartOpen }">

    <!-- Announcement Banner (global) -->
    <div class="announcement-bar">
      <span class="label">Envío gratuito en pedidos superiores a 100€ — Nuevos drops cada mes</span>
    </div>

    <Navbar
      :style="{ top: '36px' }"
      :cart-count="cartCount"
      :is-scrolled="isScrolled"
      @open-cart="isCartOpen = true"
    />

    <!-- Vista activa según la ruta (HomeView, ProductDetailView, …) -->
    <main :style="{ paddingTop: '36px' }">
      <router-view />
    </main>

    <FooterSection />

    <!-- Cart Sidebar (global) -->
    <Transition name="slide-right">
      <CartSidebar
        v-if="isCartOpen"
        :cart-items="cartItems"
        @close="isCartOpen = false"
        @remove-item="removeFromCart"
        @update-qty="updateQty"
      />
    </Transition>

    <Transition name="fade">
      <div
        v-if="isCartOpen"
        class="overlay"
        @click="isCartOpen = false"
      />
    </Transition>

    <!-- Toast Notification (global) -->
    <Transition name="toast">
      <div class="toast" v-if="toastVisible">
        <span class="toast-icon">✓</span>
        <span>{{ toastMsg }}</span>
      </div>
    </Transition>

  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { authApi } from './api/index.js'
import { useCart } from './composables/useCart.js'

import Navbar        from './components/Navbar.vue'
import FooterSection from './components/FooterSection.vue'
import CartSidebar   from './components/CartSidebar.vue'

export default {
  name: 'App',
  components: { Navbar, FooterSection, CartSidebar },
  setup() {
    // --- Estado y acciones del carrito (composable global) ---
    const {
      cartItems,
      cartCount,
      isCartOpen,
      toastMsg,
      toastVisible,
      removeFromCart,
      updateQty,
      fetchCart,
      mergeGuestCart,
    } = useCart()

    // --- Estado local de UI ---
    const currentUser = ref(null)
    const isScrolled  = ref(false)

    // --- Auth bootstrap ---
    async function checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const data = await authApi.me()
        currentUser.value = data.user
        // Si veníamos como invitado con cosas en el carrito, las fusionamos en DB
        await mergeGuestCart()
        await fetchCart()
      } catch {
        localStorage.removeItem('token')
        currentUser.value = null
      }
    }

    function handleScroll() {
      isScrolled.value = window.scrollY > 60
    }

    onMounted(async () => {
      window.addEventListener('scroll', handleScroll)
      await checkAuth()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      cartItems,
      cartCount,
      isCartOpen,
      toastMsg,
      toastVisible,
      removeFromCart,
      updateQty,
      isScrolled,
    }
  }
}
</script>

<style scoped>
/* --- Announcement Bar --- */
.announcement-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-gold);
  color: var(--c-black);
  padding: 0 3rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  z-index: 1200;
}

/* --- Overlay --- */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(58, 52, 45, 0.7);
  backdrop-filter: blur(2px);
  z-index: 1900;
}

/* --- Toast --- */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--c-dark-2);
  border: 1px solid var(--c-gold);
  color: var(--c-white);
  padding: 0.85rem 1.8rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 3000;
  white-space: nowrap;
  box-shadow: 0 8px 32px rgba(58, 52, 45, 0.3);
}

.toast-icon { color: var(--c-gold); font-size: 1rem; }

/* --- Transitions --- */
.slide-right-enter-active,
.slide-right-leave-active { transition: transform var(--t-slow) var(--ease-standard); }
.slide-right-enter-from,
.slide-right-leave-to     { transform: translateX(100%); }

.fade-enter-active,
.fade-leave-active { transition: opacity var(--t-medium); }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

.toast-enter-active,
.toast-leave-active { transition: all 0.4s var(--ease-spring); }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(20px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
