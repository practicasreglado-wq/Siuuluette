<template>
  <!-- ==========================================
       SIUULUETTE — Home View
       Página principal con todas las secciones del catálogo.
       ========================================== -->
  <div class="home-view">

    <!-- Banner de error de productos -->
    <div class="products-error" v-if="productsError">
      <span>{{ productsError }}</span>
      <button class="products-error__retry" @click="fetchProducts">Reintentar</button>
    </div>

    <HeroSection id="inicio" />
    <CategoryGrid id="explora" @category-select="selectCategory" />
    <LimitedDrop id="drops" @add-to-cart="addToCart" />
    <BrandValues id="nosotros" />

    <!-- Overlay de exploración por estilo -->
    <CategoryExplore
      :style-name="selectedStyle"
      :products="products"
      @close="closeExplore"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { productsApi } from '../api/index.js'
import { useCart } from '../composables/useCart.js'

import HeroSection       from '../components/HeroSection.vue'
import CategoryGrid      from '../components/CategoryGrid.vue'
import LimitedDrop       from '../components/LimitedDrop.vue'
import BrandValues       from '../components/BrandValues.vue'
import CategoryExplore   from '../components/CategoryExplore.vue'

export default {
  name: 'HomeView',
  components: {
    HeroSection, CategoryGrid, LimitedDrop,
    BrandValues, CategoryExplore
  },
  setup() {
    const { addToCart } = useCart()

    const products      = ref([])
    const productsError = ref('')
    const selectedStyle = ref('')

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

    function selectCategory(styleName) {
      selectedStyle.value = styleName
      document.body.style.overflow = 'hidden'
    }

    function closeExplore() {
      selectedStyle.value = ''
      document.body.style.overflow = ''
    }

    onMounted(fetchProducts)

    onUnmounted(() => {
      document.body.style.overflow = ''
    })

    return {
      products, productsError, selectedStyle,
      fetchProducts, addToCart,
      selectCategory, closeExplore,
    }
  }
}
</script>

<style scoped>
.home-view { display: block; }

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
</style>
