<template>
  <!-- ==========================================
       SIUULUETTE — App Root
       Manages global cart state and renders all sections
       ========================================== -->
  <div id="siuuluette-app" :class="{ 'cart-open': isCartOpen }">

    <!-- Announcement Banner -->
    <div class="announcement-bar" v-if="showAnnouncement">
      <span class="label">Envío gratuito en pedidos superiores a 100€ — Nuevos drops cada mes</span>
      <button class="announcement-close" @click="showAnnouncement = false" aria-label="Cerrar">✕</button>
    </div>

    <!-- Sticky Navbar -->
    <Navbar
      :cart-count="cartCount"
      :is-scrolled="isScrolled"
      @open-cart="isCartOpen = true"
    />

    <!-- Main Content -->
    <main>
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts
        :products="products"
        @add-to-cart="addToCart"
      />
      <LimitedDrop @add-to-cart="addToCart" />
      <BrandValues />
      <NewsletterSection />
    </main>

    <FooterSection />

    <!-- Cart Sidebar -->
    <Transition name="slide-right">
      <CartSidebar
        v-if="isCartOpen"
        :cart-items="cartItems"
        @close="isCartOpen = false"
        @remove-item="removeFromCart"
        @update-qty="updateQty"
      />
    </Transition>

    <!-- Cart Overlay -->
    <Transition name="fade">
      <div
        v-if="isCartOpen"
        class="overlay"
        @click="isCartOpen = false"
      />
    </Transition>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div class="toast" v-if="toastVisible">
        <span class="toast-icon">✓</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { products } from './data/products.js'

import Navbar           from './components/Navbar.vue'
import HeroSection      from './components/HeroSection.vue'
import CategoryGrid     from './components/CategoryGrid.vue'
import FeaturedProducts from './components/FeaturedProducts.vue'
import LimitedDrop      from './components/LimitedDrop.vue'
import BrandValues      from './components/BrandValues.vue'
import NewsletterSection from './components/NewsletterSection.vue'
import FooterSection    from './components/FooterSection.vue'
import CartSidebar      from './components/CartSidebar.vue'

export default {
  name: 'App',
  components: {
    Navbar, HeroSection, CategoryGrid, FeaturedProducts,
    LimitedDrop, BrandValues, NewsletterSection, FooterSection,
    CartSidebar,
  },
  setup() {
    /* ---- Refs ---- */
    const cartItems       = ref([])
    const isCartOpen      = ref(false)
    const isScrolled      = ref(false)
    const showAnnouncement = ref(true)
    const toastVisible    = ref(false)
    const toastMessage    = ref('')
    let toastTimer        = null

    /* ---- Computed ---- */
    const cartCount = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.qty, 0)
    )

    /* ---- Methods ---- */
    function addToCart(product) {
      const existing = cartItems.value.find(i => i.id === product.id)
      if (existing) {
        existing.qty++
      } else {
        cartItems.value.push({ ...product, qty: 1 })
      }
      showToast(`${product.name} añadido al carrito`)
    }

    function removeFromCart(productId) {
      cartItems.value = cartItems.value.filter(i => i.id !== productId)
    }

    function updateQty(productId, delta) {
      const item = cartItems.value.find(i => i.id === productId)
      if (!item) return
      item.qty += delta
      if (item.qty <= 0) removeFromCart(productId)
    }

    function showToast(msg) {
      toastMessage.value = msg
      toastVisible.value = true
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => { toastVisible.value = false }, 2800)
    }

    function handleScroll() {
      isScrolled.value = window.scrollY > 60
    }

    onMounted(() => window.addEventListener('scroll', handleScroll))
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))

    return {
      products, cartItems, cartCount,
      isCartOpen, isScrolled,
      showAnnouncement,
      toastVisible, toastMessage,
      addToCart, removeFromCart, updateQty,
    }
  }
}
</script>

<style scoped>
/* --- Announcement Bar --- */
.announcement-bar {
  position: relative;
  background: var(--c-gold);
  color: var(--c-black);
  text-align: center;
  padding: 0.6rem 3rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
}

.announcement-close {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: var(--c-black);
  opacity: 0.6;
  cursor: pointer;
  padding: 0.25rem;
}

.announcement-close:hover { opacity: 1; }

/* --- Overlay --- */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(2px);
  z-index: 200;
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
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.toast-icon { color: var(--c-gold); font-size: 1rem; }

/* --- Transitions --- */
.slide-right-enter-active,
.slide-right-leave-active { transition: transform var(--t-slow) var(--ease-standard); }
.slide-right-enter-from,
.slide-right-leave-to    { transform: translateX(100%); }

.fade-enter-active,
.fade-leave-active { transition: opacity var(--t-medium); }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

.toast-enter-active,
.toast-leave-active { transition: all 0.4s var(--ease-spring); }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(20px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
