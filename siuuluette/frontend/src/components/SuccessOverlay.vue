<template>
  <Transition name="success-fade">
    <div v-if="isOpen" class="success-overlay">
      <div class="success-card">
        
        <!-- Animated Icon -->
        <div class="success-card__icon">
          <div class="check-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="success-card__content">
          <h2 class="display-sm">¡Pedido Confirmado!</h2>
          <p class="body-md">Gracias por tu confianza en <strong>Le Siuuluette</strong>. Tu pedido está siendo procesado por nuestro equipo.</p>
          
          <div class="info-box">
            <p class="label-xs">Recibirás un email con los detalles del envío en unos minutos.</p>
          </div>

          <button class="btn btn-primary w-full" @click="$emit('close')">
            Volver a la tienda
          </button>
        </div>

        <!-- Decorative brand element -->
        <div class="brand-isotipo">SIUULUETTE</div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'SuccessOverlay',
  props: {
    isOpen: Boolean
  },
  emits: ['close']
}
</script>

<style scoped>
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 10, 9, 0.95);
  backdrop-filter: blur(12px);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-card {
  background: #1c1917;
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  border: 1px solid rgba(197, 163, 106, 0.2);
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
}

.success-card__icon {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.check-circle {
  width: 80px;
  height: 80px;
  background: rgba(197, 163, 106, 0.1);
  border: 1px solid var(--c-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-gold);
  animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-card__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.success-card__content h2 {
  color: #f5f5f4 !important;
  letter-spacing: 0.05em;
}

.success-card__content p {
  color: var(--c-grey);
  line-height: 1.6;
}

.info-box {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 12px;
  margin: 0.5rem 0 1rem;
}

.brand-isotipo {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-display);
  font-size: 5rem;
  color: rgba(255, 255, 255, 0.02);
  white-space: nowrap;
  pointer-events: none;
}

/* Animations */
@keyframes scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-fade-enter-active,
.success-fade-leave-active {
  transition: all 0.5s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.w-full { width: 100%; }
</style>
