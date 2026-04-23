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
      :current-user="currentUser"
      @open-cart="isCartOpen = true"
      @open-auth="isAuthOpen = true"
      @logout="handleLogout"
      @nav-click="closeExplore"
    />

    <!-- Products error banner -->
    <div class="products-error" v-if="productsError">
      <span>{{ productsError }}</span>
      <button class="products-error__retry" @click="fetchProducts">Reintentar</button>
    </div>

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

    <!-- Checkout Overlay -->
    <CheckoutOverlay
      :is-open="isCheckoutOpen"
      :items="cartItems"
      :total="cartTotal"
      :current-user="currentUser"
      @close="isCheckoutOpen = false"
      @success="handlePaymentSuccess"
    />

    <!-- Success Overlay -->
    <SuccessOverlay
      :is-open="isSuccessOpen"
      @close="isSuccessOpen = false"
    />

    <!-- Auth Overlay -->
    <AuthOverlay
      :is-open="isAuthOpen"
      :current-user="currentUser"
      :message="authOverlayMessage"
      @close="isAuthOpen = false; authOverlayMessage = ''"
      @login-success="handleLoginSuccess"
      @logout="handleLogout"
      @buy-again="handleBuyAgain"
    />

    <!-- Cart Sidebar -->
    <Transition name="slide-right">
      <CartSidebar
        v-if="isCartOpen"
        :cart-items="cartItems"
        @close="isCartOpen = false"
        @checkout="handleCheckout"
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
import { productsApi, authApi, cartApi } from './api/index.js'

import Navbar           from './components/Navbar.vue'
import HeroSection      from './components/HeroSection.vue'
import CategoryGrid     from './components/CategoryGrid.vue'
import LimitedDrop      from './components/LimitedDrop.vue'
import BrandValues      from './components/BrandValues.vue'
import FooterSection    from './components/FooterSection.vue'
import CartSidebar      from './components/CartSidebar.vue'
import CategoryExplore  from './components/CategoryExplore.vue'
import CheckoutOverlay  from './components/CheckoutOverlay.vue'
import SuccessOverlay   from './components/SuccessOverlay.vue'
import AuthOverlay      from './components/AuthOverlay.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    HeroSection,
    CategoryGrid,
    LimitedDrop,
    BrandValues,
    FooterSection,
    CartSidebar,
    CategoryExplore,
    CheckoutOverlay,
    SuccessOverlay,
    AuthOverlay
  },
  setup() {
    /* ---- Refs ---- */
    const products = ref([])
    const productsError = ref('')
    const cartItems = ref([])
    const currentUser = ref(null)
    const isCartOpen = ref(false)
    const isCheckoutOpen = ref(false)
    const isSuccessOpen = ref(false)
    const isAuthOpen = ref(false)
    const authOverlayMessage = ref('')
    const isScrolled = ref(false)
    const activeCategory = ref('')
    const selectedStyle = ref('')
    const toastVisible = ref(false)
    const toastMessage = ref('')
    let toastTimer = null

    /* ---- Computed ---- */
    const cartCount = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
    )

    const cartTotal = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(0)
    )

    /* ---- Methods ---- */
    async function fetchProducts() {
      try {
        productsError.value = ''
        const data = await productsApi.getAll()
        products.value = Array.isArray(data.products) ? data.products : []

        if (products.value.length === 0) {
          productsError.value = 'No hay productos disponibles en este momento.'
        }
      } catch (err) {
        console.error('Error cargando productos:', err)
        products.value = []
        productsError.value = 'No hemos podido cargar el catálogo. Revisa tu conexión o inténtalo más tarde.'
      }
    }

    async function checkAuth() {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const data = await authApi.me()
          currentUser.value = { ...data.user, ...data.profile }
          await syncCartWithBackend()
        } catch (err) {
          localStorage.removeItem('token')
          currentUser.value = null
        }
      }
    }

    async function syncCartWithBackend() {
      const { cart } = await cartApi.get()

      const localCart = JSON.parse(localStorage.getItem('cart') || '[]')

      if (localCart.length > 0) {
        await cartApi.merge(
          localCart.map(i => ({
            product_id: i.id,
            quantity: i.quantity || i.qty || 1,
            size: i.selectedSize
          }))
        )

        localStorage.removeItem('cart')

        const { cart: mergedCart } = await cartApi.get()
        cartItems.value = formatCartFromBackend(mergedCart)
      } else {
        cartItems.value = formatCartFromBackend(cart)
      }
    }

    function formatCartFromBackend(items) {
      return items.map(i => ({
        cartItemId: i.id,
        id: i.product_id,
        name: i.products.name,
        price: i.products.price,
        quantity: i.quantity,
        image_url: i.products.image_url,
        selectedSize: i.size || 'M'
      }))
    }

    async function addToCart(product) {
      const size = product.selectedSize || 'M'

      const existing = cartItems.value.find(i =>
        i.id === product.id && i.selectedSize === size
      )

      if (existing) {
        existing.quantity++
      } else {
        cartItems.value.push({
          ...product,
          selectedSize: size,
          quantity: 1
        })
      }

      const token = localStorage.getItem('token')

      if (token) {
        try {
          await cartApi.add({
            product_id: product.id,
            quantity: 1,
            size
          })

          const { cart } = await cartApi.get()
          cartItems.value = formatCartFromBackend(cart)
        } catch (err) {
          console.error('Error añadiendo al carrito:', err)
          showToast('No se pudo añadir al carrito')
          return
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(cartItems.value))
      }

      showToast(`${product.name} añadido`)
    }

    async function removeFromCart(productId, size) {
      const previousItems = [...cartItems.value]

      cartItems.value = cartItems.value.filter(i =>
        !(i.id === productId && i.selectedSize === size)
      )

      const token = localStorage.getItem('token')

      if (token) {
        try {
          await cartApi.remove(productId, size)
        } catch (err) {
          console.error('Error eliminando del carrito:', err)
          cartItems.value = previousItems
          showToast('No se pudo eliminar del carrito')
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(cartItems.value))
      }
    }

    async function updateQty(productId, size, delta) {
      const item = cartItems.value.find(i =>
        i.id === productId && i.selectedSize === size
      )

      if (!item) return

      const previousQty = item.quantity
      const newQty = item.quantity + delta

      if (newQty <= 0) {
        await removeFromCart(productId, size)
        return
      }

      item.quantity = newQty

      const token = localStorage.getItem('token')

      if (token) {
        try {
          await cartApi.update({
            product_id: productId,
            quantity: newQty,
            size
          })
        } catch (err) {
          console.error('Error actualizando cantidad:', err)
          item.quantity = previousQty
          showToast('No se pudo actualizar la cantidad')
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(cartItems.value))
      }
    }

    function handleCheckout() {
      if (!currentUser.value) {
        authOverlayMessage.value = 'Debes iniciar sesión o crear una cuenta para finalizar tu pedido'
        isAuthOpen.value = true
        isCartOpen.value = false
        return
      }

      isCheckoutOpen.value = true
      isCartOpen.value = false
    }

    function showToast(msg) {
      toastMessage.value = msg
      toastVisible.value = true
      clearTimeout(toastTimer)

      toastTimer = setTimeout(() => {
        toastVisible.value = false
      }, 2800)
    }

    function handlePaymentSuccess(updatedUser) {
      if (updatedUser) {
        currentUser.value = updatedUser
      }
      isSuccessOpen.value = true
      cartItems.value = []
      localStorage.removeItem('cart')
      isCheckoutOpen.value = false
    }

    function handleLoginSuccess(user) {
      currentUser.value = user
      isAuthOpen.value = false
      showToast(`Bienvenido, ${user.email}`)
    }

    function handleLogout() {
      authApi.logout()
      currentUser.value = null
      isAuthOpen.value = false
      showToast('Sesión cerrada correctamente')
    }

    async function handleBuyAgain(orderItems) {
      for (const item of orderItems) {
        const product = {
          id: item.product_id,
          name: item.products.name,
          price: item.products.price,
          image_url: item.products.image_url,
          selectedSize: item.size
        }

        await addToCart(product)
      }

      isAuthOpen.value = false
      isCartOpen.value = true
      showToast('Productos añadidos al carrito')
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
      const el = document.getElementById('explora')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    onMounted(async () => {
      window.addEventListener('scroll', handleScroll)
      await fetchProducts()
      await checkAuth()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(toastTimer)
    })

    return {
      products,
      productsError,
      cartItems,
      cartCount,
      cartTotal,
      currentUser,
      isCartOpen,
      isCheckoutOpen,
      isSuccessOpen,
      isAuthOpen,
      isScrolled,
      activeCategory,
      selectedStyle,
      toastVisible,
      toastMessage,
      authOverlayMessage,
      addToCart,
      removeFromCart,
      updateQty,
      selectCategory,
      closeExplore,
      selectGlobalFilter,
      fetchProducts,
      authApi,
      handlePaymentSuccess,
      handleLoginSuccess,
      handleLogout,
      handleCheckout,
      handleBuyAgain
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

/* --- Products error banner --- */
.products-error {
  position: fixed;
  top: 121px; /* 36 (announcement) + 85 (navbar) */
  left: 0;
  right: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(180, 60, 60, 0.95);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.products-error__retry {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast);
}

.products-error__retry:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
}

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
