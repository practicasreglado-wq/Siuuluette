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
            <div class="summary-row" v-for="item in items" :key="item.id">
              <span class="body-sm">{{ item.name }} x{{ item.quantity }}</span>
              <span class="body-sm">€{{ item.price * item.quantity }}</span>
            </div>
            <div class="divider"></div>
            <div class="summary-total">
              <span class="label">Total a pagar</span>
              <span class="total-price">€{{ total }}</span>
            </div>
          </div>

          <!-- Stripe Form -->
          <form id="payment-form" @submit.prevent="handleSubmit" class="payment-form">
            <div id="link-authentication-element"></div>
            
            <!-- Shipping Form -->
            <div class="shipping-form">
              <h3 class="label-xs uppercase tracking-widest mb-4 opacity-60">Dirección de Envío</h3>
              <div class="form-group">
                <input v-model="shipping.address" type="text" placeholder="Calle y número" required class="form-input">
              </div>
              <div class="form-row">
                <input v-model="shipping.city" type="text" placeholder="Ciudad" required class="form-input">
                <input v-model="shipping.zip" type="text" placeholder="Código Postal" required class="form-input">
              </div>
            </div>

            <div class="divider mb-6"></div>

            <div id="payment-element"></div>
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button 
              id="submit" 
              class="btn btn-primary w-full" 
              :disabled="loading || !stripeLoaded"
            >
              <span v-if="loading" class="loader"></span>
              <span v-else>Pagar ahora €{{ total }}</span>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { checkoutApi } from '../api/index.js'

export default {
  name: 'CheckoutOverlay',
  props: {
    isOpen: Boolean,
    items: { type: Array, default: () => [] },
    total: { type: [String, Number], default: 0 }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const stripeLoaded = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')
    const clientSecret = ref('')
    const shipping = reactive({
      address: '',
      city: '',
      zip: ''
    })
    let stripe = null
    let elements = null

    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

    async function initStripe() {
      if (!props.isOpen || stripeLoaded.value) return

      try {
        stripe = await loadStripe(stripeKey)
        
        // 1. Crear Intent en el backend
        const cartItems = props.items.map(i => ({ id: i.id, quantity: i.quantity }))
        const { clientSecret: secret } = await checkoutApi.createIntent({ 
          items: cartItems,
          totalAmount: props.total 
        })
        clientSecret.value = secret

        // 2. Montar elementos
        const appearance = {
          theme: 'night',
          variables: {
            colorPrimary: '#c5a36a', // Gold
            colorBackground: '#1c1917', // Dark brown
            colorText: '#f5f5f4',
            colorDanger: '#ef4444',
            fontFamily: 'Outfit, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        }

        elements = stripe.elements({ appearance, clientSecret: clientSecret.value })

        const paymentElementOptions = { layout: "tabs" }
        const paymentElement = elements.create("payment", paymentElementOptions)
        paymentElement.mount("#payment-element")

        stripeLoaded.value = true
      } catch (err) {
        console.error('Stripe Init Error:', err)
        errorMessage.value = `Error: ${err.message || 'No se pudo inicializar el sistema de pagos'}. Verifica la consola del navegador.`
      }
    }

    async function handleSubmit() {
      if (!stripe || !elements) return
      loading.value = true
      errorMessage.value = ''

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/success',
          shipping: {
            name: 'Cliente Siuuluette', // Podríamos coger el nombre del perfil
            address: {
              line1: shipping.address,
              city: shipping.city,
              postal_code: shipping.zip,
              country: 'ES'
            }
          }
        },
        redirect: 'if_required' // Importante para manejar modales 3DS sin redirigir
      })

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          errorMessage.value = error.message
        } else {
          errorMessage.value = "Ocurrió un error inesperado al procesar el pago."
        }
      } else {
        // Pago completado con éxito sin redirección (o ya manejada)
        
        // --- GUARDAR EN DB ---
        try {
          // Buscamos el ID del payment intent en Elements
          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret.value)
          
          await checkoutApi.confirmOrder({
            paymentIntentId: paymentIntent.id,
            shippingAddress: shipping,
            items: props.items,
            totalAmount: props.total
          })
          
          emit('success')
          emit('close')
        } catch (dbErr) {
          console.error('Error guardando pedido:', dbErr)
          errorMessage.value = 'El pago se realizó, pero hubo un error al guardar el pedido. Contacta con soporte.'
        }
      }

      loading.value = false
    }

    function handleClose() {
      if (!loading.value) emit('close')
    }

    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        // Pequeño delay para asegurar que el DOM está listo para montar el elemento
        setTimeout(initStripe, 100)
      } else {
        stripeLoaded.value = false
      }
    })

    return {
      stripeLoaded,
      loading,
      errorMessage,
      shipping,
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
  padding: 4rem 2rem; /* Más espacio arriba y abajo */
  overflow-y: auto; /* Habilitar scroll */
  align-items: flex-start; /* Empezar desde arriba */
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
  margin-bottom: 0.5rem;
  color: var(--c-grey);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
}

.total-price {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--c-gold);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.shipping-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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

.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: 0.1em; }
.opacity-60 { opacity: 0.6; }

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
