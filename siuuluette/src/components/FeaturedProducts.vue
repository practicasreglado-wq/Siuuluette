<template>
  <!-- ==========================================
       SIUULUETTE — Featured Products Section
       8-product grid with filters
       ========================================== -->
  <section class="featured section">
    <div class="container">

      <div class="featured__header">
        <div class="featured__title-block">
          <span class="accent-line"></span>
          <span class="label">Colección actual</span>
          <h2 class="display-md featured__title">Productos destacados</h2>
        </div>

        <!-- Filter tabs -->
        <div class="featured__filters" role="tablist" aria-label="Filtrar por categoría">
          <button
            v-for="filter in filters"
            :key="filter"
            class="featured__filter"
            :class="{ active: activeFilter === filter }"
            role="tab"
            :aria-selected="activeFilter === filter"
            @click="activeFilter = filter"
          >{{ filter }}</button>
        </div>
      </div>

      <!-- Products Grid -->
      <TransitionGroup name="product-grid" tag="div" class="featured__grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </TransitionGroup>

      <!-- View All CTA -->
      <div class="featured__footer">
        <button class="btn btn-outline">
          Ver todos los productos
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </div>
  </section>
</template>

<script>
import ProductCard from './ProductCard.vue'

export default {
  name: 'FeaturedProducts',
  components: { ProductCard },
  emits: ['add-to-cart'],
  props: {
    products: { type: Array, required: true }
  },
  data() {
    return {
      activeFilter: 'Todo',
      filters: ['Todo', 'Camisetas', 'Sudaderas', 'Pantalones', 'Chaquetas', 'Accesorios', 'Ediciones Limitadas'],
    }
  },
  computed: {
    filteredProducts() {
      if (this.activeFilter === 'Todo') return this.products
      return this.products.filter(p => p.category === this.activeFilter)
    }
  }
}
</script>

<style scoped>
.featured {
  background: var(--c-black);
}

/* Header */
.featured__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.featured__title-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.featured__title { color: var(--c-white); }

/* Filter Pills */
.featured__filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.featured__filter {
  padding: 0.5rem 1.1rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: var(--c-grey);
  cursor: pointer;
  transition: all var(--t-fast);
}

.featured__filter:hover {
  border-color: rgba(255,255,255,0.3);
  color: var(--c-light);
}

.featured__filter.active {
  background: var(--c-gold);
  border-color: var(--c-gold);
  color: var(--c-black);
}

/* Grid */
.featured__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* Footer */
.featured__footer {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
}

/* Grid transition */
.product-grid-enter-active,
.product-grid-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.product-grid-enter-from,
.product-grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 1100px) {
  .featured__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .featured__grid { grid-template-columns: repeat(2, 1fr); }
  .featured__header { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 420px) {
  .featured__grid { grid-template-columns: 1fr; }
}
</style>
