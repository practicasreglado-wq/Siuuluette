<template>
  <!-- ==========================================
       SIUULUETTE — ProductCard Component
       Individual product card with add-to-cart
       ========================================== -->
  <article class="product-card" :class="{ 'product-card--added': justAdded }">

    <!-- Image Area -->
    <div class="product-card__image-wrap">
      <img
        :src="product.image_url || product.image || '/placeholder.jpg'"
        :alt="product.name"
        class="product-card__image product-card__image--primary"
        loading="lazy"
      />
      <img
        v-if="product.image_secondary_url || product.imageSecondary"
        :src="product.image_secondary_url || product.imageSecondary"
        :alt="product.name"
        class="product-card__image product-card__image--secondary"
        loading="lazy"
      />

      <!-- Badge -->
      <span
        v-if="product.badge"
        class="badge product-card__badge"
        :class="`badge-${product.badgeType}`"
      >{{ product.badge }}</span>

      <!-- Quick Add Overlay -->
      <div class="product-card__overlay">
        <button
          class="product-card__quick-add btn btn-primary"
          :class="{ 'btn-disabled': !selectedSize && !justAdded }"
          @click.stop="handleAdd"
        >
          {{ justAdded ? '✓ Añadido' : (selectedSize ? 'Añadir al carrito' : 'Elige talla') }}
        </button>
        <div class="product-card__sizes">
          <span
            v-for="size in availableSizes"
            :key="size"
            class="product-card__size"
            :class="{ 'is-selected': selectedSize === size }"
            @click.stop="selectedSize = size"
          >{{ size }}</span>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="product-card__info">
      <span class="product-card__category body-sm">{{ product.category }}</span>
      <h3 class="product-card__name">{{ product.name }}</h3>

      <div class="product-card__pricing">
        <span class="product-card__price">€{{ product.price }}</span>
        <span v-if="product.originalPrice" class="product-card__original">€{{ product.originalPrice }}</span>
      </div>
    </div>

  </article>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ProductCard',
  emits: ['add-to-cart'],
  props: {
    product: { type: Object, required: true }
  },
  data() {
    return { 
      justAdded: false,
      selectedSize: null
    }
  },
  setup(props) {
    // Procesamos las tallas dinámicamente
    const availableSizes = computed(() => {
      const s = props.product.sizes
      if (!s) return ['S', 'M', 'L', 'XL'] // Fallback por defecto
      
      // Si ya es un array (desde Supabase _text), lo devolvemos
      if (Array.isArray(s)) return s.map(item => String(item).replace(/['"]/g, '').trim()).filter(Boolean)
      
      // Si es una string ("S, M, L"), lo partimos por las comas
      if (typeof s === 'string') {
        return s.split(',').map(item => item.replace(/['"]/g, '').trim()).filter(Boolean)
      }
      
      return ['S', 'M', 'L', 'XL']
    })

    return { availableSizes }
  },
  methods: {
    handleAdd() {
      if (!this.selectedSize) return
      
      this.$emit('add-to-cart', {
        ...this.product,
        selectedSize: this.selectedSize
      })
      this.justAdded = true
      this.selectedSize = null
      
      // Reset success feedback after a short delay
      setTimeout(() => { 
        this.justAdded = false 
      }, 1500)
    }
  }
}
</script>

<style scoped>
.product-card {
  background: var(--c-dark);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--t-medium) var(--ease-standard),
              box-shadow var(--t-medium);
  border: 1px solid transparent;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(92, 82, 72, 0.12);
}

/* Image */
.product-card__image-wrap {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: var(--c-dark-2);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--t-slow) var(--ease-standard),
              opacity var(--t-medium) var(--ease-standard);
}

.product-card__image--secondary {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.product-card:hover .product-card__image--primary {
  opacity: 0;
  transform: scale(1.06);
}

.product-card:hover .product-card__image--secondary {
  opacity: 1;
  transform: scale(1.06);
}

/* Badge */
.product-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

/* Overlay */
.product-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(92, 82, 72, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity var(--t-medium);
  z-index: 3;
}

.product-card:hover .product-card__overlay {
  opacity: 1;
}

.product-card__quick-add {
  transform: translateY(10px);
  transition: transform var(--t-medium) var(--ease-standard),
              background var(--t-fast);
  min-width: 180px;
}

.product-card:hover .product-card__quick-add {
  transform: translateY(0);
}

.product-card--added .product-card__quick-add {
  background: #2e7d32;
  color: #fff;
}

/* Size pills */
.product-card__sizes {
  display: flex;
  gap: 0.4rem;
  transform: translateY(10px);
  transition: transform var(--t-medium) 0.05s var(--ease-standard);
}

.product-card:hover .product-card__sizes {
  transform: translateY(0);
}

.product-card__size {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: background var(--t-fast), border-color var(--t-fast);
  cursor: pointer;
}

.product-card__size:hover,
.product-card__size.is-selected {
  background: var(--c-gold) !important;
  color: var(--c-black) !important;
  border-color: var(--c-gold) !important;
  transform: scale(1.1);
}

/* Info */
.product-card__info {
  padding: 1rem 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.product-card__category {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-grey);
}

.product-card__name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--c-white);
  line-height: 1.3;
}

.product-card__pricing {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-top: 0.3rem;
}

.product-card__price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-off-white);
}

.product-card__original {
  font-size: 0.8rem;
  color: var(--c-grey);
  text-decoration: line-through;
}
</style>
