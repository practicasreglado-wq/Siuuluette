<template>
  <section class="sales" id="ofertas">
    <div class="sales__inner">
      
      <!-- Header -->
      <div class="sales__header">
        <div class="sales__eyebrow">
          <span class="sales__dot"></span>
          <span class="label">Oportunidad Única — Unidades Limitadas</span>
        </div>
        <h2 class="sales__title">OFF-SEASON<br/><em>SELECTION</em></h2>
        <p class="sales__desc">
          Piezas exclusivas de colecciones anteriores con precios especiales. 
          Calidad innegociable, diseño atemporal.
        </p>
      </div>

      <!-- Grid de Ofertas o Mensaje de "Próximamente" -->
      <div v-if="saleProducts.length > 0" class="sales__grid">
        <ProductCard 
          v-for="product in saleProducts" 
          :key="product.id" 
          :product="product"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </div>

      <div v-else class="sales__empty">
        <div class="sales__empty-card">
          <span class="body-sm">SIN REBAJAS ACTIVAS</span>
          <h3>Preparando la selección</h3>
          <p>Nuestra sección de descuentos se renueva constantemente. Muy pronto añadiremos nuevas piezas exclusivas a precios especiales. Mantente atento.</p>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'

export default {
  name: 'SalesSection',
  components: { ProductCard },
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  emits: ['add-to-cart'],
  setup(props) {
    const saleProducts = computed(() => {
      // Filtramos productos que tengan un descuento mayor a 0
      return props.products.filter(p => p.discount_percent > 0)
    })

    return { saleProducts }
  }
}
</script>

<style scoped>
.sales {
  background: var(--c-dark);
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

.sales__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.sales__header {
  margin-bottom: 4rem;
  max-width: 600px;
}

.sales__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sales__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-gold);
  box-shadow: 0 0 15px var(--c-gold);
}

.sales__title {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 7vw, 6rem);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--c-white);
  margin-bottom: 1.5rem;
}

.sales__title em {
  font-style: normal;
  color: var(--c-gold);
}

.sales__desc {
  color: var(--c-grey);
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.6;
}

.sales__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.sales__empty {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.sales__empty-card {
  max-width: 500px;
  text-align: center;
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
}

.sales__empty-card span {
  color: var(--c-gold);
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
  display: block;
}

.sales__empty-card h3 {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--c-white);
  margin-bottom: 1rem;
}

.sales__empty-card p {
  color: var(--c-grey);
  font-size: 1rem;
  line-height: 1.6;
}

/* Decoración de fondo */
.sales::after {
  content: 'SALE';
  position: absolute;
  bottom: -50px;
  right: -20px;
  font-family: var(--font-display);
  font-size: 25rem;
  color: rgba(255, 255, 255, 0.02);
  line-height: 1;
  pointer-events: none;
  z-index: 1;
}

@media (max-width: 768px) {
  .sales { padding: 60px 0; }
  .sales__header { text-align: center; margin: 0 auto 3rem; }
  .sales__eyebrow { justify-content: center; }
  .sales__grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
}
</style>
