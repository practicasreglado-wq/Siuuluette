<template>
  <div class="explore-view" :class="{ 'active': styleName }">
    <div class="container">
      
      <!-- Back Button -->
      <button class="explore-view__back" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Volver al inicio</span>
      </button>

      <div class="explore-view__header">
        <div class="explore-view__title-block">
          <span class="label accent-color">{{ styleName }} Selection</span>
          <h2 class="display-md">{{ styleName }}</h2>
        </div>

        <!-- Sub-filters -->
        <div class="explore-view__filters">
          <button 
            v-for="type in types" 
            :key="type"
            class="filter-pill"
            :class="{ active: activeType === type }"
            @click="activeType = type"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Results Info -->
      <div class="explore-view__meta">
        <span class="label">{{ filteredProducts.length }} productos encontrados</span>
      </div>

      <!-- Grid -->
      <div v-if="filteredProducts.length === 0" class="explore-view__empty">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h3>Sin resultados</h3>
          <p>No hemos encontrado productos de este tipo en la selección {{ styleName }}.</p>
          <button class="btn btn-sm btn-outline" @click="activeType = 'Todo'">Ver toda la selección</button>
        </div>
      </div>

      <TransitionGroup 
        v-else 
        name="staggered-grid" 
        tag="div" 
        class="explore-view__grid"
      >
        <ProductCard 
          v-for="(product, index) in displayProducts" 
          :key="product.id"
          :product="product"
          :style="{ '--index': index }"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </TransitionGroup>

      <!-- View More -->
      <div class="explore-view__footer" v-if="hasMore">
        <button class="btn btn-outline" @click="showAll = true">
          Ver más productos
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import ProductCard from './ProductCard.vue'

export default {
  name: 'CategoryExplore',
  components: { ProductCard },
  props: {
    styleName: { type: String, default: '' },
    products: { type: Array, required: true }
  },
  emits: ['close', 'add-to-cart'],
  setup(props) {
    const activeType = ref('Todo')
    const showAll = ref(false)
    const types = ['Todo', 'Camisetas', 'Sudaderas', 'Pantalones']

    const filteredProducts = computed(() => {
      // 1. Filtro por Colección (Ultra-robusto)
      let list = props.products.filter(p => {
        const normalize = (str) => (str || '').toLowerCase().replace(/[- ]/g, '').trim()
        return normalize(p.collection || p.style) === normalize(props.styleName)
      })
      
      // 2. Filtro por Tipo (Camisetas, Sudaderas, etc)
      if (activeType.value !== 'Todo') {
        list = list.filter(p => {
          const pCat = (p.category || '').toLowerCase().trim()
          const aType = activeType.value.toLowerCase().trim()
          
          // Lógica inteligente: Sudaderas (UI) debe coincidir con Sudadera (DB)
          // Quitamos la 's' final en ambos para comparar la raíz
          const rootMatch = (s) => s.endsWith('s') ? s.slice(0, -1) : s
          return rootMatch(pCat) === rootMatch(aType)
        })
      }
      
      return list
    })

    const displayProducts = computed(() => {
      if (showAll.value) return filteredProducts.value
      return filteredProducts.value.slice(0, 4)
    })

    const hasMore = computed(() => {
      return filteredProducts.value.length > 4 && !showAll.value
    })

    // Reset showAll when type or style changes
    watch(() => activeType.value, () => {
      showAll.value = false
    })
    watch(() => props.styleName, () => {
      showAll.value = false
      activeType.value = 'Todo'
    })

    return {
      activeType,
      types,
      filteredProducts,
      displayProducts,
      hasMore,
      showAll
    }
  }
}
</script>

<style scoped>
.explore-view {
  position: fixed;
  inset: 0;
  background: var(--c-black);
  z-index: 1000;
  overflow-y: auto;
  padding: 8rem 0 4rem;
  visibility: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s var(--ease-standard);
}

.explore-view.active {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.explore-view__back {
  position: absolute;
  top: 7rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  color: var(--c-white);
  cursor: pointer;
  transition: color var(--t-medium);
  z-index: 10;
}

.explore-view__back:hover {
  color: var(--c-gold);
}

.explore-view__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.explore-view__title-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accent-color { color: var(--c-gold); }

.explore-view__filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 0.6rem 1.4rem;
  border-radius: 100px;
  border: 1px solid rgba(92, 82, 72, 0.15);
  background: rgba(92, 82, 72, 0.05);
  color: var(--c-grey);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all var(--t-medium);
}

.filter-pill:hover {
  border-color: rgba(92, 82, 72, 0.4);
  color: var(--c-white);
}

.filter-pill.active {
  background: var(--c-gold);
  border-color: var(--c-gold);
  color: var(--c-black);
}

.explore-view__meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(92, 82, 72, 0.12);
  color: var(--c-grey);
}

.explore-view__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.explore-view__empty {
  padding: 6rem 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--c-grey);
}

.empty-state h3 {
  color: var(--c-white);
  font-family: var(--font-display);
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-state p {
  max-width: 400px;
  margin-bottom: 1rem;
}

.explore-view__footer {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
}

/* Staggered entry animation */
.staggered-grid-enter-active {
  transition: all 0.6s var(--ease-standard);
  transition-delay: calc(var(--index) * 0.05s);
}

.staggered-grid-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

@media (max-width: 1024px) {
  .explore-view__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .explore-view__grid { grid-template-columns: repeat(2, 1fr); }
  .explore-view__header { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .explore-view__grid { grid-template-columns: 1fr; }
  .explore-view { padding-top: 6rem; }
  .explore-view__back { top: 2rem; left: 1.5rem; }
}
</style>
