<template>
  <div class="reset-password-view">
    <div class="reset-card">
      <div class="reset-card__header">
        <h1 class="display-sm">Nueva Contraseña</h1>
        <p class="body-md subtitle">Elige una contraseña segura para tu cuenta.</p>
      </div>

      <div class="reset-card__content">
        <form v-if="!success" @submit.prevent="handleUpdate" class="reset-form">
          <div class="form-group">
            <label class="label-xs">Nueva Contraseña</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              minlength="6"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label class="label-xs">Confirmar Contraseña</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              required 
              minlength="6"
              class="form-input"
            >
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>
          
          <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            <span v-if="loading" class="loader"></span>
            <span v-else>Actualizar Contraseña</span>
          </button>
        </form>

        <div v-else class="success-view">
          <div class="check-icon">✓</div>
          <h2 class="display-sm">¡Actualizada!</h2>
          <p class="body-md">Tu contraseña ha sido cambiada con éxito.</p>
          <button class="btn btn-primary w-full" @click="goToHome">Volver al Inicio</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/index.js'

export default {
  name: 'ResetPasswordView',
  setup() {
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref(false)
    const router = useRouter()

    // Al montar, capturamos el token de la URL si existe
    onMounted(() => {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const type = params.get('type')

        if (accessToken && type === 'recovery') {
          // 1. Guardamos en localStorage como backup
          localStorage.setItem('token', accessToken)
          localStorage.setItem('isLoggedIn', 'true')
          
          // 2. Intentamos forzar la cookie en el navegador para que el backend la vea
          // Nota: Al ser desde JS no puede ser HttpOnly, pero servirá para esta acción.
          document.cookie = `token=${accessToken}; path=/; max-age=3600; SameSite=Lax`;
          
          console.log('Token de recuperación detectado y configurado.');
        } else if (!accessToken) {
          error.value = 'El enlace de recuperación no es válido o ha expirado.'
        }
      } else {
        error.value = 'No se ha encontrado un token de recuperación.'
      }
    })

    const handleUpdate = async () => {
      if (password.value !== confirmPassword.value) {
        error.value = 'Las contraseñas no coinciden'
        return
      }

      loading.value = true
      error.value = ''

      try {
        await authApi.updatePassword(password.value)
        success.value = true
        // Limpiamos los tokens temporales
        localStorage.removeItem('token')
        localStorage.removeItem('isLoggedIn')
        // Limpiamos la cookie temporal
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      } catch (err) {
        error.value = err.message || 'Error al actualizar la contraseña. El enlace puede haber expirado.'
      } finally {
        loading.value = false
      }
    }

    const goToHome = () => {
      router.push('/')
    }

    return {
      password, confirmPassword, loading, error, success,
      handleUpdate, goToHome
    }
  }
}
</script>

<style scoped>
.reset-password-view {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--c-black);
}

.reset-card {
  background: #1c1917;
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  border: 1px solid rgba(197, 163, 106, 0.15);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.reset-card__header {
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.reset-card__content {
  padding: 2.5rem;
}

.subtitle {
  color: var(--c-grey);
  margin-top: 0.5rem;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  color: #f5f5f4;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--c-gold);
  background: rgba(255, 255, 255, 0.08);
}

.error-msg {
  color: #ef4444;
  font-size: 0.8rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-view {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  font-size: 2rem;
  margin: 0 auto;
}

.w-full { width: 100%; }
</style>
