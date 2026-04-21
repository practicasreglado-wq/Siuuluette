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
            <span class="tab-btn active">Mi Perfil</span>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="auth-card__content">
          <!-- PROFILE VIEW (If logged in) -->
          <div v-if="currentUser" class="profile-view">
            <div class="profile-header">
              <div class="profile-avatar">
                {{ (currentUser.username || 'U').charAt(0).toUpperCase() }}
              </div>
              <h2 class="display-sm">{{ currentUser.username || 'Usuario' }}</h2>
              <p class="body-sm">{{ currentUser.email }}</p>
            </div>

            <div class="profile-actions">
              <button class="profile-btn w-full">
                Mis Pedidos
              </button>
              <button class="profile-btn w-full logout-btn" @click="$emit('logout')">
                Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- Success State for Registration -->
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

          <!-- Normal Form State (Login/Register) -->
          <template v-else>
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

        <!-- Decorative element -->
        <div class="brand-bg">SIU</div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { authApi } from '../api/index.js'

export default {
  name: 'AuthOverlay',
  props: {
    isOpen: Boolean,
    currentUser: Object
  },
  emits: ['close', 'login-success', 'logout'],
  setup(props, { emit }) {
    const mode = ref('login')
    const loading = ref(false)
    const error = ref('')
    const isRegistered = ref(false)
    
    const form = reactive({
      email: '',
      password: '',
      username: '',
      phone: ''
    })

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
      mode, form, loading, error, isRegistered, handleSubmit, resetToLogin
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
  max-width: 420px;
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

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: auth-spin 0.8s linear infinite;
}

@keyframes auth-spin { to { transform: rotate(360deg); } }
</style>
