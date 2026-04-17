<template>
  <!-- ==========================================
       SIUULUETTE — Cart Sidebar
       Slide-in cart panel
       ========================================== -->
  <aside class="cart" role="dialog" aria-modal="true" aria-label="Carrito de compra">

    <!-- Header -->
    <div class="cart__header">
      <div class="cart__title-block">
        <h2 class="cart__title">Carrito</h2>
        <span class="cart__count" v-if="cartItems.length">{{ totalItems }} artículo{{ totalItems !== 1 ? 's' : '' }}</span>
      </div>
      <button class="cart__close" @click="$emit('close')" aria-label="Cerrar carrito">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="divider"></div>

    <!-- Empty state -->
    <div class="cart__empty" v-if="!cartItems.length">
      <div class="cart__empty-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <p>Tu carrito está vacío</p>
      <button class="btn btn-primary btn-sm" @click="$emit('close')">Explorar productos</button>
    </div>

    <!-- Items -->
    <div class="cart__items" v-else>
      <TransitionGroup name="cart-item" tag="div">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
        >
          <img :src="item.image" :alt="item.name" class="cart-item__img" />
          <div class="cart-item__info">
            <span class="cart-item__cat body-sm">{{ item.category }}</span>
            <h3 class="cart-item__name">{{ item.name }}</h3>
            <span class="cart-item__price">€{{ item.price }}</span>
          </div>
          <div class="cart-item__controls">
            <button class="qty-btn" @click="$emit('update-qty', item.id, -1)" aria-label="Quitar uno">−</button>
            <span class="cart-item__qty">{{ item.qty }}</span>
            <button class="qty-btn" @click="$emit('update-qty', item.id, 1)" aria-label="Añadir uno">+</button>
            <button class="cart-item__remove" @click="$emit('remove-item', item.id)" aria-label="Eliminar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Footer -->
    <div class="cart__footer" v-if="cartItems.length">
      <div class="divider"></div>
      <div class="cart__subtotal">
        <span class="cart__subtotal-label">Subtotal</span>
        <span class="cart__subtotal-price">€{{ subtotal }}</span>
      </div>
      <p class="cart__shipping-note">Envío calculado en el checkout</p>
      <button class="btn btn-primary cart__checkout">
        Finalizar compra
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
      <button class="btn btn-outline cart__continue" @click="$emit('close')">Seguir comprando</button>
    </div>

  </aside>
</template>

<script>
export default {
  name: 'CartSidebar',
  emits: ['close', 'remove-item', 'update-qty'],
  props: {
    cartItems: { type: Array, default: () => [] }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, i) => sum + i.qty, 0)
    },
    subtotal() {
      return this.cartItems.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(0)
    }
  }
}
</script>

<style scoped>
.cart {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 100vw;
  background: var(--c-dark);
  border-left: 1px solid rgba(255,255,255,0.06);
  z-index: 300;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.cart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  flex-shrink: 0;
}

.cart__title-block {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.cart__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-white);
}

.cart__count {
  font-size: 0.7rem;
  color: var(--c-grey);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cart__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.06);
  color: var(--c-light);
  cursor: pointer;
  border: none;
  transition: background var(--t-fast), color var(--t-fast);
}

.cart__close:hover { background: rgba(255,255,255,0.12); color: var(--c-white); }

/* Empty */
.cart__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  color: var(--c-grey);
  font-size: 0.9rem;
  text-align: center;
}

.cart__empty-icon { opacity: 0.2; }

/* Items */
.cart__items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.cart-item:last-child { border-bottom: none; }

.cart-item__img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--c-dark-2);
}

.cart-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.cart-item__cat { font-size: 0.65rem; }
.cart-item__name { font-size: 0.85rem; font-weight: 500; color: var(--c-white); line-height: 1.3; }
.cart-item__price { font-size: 0.9rem; font-weight: 600; color: var(--c-off-white); }

.cart-item__controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: var(--c-light);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--t-fast);
}

.qty-btn:hover { border-color: var(--c-gold); color: var(--c-gold); }

.cart-item__qty {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-white);
  min-width: 20px;
  text-align: center;
}

.cart-item__remove {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--c-grey);
  padding: 2px;
  display: flex;
  transition: color var(--t-fast);
}
.cart-item__remove:hover { color: #e57373; }

/* Footer */
.cart__footer {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  flex-shrink: 0;
  background: var(--c-dark);
}

.cart__subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
}

.cart__subtotal-label {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-grey);
}

.cart__subtotal-price {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--c-white);
  letter-spacing: 0.04em;
}

.cart__shipping-note {
  font-size: 0.72rem;
  color: var(--c-grey);
  text-align: center;
}

.cart__checkout { width: 100%; }
.cart__continue { width: 100%; }

/* Transitions */
.cart-item-enter-active,
.cart-item-leave-active { transition: all 0.3s var(--ease-standard); }
.cart-item-enter-from   { opacity: 0; transform: translateX(20px); }
.cart-item-leave-to     { opacity: 0; transform: translateX(-20px); height: 0; overflow: hidden; }
</style>
