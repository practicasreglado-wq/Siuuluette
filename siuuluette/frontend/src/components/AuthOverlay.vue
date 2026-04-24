<template>
  <Transition name="auth-fade">
    <div v-if="isOpen" class="auth-overlay" @click.self="$emit('close')">
      <div class="auth-card">
        
        <!-- Header -->
        <div class="auth-card__header">
          <div v-if="!currentUser" class="auth-tabs">
            <button 
              :class="['tab-btn', { active: mode === 'login' }]" 
              @click="mode = 'login'"
            >
              Iniciar Sesión
            </button>
            <button 
              :class="['tab-btn', { active: mode === 'register' }]" 
              @click="mode = 'register'"
            >
              Crear Cuenta
            </button>
          </div>
          <div v-else class="auth-tabs">
            <span v-if="view === 'profile'" class="tab-btn active">Mi Perfil</span>
            <span v-else-if="view === 'orders'" class="tab-btn active">Mis Pedidos</span>
            <span v-else class="tab-btn active">Mis Favoritos</span>
            
            <button v-if="view !== 'profile'" class="back-link-btn" @click="view = 'profile'">
              Volver
            </button>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="auth-card__content">
          <div v-if="currentUser && view === 'profile'" class="profile-view">
            <div class="profile-header">
              <div class="profile-avatar">
                {{ (currentUser.username || 'U').charAt(0).toUpperCase() }}
              </div>
              <h2 class="display-sm">{{ currentUser.username || 'Usuario' }}</h2>
              <p class="body-sm">{{ currentUser.email }}</p>
            </div>

            <div class="profile-actions">
              <button class="profile-btn w-full" @click="fetchOrders">
                Mis Pedidos
              </button>
              <button class="profile-btn w-full" @click="goToFavorites">
                Mis Favoritos
              </button>
              <button class="profile-btn w-full logout-btn" @click="$emit('logout')">
                Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- ORDERS VIEW -->
          <div v-else-if="currentUser && view === 'orders'" class="orders-view">
            <div v-if="loadingOrders" class="orders-loading">
              <div class="spinner"></div>
            </div>
            
            <div v-else-if="orders.length === 0" class="no-orders">
              <p class="body-md">Aún no has realizado ningún pedido.</p>
              <button class="btn btn-outline btn-sm" @click="$emit('close')">Explorar Tienda</button>
            </div>

            <div v-else class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="order-card__header">
                  <div class="order-info">
                    <span class="label-xs">PEDIDO #{{ order.id }}</span>
                    <span class="order-date">{{ formatDate(order.created_at) }}</span>
                  </div>
                  <span class="order-total">€{{ order.total_amount }}</span>
                </div>
                
                <div class="order-items">
                  <div v-for="item in order.order_items" :key="item.id" class="order-item">
                    <img :src="item.variant?.images?.[0]?.url || '/placeholder.jpg'" class="item-thumb">
                    <div class="item-details">
                      <p class="item-name">{{ item.variant?.product?.name || 'Producto' }}</p>
                      <p class="item-meta">
                        {{ item.variant?.color_name ? `Color: ${item.variant.color_name} | ` : '' }}
                        Talla: {{ item.size }} | {{ item.unit_price }}€
                      </p>
                    </div>
                  </div>
                </div>

                <!-- BUY AGAIN BUTTON -->
                <div class="order-card__footer">
                  <button class="buy-again-btn" @click="$emit('buy-again', order.order_items)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                    Comprar de nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- FAVORITES VIEW -->
          <div v-else-if="currentUser && view === 'favorites'" class="favorites-view">
            <div v-if="loadingFavorites" class="orders-loading">
              <div class="spinner"></div>
            </div>
            
            <div v-else-if="fullFavorites.length === 0" class="no-orders">
              <p class="body-md">No tienes productos en favoritos.</p>
              <button class="btn btn-outline btn-sm" @click="$emit('close')">Explorar Tienda</button>
            </div>

            <div v-else class="favorites-list">
              <div v-for="fav in fullFavorites" :key="fav.product_id" class="favorite-card">
                <div class="favorite-card__content">
                  <img :src="fav.products?.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg'" class="item-thumb">
                  <div class="item-details">
                    <p class="item-name">{{ fav.products?.name }}</p>
                    <p class="item-meta">€{{ fav.products?.price_gross }} | {{ fav.products?.category }}</p>
                  </div>
                </div>
                
                <div class="favorite-card__actions">
                  <button class="buy-btn" @click="goToProduct(fav.products.slug)">
                    Comprar
                  </button>
                  <button class="remove-fav-btn" @click="toggleFavorite(fav.product_id)" title="Quitar de favoritos">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="isRegistered" class="registration-success">
            <div class="check-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="display-sm">¡Registro casi listo!</h2>
            <p class="body-md">Hemos enviado un enlace de confirmación a <strong>{{ form.email }}</strong>.</p>
            <p class="body-sm subtitle">Por favor, pulsa el botón en el correo para activar tu cuenta antes de iniciar sesión.</p>
            <button class="btn btn-outline w-full" @click="resetToLogin">Volver al inicio</button>
          </div>
          <template v-else>
            <div v-if="message" class="auth-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ message }}</span>
            </div>
            <h2 class="display-sm">{{ mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a Siuuluette' }}</h2>
            <p class="body-sm subtitle">
              {{ mode === 'login' ? 'Accede a tu cuenta para gestionar tus pedidos.' : 'Crea tu perfil para una experiencia personalizada.' }}
            </p>
            <form @submit.prevent="handleSubmit" class="auth-form">
              <div v-if="mode === 'register'" class="form-group">
                <label class="label-xs">Nombre de usuario</label>
                <input 
                  v-model="form.username" 
                  type="text" 
                  placeholder="Ex: SiuuluetteUser" 
                  :required="mode === 'register'" 
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label class="label-xs">Email</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  required 
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label class="label-xs">Contraseña</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  class="form-input"
                >
              </div>
              <div v-if="mode === 'register'" class="form-group">
                <label class="label-xs">Teléfono (Opcional)</label>
                <input 
                  v-model="form.phone" 
                  type="tel" 
                  placeholder="+34 600 000 000" 
                  class="form-input"
                >
              </div>
              <div v-if="error" class="error-msg">{{ error }}</div>
              <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                <span v-if="loading" class="loader"></span>
                <span v-else>{{ mode === 'login' ? 'Entrar' : 'Registrarse' }}</span>
              </button>
            </form>
            <div class="auth-footer" v-if="mode === 'login'">
              <button class="text-link label-xs">¿Has olvidado tu contraseña?</button>
            </div>
          </template>
        </div>
        <div class="brand-bg">SIU</div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, reactive, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, checkoutApi } from '../api/index.js'
import { useFavorites } from '../composables/useFavorites.js'
import { loadStripe } from '@stripe/stripe-js'

export default {
  name: 'AuthOverlay',
  props: {
    isOpen: Boolean,
    currentUser: Object,
    message: { type: String, default: '' }
  },
  emits: ['close', 'login-success', 'logout', 'buy-again'],
  setup(props, { emit }) {
    const mode = ref('login')
    const view = ref('profile') // 'profile' or 'orders'
    const loading = ref(false)
    const loadingOrders = ref(false)
    const error = ref('')
    const isRegistered = ref(false)
    const orders = ref([])
    
    const form = reactive({
      email: '',
      password: '',
      username: '',
      phone: ''
    })

    const router = useRouter()
    const { fullFavorites, fetchFavorites: refreshFavs, toggleFavorite } = useFavorites()
    const loadingFavorites = ref(false)

    const goToFavorites = async () => {
      view.value = 'favorites'
      loadingFavorites.value = true
      try {
        await refreshFavs()
      } finally {
        loadingFavorites.value = false
      }
    }

    const goToProduct = (slug) => {
      emit('close')
      router.push({ name: 'product-detail', params: { slug } })
    }

    const fetchOrders = async () => {
      view.value = 'orders'
      loadingOrders.value = true
      try {
        const res = await checkoutApi.getHistory()
        orders.value = res.orders
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        loadingOrders.value = false
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      
      try {
        if (mode.value === 'login') {
          const data = await authApi.login({ 
            email: form.email, 
            password: form.password 
          })
          localStorage.setItem('token', data.token)
          emit('login-success', data.user)
          emit('close')
        } else {
          const data = await authApi.register({ ...form })
          
          if (data.token) {
            // Auto-login si no hace falta confirmar email
            localStorage.setItem('token', data.token)
            emit('login-success', data.user)
            emit('close')
          } else {
            // Mostrar pantalla de confirmación si hace falta
            isRegistered.value = true
          }
        }
      } catch (err) {
        error.value = err.message || 'Ocurrió un error en la autenticación'
      } finally {
        loading.value = false
      }
    }

    const resetToLogin = () => {
      isRegistered.value = false
      mode.value = 'login'
      error.value = ''
    }

    watch(mode, () => {
      error.value = ''
    })

    return {
      mode, view, form, loading, loadingOrders, error, isRegistered, orders, 
      fullFavorites, loadingFavorites,
      handleSubmit, resetToLogin, fetchOrders, formatDate,
      goToFavorites, goToProduct, toggleFavorite
    }
  }
}
</script>

<style scoped>
.profile-view {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  animation: auth-fade-in 0.5s ease-out;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: var(--c-gold);
  color: var(--c-black);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 700;
  font-family: 'Inter', system-ui, sans-serif;
  margin-bottom: 0.5rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f5f5f4;
  padding: 1rem;
  border-radius: 12px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.3s;
  cursor: pointer;
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--c-gold);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.logout-btn:hover {
  background: #ef4444;
  color: white;
}

.auth-notice {
  background: rgba(197, 163, 106, 0.15);
  border: 1px solid rgba(197, 163, 106, 0.4);
  color: #f3d09a; /* Oro más brillante */
  padding: 1.25rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  animation: noticeSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.display-sm {
  color: #f5f5f4 !important; /* Forzamos blanco premium */
}

@keyframes noticeSlideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.registration-success {
  text-align: center;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: auth-fade-in 0.5s ease-out;
}

.check-icon {
  width: 64px;
  height: 64px;
  background: rgba(197, 163, 106, 0.1);
  border: 1px solid var(--c-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-gold);
  margin: 0 auto;
}

.registration-success h2 {
  color: var(--c-white);
  letter-spacing: 0.05em;
}

.registration-success p {
  color: var(--c-grey);
}

.registration-success strong {
  color: var(--c-gold);
}

@keyframes auth-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 10, 9, 0.9);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  background: #1c1917;
  width: 100%;
  max-width: 550px;
  border-radius: 24px;
  border: 1px solid rgba(197, 163, 106, 0.15);
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: auth-slide-up 0.4s ease-out;
}

@keyframes auth-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.auth-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.auth-tabs {
  display: flex;
  gap: 1.5rem;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--c-grey);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding-bottom: 0.5rem;
  position: relative;
  transition: color 0.3s;
}

.tab-btn.active { color: var(--c-gold); }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--c-gold);
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

.auth-card__content {
  padding: 2.5rem 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subtitle { color: var(--c-grey); margin-top: -0.5rem; }

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: #f5f5f4; /* Blanco real para que se vea bien */
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-input:focus {
  outline: none;
  border-color: #c5a36a; /* Oro */
  background: rgba(255, 255, 255, 0.08);
}


.error-msg {
  color: #ef4444;
  font-size: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.auth-footer {
  text-align: center;
  margin-top: 0.5rem;
}

.text-link {
  background: transparent;
  border: none;
  color: var(--c-grey);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.text-link:hover { color: var(--c-white); }

.brand-bg {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  font-family: var(--font-display);
  font-size: 10rem;
  color: rgba(255, 255, 255, 0.02);
  pointer-events: none;
  z-index: -1;
}

/* Transitions */
.auth-fade-enter-active,
.auth-fade-leave-active { transition: opacity 0.3s; }
.auth-fade-enter-from,
.auth-fade-leave-to { opacity: 0; }

.w-full { width: 100%; }

/* Orders View Styles — Premium Update */
.orders-view {
  max-height: 550px;
  overflow-y: auto;
  padding: 0.5rem 1rem 1rem 0;
  scrollbar-width: thin;
  scrollbar-color: var(--c-gold) transparent;
}

.orders-view::-webkit-scrollbar {
  width: 4px;
}

.orders-view::-webkit-scrollbar-thumb {
  background: var(--c-gold);
  border-radius: 10px;
}

.order-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease, border-color 0.3s ease;
  text-align: left; /* Asegurar alineación izquierda */
}

.order-card:hover {
  border-color: rgba(197, 163, 106, 0.4);
  background: rgba(255, 255, 255, 0.06);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.order-info .label-xs {
  color: #f3d09a; /* Oro brillante para el ID */
  letter-spacing: 0.15em;
  font-weight: 600;
}

.order-date {
  font-size: 0.85rem;
  color: #e5e0d8; /* Blanco hueso para la fecha */
  font-weight: 500;
}

.order-total {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: #f5f5f4;
  line-height: 1;
}

.order-card__footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
}

.buy-again-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(197, 163, 106, 0.1);
  border: 1px solid rgba(197, 163, 106, 0.3);
  color: #f3d09a;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.buy-again-btn:hover {
  background: var(--c-gold);
  color: var(--c-black);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(197, 163, 106, 0.2);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.order-item {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.item-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f5f5f4;
  letter-spacing: 0.02em;
}

.item-meta {
  font-size: 0.8rem;
  color: #a89a8c; /* Gris cálido para detalles */
  font-weight: 400;
}

.back-link-btn {
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: #f3d09a;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-left: auto;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(197, 163, 106, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-link-btn:hover {
  background: rgba(197, 163, 106, 0.1);
  border-color: #f3d09a;
}

.no-orders {
  text-align: center;
  padding: 4rem 1rem;
}

.no-orders p {
  color: #a89a8c;
  margin-bottom: 2rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(197, 163, 106, 0.1);
  border-top-color: var(--c-gold);
  border-radius: 50%;
  animation: auth-spin 0.8s linear infinite;
  margin: 2rem auto;
}

.address-view {
  animation: auth-fade-in 0.5s ease-out;
  text-align: left;
}

.address-view h3 {
  color: var(--c-white);
  text-align: center;
}

.save-notice {
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
  font-size: 0.85rem;
  text-align: center;
}

.save-notice.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.stripe-address-container {
  margin-bottom: 2rem;
  min-height: 200px;
}

.form-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1rem;
}

/* Favorites View Styles */
.favorites-view {
  max-height: 550px;
  overflow-y: auto;
  padding: 0.5rem 1rem 1rem 0;
  scrollbar-width: thin;
  scrollbar-color: var(--c-gold) transparent;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.favorite-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.favorite-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(197, 163, 106, 0.3);
  transform: translateX(4px);
}

.favorite-card__content {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.favorite-card__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.buy-btn {
  background: var(--c-gold);
  color: var(--c-black);
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.buy-btn:hover {
  background: #d4b47d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(197, 163, 106, 0.2);
}

.remove-fav-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.remove-fav-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  opacity: 1;
  transform: scale(1.1);
}
</style>
