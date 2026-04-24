<template>
  <div id="siuuluette-app" :class="{ 'cart-open': isCartOpen }">

    <div class="announcement-bar">
      <span class="label">Envío gratuito en pedidos superiores a 100€ — Nuevos drops cada mes</span>
    </div>

    <Navbar
      :style="{ top: '36px' }"
      :cart-count="cartCount"
      :is-scrolled="isScrolled"
      :current-user="currentUser"
      @open-cart="isCartOpen = true"
      @open-auth="isAuthOpen = true"
    />

    <main :style="{ paddingTop: '36px' }">
      <router-view />
    </main>

    <FooterSection />

    <!-- Overlays Globales -->
    <AuthOverlay
      :is-open="isAuthOpen"
      :current-user="currentUser"
      @close="isAuthOpen = false"
      @login-success="handleLoginSuccess"
      @logout="handleLogout"
    />

    <CheckoutOverlay
      :is-open="isCheckoutOpen"
      :items="cartItems"
      :total="cartSubtotal"
      :current-user="currentUser"
      @close="isCheckoutOpen = false"
      @success="handlePaymentSuccess"
    />

    <SuccessOverlay
      :is-open="isSuccessOpen"
      @close="isSuccessOpen = false"
    />

    <Transition name="slide-right">
      <CartSidebar
        v-if="isCartOpen"
        :cart-items="cartItems"
        @close="isCartOpen = false"
        @items-change="fetchCart"
        @checkout="handleCheckout"
        @remove-item="removeFromCart"
        @update-qty="updateQty"
      />
    </Transition>

    <Transition name="fade">
      <div v-if="isCartOpen" class="overlay" @click="isCartOpen = false" />
    </Transition>

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

import Navbar from './components/Navbar.vue'
import FooterSection from './components/FooterSection.vue'
import CartSidebar from './components/CartSidebar.vue'
import AuthOverlay from './components/AuthOverlay.vue'
import CheckoutOverlay from './components/CheckoutOverlay.vue'
import SuccessOverlay from './components/SuccessOverlay.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    FooterSection,
    CartSidebar,
    AuthOverlay,
    CheckoutOverlay,
    SuccessOverlay
  },
  setup() {
    const {
      cartItems,
      cartCount,
      cartSubtotal,
      isCartOpen,
      toastMsg,
      toastVisible,
      removeFromCart,
      updateQty,
      fetchCart,
      mergeGuestCart,
      clearCart,
    } = useCart()

    const currentUser = ref(null)
    const isScrolled = ref(false)
    const isAuthOpen = ref(false)
    const isCheckoutOpen = ref(false)
    const isSuccessOpen = ref(false)

    async function checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const data = await authApi.me()
        currentUser.value = { ...data.user, ...data.profile }
        await mergeGuestCart()
        await fetchCart()
      } catch (err) {
        localStorage.removeItem('token')
        currentUser.value = null
      }
    }

    function handleLoginSuccess(user) {
      currentUser.value = user
      isAuthOpen.value = false
      fetchCart()
    }

    function handleLogout() {
      authApi.logout()
      currentUser.value = null
      cartItems.value = []
      isAuthOpen.value = false
      isCheckoutOpen.value = false
      isCartOpen.value = false
    }

    function handleCheckout() {
      isCartOpen.value = false

      if (!currentUser.value) {
        isAuthOpen.value = true
      } else {
        isCheckoutOpen.value = true
      }
    }

    function handlePaymentSuccess(updatedUser) {
      if (updatedUser) {
        currentUser.value = updatedUser
      }

      isCheckoutOpen.value = false
      isSuccessOpen.value = true
      clearCart()
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
      cartSubtotal,
      isCartOpen,
      toastMsg,
      toastVisible,
      removeFromCart,
      updateQty,
      fetchCart,
      isScrolled,
      currentUser,
      isAuthOpen,
      isCheckoutOpen,
      isSuccessOpen,
      handleLoginSuccess,
      handleLogout,
      handleCheckout,
      handlePaymentSuccess
    }
  }
}
</script>

<style scoped>
/* Estilos extraídos por brevedad para mantener la limpieza */
.announcement-bar {
  position: fixed; top: 0; left: 0; right: 0; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: var(--c-gold); color: var(--c-black);
  z-index: 1200; font-size: 0.75rem; letter-spacing: 0.12em;
}
.overlay {
  position: fixed; inset: 0; background: rgba(58, 52, 45, 0.7);
  backdrop-filter: blur(2px); z-index: 1900;
}
.toast {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  background: var(--c-dark-2); border: 1px solid var(--c-gold);
  color: var(--c-white); padding: 0.85rem 1.8rem; border-radius: var(--radius-md);
  display: flex; align-items: center; gap: 0.6rem; z-index: 3000;
}
.slide-right-enter-active, .slide-right-leave-active { transition: transform var(--t-slow) var(--ease-standard); }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity var(--t-medium); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
