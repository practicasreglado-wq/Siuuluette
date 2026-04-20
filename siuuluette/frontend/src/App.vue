<template>
  <!-- ==========================================
       SIUULUETTE — App Root
       Manages global cart state and renders all sections
       ========================================== -->
  <div id="siuuluette-app" :class="{ 'cart-open': isCartOpen }">

    <!-- Announcement Banner (Hidden in Explore Mode) -->
    <div class="announcement-bar" v-if="!selectedStyle">
      <span class="label">Envío gratuito en pedidos superiores a 100€ — Nuevos drops cada mes</span>
    </div>

    <Navbar
      :style="{ top: !selectedStyle ? '36px' : '0px' }"
      :cart-count="cartCount"
      :is-scrolled="isScrolled"
      @open-cart="isCartOpen = true"
      @nav-click="closeExplore"
    />

    <!-- Main Content -->
    <main :style="{ paddingTop: !selectedStyle ? '36px' : '0px' }">
      <HeroSection id="inicio" />
      <CategoryGrid id="explora" @category-select="selectCategory" />
      <LimitedDrop id="drops" @add-to-cart="addToCart" />
      <BrandValues id="nosotros" />
    </main>

    <FooterSection />

    <!-- Explore Overlay / View -->
    <CategoryExplore 
      :style-name="selectedStyle" 
      :products="products"
      @close="closeExplore"
      @add-to-cart="addToCart"
    />

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
import LimitedDrop      from './components/LimitedDrop.vue'
import BrandValues      from './components/BrandValues.vue'
import FooterSection    from './components/FooterSection.vue'
import CartSidebar      from './components/CartSidebar.vue'
import CategoryExplore  from './components/CategoryExplore.vue'

export default {
  name: 'App',
  components: {
    Navbar, HeroSection, CategoryGrid,
    LimitedDrop, BrandValues, FooterSection,
    CartSidebar, CategoryExplore
  },
  setup() {
    /* ---- Refs ---- */
    const cartItems       = ref([])
    const isCartOpen      = ref(false)
    const isScrolled      = ref(false)
    const activeCategory  = ref('')
    const selectedStyle   = ref('')
    const toastVisible    = ref(false)
    const toastMessage    = ref('')
    let toastTimer        = null

    /* ---- Computed ---- */
    const cartCount = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.qty, 0)
    )

    /* ---- Methods ---- */
    function addToCart(product) {
      const existing = cartItems.value.find(i => 
        i.id === product.id && i.selectedSize === product.selectedSize
      )
      if (existing) {
        existing.qty++
      } else {
        cartItems.value.push({ ...product, qty: 1 })
      }
      showToast(`${product.name} (${product.selectedSize}) añadido`)
    }

    function removeFromCart(productId, size) {
      cartItems.value = cartItems.value.filter(i => 
        !(i.id === productId && i.selectedSize === size)
      )
    }

    function updateQty(productId, size, delta) {
      const item = cartItems.value.find(i => 
        i.id === productId && i.selectedSize === size
      )
      if (!item) return
      item.qty += delta
      if (item.qty <= 0) removeFromCart(productId, size)
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

    function selectCategory(styleName) {
      selectedStyle.value = styleName
      document.body.style.overflow = 'hidden'
    }

    function closeExplore() {
      selectedStyle.value = ''
      document.body.style.overflow = ''
    }

    function selectGlobalFilter(catName) {
      activeCategory.value = catName
      const el = document.getElementById('colecciones')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    onMounted(() => window.addEventListener('scroll', handleScroll))
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))

    return {
      products, cartItems, cartCount,
      isCartOpen, isScrolled,
      activeCategory, selectedStyle,
      toastVisible, toastMessage,
      addToCart, removeFromCart, updateQty, 
      selectCategory, closeExplore, selectGlobalFilter
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
  z-index: 1200; /* Above Navbar */
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
