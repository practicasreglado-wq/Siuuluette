<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="cookie-banner">
      <div class="cookie-content">
        <h3 class="cookie-title">Privacidad y Cookies</h3>
        <p class="cookie-text">
          Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y mostrar anuncios personalizados. 
          Al hacer clic en "Aceptar todas", aceptas el uso de TODAS las cookies. Puedes configurar tus preferencias o rechazarlas en "Configurar".
        </p>
      </div>
      <div class="cookie-actions">
        <button @click="openConfig" class="btn-config">Configurar</button>
        <button @click="acceptAll" class="btn-accept">Aceptar todas</button>
      </div>
    </div>
  </Transition>

  <!-- Modal de Configuración -->
  <Transition name="fade">
    <div v-if="showConfigModal" class="cookie-modal-overlay" @click.self="closeConfig">
      <div class="cookie-modal">
        <h2 class="modal-title">Configuración de Cookies</h2>
        <p class="modal-desc">Selecciona qué cookies quieres aceptar. Las cookies técnicas son obligatorias para el funcionamiento de la web.</p>
        
        <div class="cookie-options">
          <div class="cookie-option">
            <div class="option-header">
              <span class="option-name">Cookies Estrictamente Necesarias</span>
              <span class="option-status always-on">Siempre Activo</span>
            </div>
            <p class="option-desc">Permiten la navegación por la web y la utilización de las diferentes opciones o servicios (ej. pasarela de pago, carrito).</p>
          </div>
          
          <div class="cookie-option">
            <div class="option-header">
              <span class="option-name">Cookies Analíticas y Publicitarias</span>
              <label class="switch">
                <input type="checkbox" v-model="analyticsAccepted">
                <span class="slider round"></span>
              </label>
            </div>
            <p class="option-desc">Nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico del uso que hacen los usuarios.</p>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="saveConfig" class="btn-save">Guardar Preferencias</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'CookieBanner',
  setup() {
    const showBanner = ref(false)
    const showConfigModal = ref(false)
    const analyticsAccepted = ref(false)

    onMounted(() => {
      const consent = localStorage.getItem('cookie_consent')
      if (!consent) {
        showBanner.value = true
      }
    })

    const acceptAll = () => {
      localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: true }))
      showBanner.value = false
    }

    const openConfig = () => {
      showConfigModal.value = true
    }

    const closeConfig = () => {
      showConfigModal.value = false
    }

    const saveConfig = () => {
      localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: analyticsAccepted.value }))
      showConfigModal.value = false
      showBanner.value = false
    }

    return {
      showBanner,
      showConfigModal,
      analyticsAccepted,
      acceptAll,
      openConfig,
      closeConfig,
      saveConfig
    }
  }
}
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--c-dark); /* Volvemos al arena original */
  border-top: 1px solid var(--c-dark-2);
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 9998;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
}

@media (min-width: 768px) {
  .cookie-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .cookie-content {
    flex: 1;
    margin-right: 2rem;
  }
  .cookie-actions {
    flex-direction: row;
    align-items: center;
  }
}

.cookie-title {
  color: #5C5248; /* Marrón café original */
  font-family: var(--font-display, serif);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cookie-text {
  color: #4A443F; /* Texto oscuro para contraste sobre arena */
  font-size: 0.85rem;
  line-height: 1.5;
}

.cookie-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 250px;
}

.btn-accept {
  background-color: #5C5248;
  color: var(--c-black);
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-accept:hover {
  background-color: #e6c55d;
}

.btn-config {
  background-color: transparent;
  color: #5C5248;
  border: 1px solid #5C5248;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-config:hover {
  border-color: var(--c-off-white);
}

/* Modal */
.cookie-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(12, 10, 9, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.cookie-modal {
  background-color: var(--c-dark);
  border: 1px solid var(--c-dark-2);
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}

.modal-title {
  color: #5C5248;
  font-family: var(--font-display, serif);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-desc {
  color: #4A443F;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.cookie-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cookie-option {
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-name {
  color: #1A1A1A;
  font-weight: 600;
  font-size: 0.95rem;
}

.option-status.always-on {
  color: #4ade80;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.option-desc {
  color: #4A443F;
  font-size: 0.85rem;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  background-color: #5C5248;
  color: var(--c-black);
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save:hover {
  background-color: #e6c55d;
}

/* Switch styling */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #5C5248;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #5C5248;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease-out, opacity 0.4s;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
