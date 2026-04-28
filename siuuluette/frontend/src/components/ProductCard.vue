<template>
  <!-- ==========================================
       SIUULUETTE — ProductCard Component
       Card individual con quick-add y link a la ficha.
       Toda la card es clickable hacia /producto/:slug,
       excepto los controles de quick-add que paran la propagación.
       ========================================== -->
  <router-link
    :to="productLink"
    class="product-card-link"
    custom
    v-slot="{ navigate }"
  >
    <article
      class="product-card"
      :class="{ 
        'product-card--added': justAdded,
        'has-secondary': product.image_secondary_url || product.imageSecondary 
      }"
      @click="navigate"
    >

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

        <!-- Badges -->
        <span
          v-if="product.discount_percent > 0"
          class="badge badge-sale product-card__badge"
        >-{{ product.discount_percent }}%</span>

        <span
          v-else-if="product.badge"
          class="badge product-card__badge"
          :class="`badge-${product.badgeType}`"
        >{{ product.badge }}</span>
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
  </router-link>
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
      if (!s) return ['S', 'M', 'L', 'XL']
      if (Array.isArray(s)) return s.map(item => String(item).replace(/['"]/g, '').trim()).filter(Boolean)
      if (typeof s === 'string') {
        return s.split(',').map(item => item.replace(/['"]/g, '').trim()).filter(Boolean)
      }
      return ['S', 'M', 'L', 'XL']
    })

    // Link a la ficha — usa slug si existe, fallback a id por compatibilidad
    const productLink = computed(() => {
      if (props.product.slug) return { name: 'product-detail', params: { slug: props.product.slug } }
      return { name: 'home' } // Sin slug no podemos navegar; nos quedamos en home
    })

    return { availableSizes, productLink }
  },
  methods: {
    handleAdd() {
      if (!this.selectedSize) return

      this.$emit('add-to-cart', {
        ...this.product,
        priceNet: this.product.price_net || this.product.priceNet || 0,
        variant_id: this.product.variants?.[0]?.id || null,
        selectedSize: this.selectedSize
      })
      this.justAdded = true
      this.selectedSize = null

      setTimeout(() => {
        this.justAdded = false
      }, 1500)
    }
  }
}
</script>

<style scoped>
.product-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

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

.product-card:hover .product-card__image {
  transform: scale(1.06);
}

.product-card.has-secondary:hover .product-card__image--primary {
  opacity: 0;
}

.product-card.has-secondary:hover .product-card__image--secondary {
  opacity: 1;
}

/* Badge */
.product-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
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
