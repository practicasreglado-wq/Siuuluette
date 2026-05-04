<template>
  <Transition name="fade-overlay">
    <div v-if="isOpen" class="checkout-overlay" @click.self="handleClose">
      <div class="checkout-card">
        
        <!-- Header -->
        <div class="checkout-card__header">
          <h2 class="display-sm">Finalizar Pedido</h2>
          <button class="close-btn" @click="handleClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="checkout-card__content">
          <!-- Order Summary -->
          <div class="order-summary">
            <div class="summary-row" v-for="item in items" :key="item.cartItemId || item.id">
              <div class="summary-item-details">
                <span class="body-sm">{{ item.name }} x{{ item.qty }}</span>
                <p class="summary-item-meta label-xs opacity-60">{{ item.selectedSize }} | {{ item.color }}</p>
              </div>
              <span class="body-sm">€{{ Number(item.price * item.qty).toFixed(2) }}</span>
            </div>
            <div class="divider"></div>
            <div class="summary-total">
              <div class="summary-total-info">
                <span class="label-highlight">Total a pagar</span>
                <p class="summary-net label-xs opacity-60">Base imponible (sin IVA): €{{ Number(netTotal).toFixed(2) }}</p>
              </div>
              <span class="total-price">€{{ Number(total).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Stripe Form -->
          <form id="payment-form" @submit.prevent="handleSubmit" class="payment-form">
            <div id="link-authentication-element"></div>
            
            <!-- Stripe Address Element (Autocomplete & Validation) -->
            <div class="shipping-section">
              <h3 class="section-label">Dirección de Envío</h3>
              <div id="address-element"></div>
            </div>

            <div class="divider"></div>

            <div class="payment-section">
              <h3 class="section-label">Método de Pago</h3>
              <div id="payment-element"></div>
            </div>
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button 
              id="submit" 
              class="btn btn-primary w-full" 
              :disabled="loading || !stripeLoaded"
            >
              <span v-if="loading" class="loader"></span>
              <span v-else>Pagar ahora €{{ Number(total).toFixed(2) }}</span>
            </button>
          </form>
          
          <div class="secure-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span class="label-xs">Pago seguro procesado por Stripe</span>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { checkoutApi, authApi } from '../api/index.js'

export default {
  name: 'CheckoutOverlay',
  props: {
    isOpen: Boolean,
    items: { type: Array, default: () => [] },
    total: { type: [String, Number], default: 0 },
    netTotal: { type: [String, Number], default: 0 },
    currentUser: { type: Object, default: null }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const stripeLoaded = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')
    let stripe = null
    let elements = null
    let paymentElement = null
    let addressElement = null

    async function initStripe() {
      if (!props.isOpen) return

      try {
        const stripeModule = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
        if (!stripeModule) return
        stripe = stripeModule

        const { clientSecret } = await checkoutApi.createIntent({ 
          items: props.items,
          totalAmount: props.total 
        })
        
        elements = stripe.elements({ 
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#c5a36a',
              colorBackground: '#1c1917',
              colorText: '#f5f5f4',
              colorTextSecondary: '#d1d1d1',
              colorDanger: '#ef4444',
              fontFamily: 'Outfit, sans-serif',
              borderRadius: '12px',
            }
          }
        })

        paymentElement = elements.create('payment', {
          layout: 'tabs',
        })
        paymentElement.mount('#payment-element')

        // Procesar dirección guardada
        let savedAddr = props.currentUser?.shipping_address
        if (typeof savedAddr === 'string') {
          try { savedAddr = JSON.parse(savedAddr) } catch (e) { savedAddr = null }
        }

        // Address Element
        addressElement = elements.create('address', {
          mode: 'shipping',
          allowedCountries: ['ES', 'FR', 'IT', 'PT', 'DE', 'GB', 'US'],
          defaultValues: {
            name: props.currentUser?.username || '',
            address: {
              line1: savedAddr?.line1 || '',
              line2: savedAddr?.line2 || '',
              city: savedAddr?.city || '',
              state: savedAddr?.state || '',
              postal_code: savedAddr?.postal_code || '',
              country: savedAddr?.country || 'ES',
            }
          },
          fields: { phone: 'always' },
          validation: { phone: { required: 'never' } }
        })

        await nextTick()
        const addrContainer = document.getElementById('address-element')
        if (addrContainer) {
          addressElement.mount('#address-element')
        }

        stripeLoaded.value = true
      } catch (err) {
        console.error('Stripe Init Error:', err)
        errorMessage.value = 'No se pudo cargar el sistema de pagos'
      }
    }

    async function handleSubmit() {
      if (!stripe || !elements) return
      loading.value = true
      errorMessage.value = ''

      try {
        const { complete, value } = await addressElement.getValue()
        if (!complete) {
          errorMessage.value = 'Por favor, completa la dirección de envío'
          loading.value = false
          return
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/success',
          },
          redirect: 'if_required'
        })

        if (error) {
          errorMessage.value = error.message
        } else if (paymentIntent.status === 'succeeded') {
          const confirmRes = await checkoutApi.confirmOrder({
            paymentIntentId: paymentIntent.id,
            shippingAddress: {
              ...value.address,
              name: value.name || props.currentUser?.username || '',
              email: props.currentUser?.email || ''
            },
            items: props.items,
            totalAmount: props.total
          })

          let updatedUser = props.currentUser
          if (props.currentUser) {
            try {
              const res = await authApi.updateProfile({
                shipping_address: {
                  line1: value.address.line1,
                  line2: value.address.line2,
                  city: value.address.city,
                  state: value.address.state,
                  postal_code: value.address.postal_code,
                  country: value.address.country
                }
              })
              if (res.profile) {
                updatedUser = res.profile
              }
            } catch (err) {
              console.error('Error auto-guardado dirección:', err)
            }
          }

          emit('order-complete')
          emit('success', updatedUser)
          handleClose()
        }
      } catch (err) {
        console.error('Submit Error:', err)
        errorMessage.value = err.message || 'Error al procesar el pedido'
      } finally {
        loading.value = false
      }
    }

    function handleClose() {
      if (loading.value) return
      
      stripeLoaded.value = false
      stripe = null
      elements = null
      paymentElement = null
      addressElement = null
      
      emit('close')
    }

    watch(() => props.isOpen, async (newVal) => {
      if (newVal) {
        await nextTick()
        initStripe()
      } else {
        // Si el padre lo cierra, solo limpiamos pero no volvemos a emitir
        stripeLoaded.value = false
        stripe = null
        elements = null
        paymentElement = null
        addressElement = null
      }
    })

    return {
      stripeLoaded,
      loading,
      errorMessage,
      handleSubmit,
      handleClose
    }
  }
}
</script>

<style scoped>
.checkout-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 10, 9, 0.85);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  padding: 4rem 2rem;
  overflow-y: auto;
  align-items: flex-start;
}

.checkout-card {
  background: #1c1917;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  border: 1px solid rgba(197, 163, 106, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slide-up 0.4s ease-out;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.shipping-section {
  padding-bottom: 0.5rem;
}

.payment-section {
  padding-top: 0.5rem;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 1.5rem 0;
}

.checkout-card__header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.display-sm {
  color: #f5f5f4 !important;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--c-grey);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover { background: rgba(255, 255, 255, 0.05); color: var(--c-white); }

.checkout-card__content {
  padding: 2rem;
}

.order-summary {
  background: rgba(255, 255, 255, 0.02);
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.summary-row span {
  color: var(--c-black) !important; /* Forzamos el crema claro */
  font-weight: 500;
}

.summary-item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item-meta {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-black) !important; /* Cambiado a crema claro para máxima visibilidad */
  font-weight: 600;
  font-size: 0.7rem;
  opacity: 0.8;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.5rem;
}

.summary-total-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-net {
  font-size: 0.65rem;
  color: var(--c-grey);
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.total-price {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--c-black) !important;
  letter-spacing: 0.02em;
}

.payment-form {
  display: flex;
  flex-direction: column;
}

.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: #f5f5f4;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--c-gold);
  background: rgba(255, 255, 255, 0.08);
}

.form-group {
  width: 100%;
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 1.25rem;
  color: var(--c-accent-vibrant);
  font-weight: 700;
  text-shadow: 0 0 10px var(--c-accent-glow);
}

.label-highlight {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-black);
}

.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: 0.1em; }

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.secure-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: var(--c-grey);
  opacity: 0.6;
}

/* Transitions */
.fade-overlay-enter-active,
.fade-overlay-leave-active { transition: opacity 0.3s; }
.fade-overlay-enter-from,
.fade-overlay-leave-to { opacity: 0; }

.w-full { width: 100%; }

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
