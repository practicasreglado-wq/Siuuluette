<template>
  <section class="upcoming" id="lanzamientos">
    <!-- Cadenas Estructurales -->
    <div class="upcoming__chains">
      <div class="chain chain--1"></div>
      <div class="chain chain--2"></div>
      <div class="chain chain--3"></div>
      <div class="chain chain--4"></div>
      </div>

    <div class="upcoming__bg">
      <img src="/img/upcoming_bg.png" alt="" aria-hidden="true">
    </div>
    
    <div class="container">
      <div class="upcoming__header">
        <div class="upcoming__eyebrow">
          <span class="upcoming__pulse"></span>
          <span class="label">Acceso Restringido · Reserva</span>
        </div>
        <h2 class="display-lg upcoming__title">LOCKED<br/><em>RELEASES</em></h2>
        <p class="body-lg upcoming__desc">
          Piezas custodiadas bajo llave hasta el momento de su liberación. 
          Asegura tu posición en la lista de espera para el acceso prioritario.
        </p>
      </div>

      <div class="upcoming__content">
        <div class="release-highlight">
          <div class="release-highlight__visual">
            <img src="/img/mystery_release.png" :alt="release.name" class="release-image">
            <div class="release-overlay"></div>
            <!-- Etiqueta de INCÓGNITO -->
            <div class="incognito-badge">
              <span>UNRELEASED</span>
            </div>
          </div>

          <div class="release-highlight__info">
            <div class="release-highlight__date">{{ release.date }}</div>
            <h3 class="display-md">{{ release.name }}</h3>
            <p class="body-lg">{{ release.description }}</p>
            
            <div class="release-highlight__footer">
              <span class="release-highlight__price">{{ release.price }}</span>
              <button 
                class="btn btn-primary" 
                @click="handleReserve"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'PROCESANDO...' : 'RESERVA TU COMPRA' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Reserva -->
    <Transition name="fade">
      <div v-if="showModal" class="preorder-modal">
        <div class="preorder-modal__overlay" @click="showModal = false"></div>
        <div class="preorder-modal__content">
          <button class="preorder-modal__close" @click="showModal = false">&times;</button>
          
          <div v-if="!submitted">
            <div class="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 class="display-sm">RESERVANDO...</h3>
            <p class="body-sm">Estamos procesando tu solicitud para el acceso prioritario a <strong>{{ release.name }}</strong>.</p>
          </div>

          <div v-else class="preorder-modal__success">
            <div class="success-icon">✓</div>
            <h3 class="display-sm">RESERVA CONFIRMADA</h3>
            <p class="body-sm">Te hemos enviado un email de confirmación. Te avisaremos en cuanto el drop esté disponible.</p>
            <button class="btn btn-dark" @click="showModal = false">CERRAR</button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import { dropsApi, authApi } from '../api/index.js'

export default {
  name: 'UpcomingReleases',
  setup() {
    const release = {
      name: 'LOCKED DROP — 01',
      description: 'Una pieza forjada en las sombras, custodiada hasta el momento de su liberación. Materiales de alta resistencia y diseño disruptivo. Solo los que reserven tendrán la llave del acceso anticipado.',
      date: 'LIBERACIÓN: JUNIO 2024',
      price: '195.00€'
    }

    const showModal = ref(false)
    const email = ref('')
    const isSubmitting = ref(false)
    const submitted = ref(false)

    onMounted(async () => {
      // Intentar recuperar el email si el usuario ya está logueado
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          if (user.email) email.value = user.email
        } catch (e) {}
      }

      // Si no hay email pero está logueado (hint), pedimos datos frescos
      if (!email.value && localStorage.getItem('isLoggedIn') === 'true') {
        try {
          const data = await authApi.me()
          if (data.user && data.user.email) {
            email.value = data.user.email
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        } catch (e) {}
      }
    })

    async function handlePreorder() {
      try {
        isSubmitting.value = true
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        
        await dropsApi.preorder({
          product_name: release.name
        })

        submitted.value = true
      } catch (err) {
        console.error('Error en reserva:', err)
        alert('No se pudo procesar la reserva. Por favor, inténtalo de nuevo.')
      } finally {
        isSubmitting.value = false
      }
    }

    async function handleReserve() {
      // 1. Verificar si está logueado
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      
      if (!isLoggedIn) {
        // Lanzar evento global para abrir el login del App.vue
        window.dispatchEvent(new CustomEvent('open-auth'))
        return
      }

      // 2. Asegurarnos de tener el email si está logueado
      if (!email.value) {
        try {
          const data = await authApi.me()
          if (data.user && data.user.email) {
            email.value = data.user.email
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        } catch (e) {
          window.dispatchEvent(new CustomEvent('open-auth'))
          return
        }
      }

      if (email.value) {
        await handlePreorder()
        showModal.value = true
      }
    }

    return { 
      release, 
      showModal, 
      email, 
      isSubmitting, 
      submitted,
      handlePreorder,
      handleReserve
    }
  }
}
</script>

<style scoped>
.upcoming {
  background: var(--c-black);
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 60px 0;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

/* --- Cadenas estructurales --- */
.upcoming__chains {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.chain {
  position: absolute;
  /* SVG de METAL TEMPLADO (Un poco más oscuro y robusto) */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cdefs%3E%3ClinearGradient id='m' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23444' /%3E%3Cstop offset='25%25' stop-color='%23888' /%3E%3Cstop offset='50%25' stop-color='%23fff' /%3E%3Cstop offset='75%25' stop-color='%23888' /%3E%3Cstop offset='100%25' stop-color='%23444' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M15,10 A15,10 0 1,0 15,30 A15,10 0 1,0 15,10 M15,14 A11,6 0 1,1 15,26 A11,6 0 1,1 15,14 Z M30,17 L40,17 L40,23 L30,23 Z' fill='url(%23m)' fill-rule='evenodd' /%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-position: 0 center;
  background-size: auto 100%;
  height: 40px;
  width: 300%;
  filter: drop-shadow(0 15px 30px rgba(0,0,0,0.8));
  opacity: 0.9;
  /* Persistencia de rotación para evitar solapamiento por animación */
  --r: 0deg;
  transform: rotate(var(--r));
}

.chain--1 {
  top: -100%;
  left: 0%;
  --r: 80deg;
  transform-origin: left center;
  animation: chain-float 15s ease-in-out infinite;
}

.chain--2 {
  bottom: -10%;
  left: -50%;
  width: 200%;
  --r: 20deg;
  animation: chain-float 18s ease-in-out infinite reverse;
}

.chain--3 {
  top: -100%;
  left: 100%;
  --r: 95deg;
  transform-origin: left center;
  animation: chain-float 16s ease-in-out infinite;
  opacity: 0.8;
}

.chain--4 {
  top: 10%;
  left: -50%;
  width: 200%;
  --r: 20deg;
  animation: chain-float 22s ease-in-out infinite reverse;
}

@keyframes chain-float {
  0%, 100% { transform: rotate(var(--r)) translate(0, 0); }
  50% { transform: rotate(calc(var(--r) + 1.5deg)) translate(15px, 5px); }
}

.upcoming__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.1;
  pointer-events: none;
}

.upcoming__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) contrast(120%);
}

.upcoming__header {
  position: relative;
  z-index: 2;
  margin-bottom: 2.5rem;
  max-width: 800px;
}

.upcoming__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.upcoming__pulse {
  width: 8px;
  height: 8px;
  background: #ff3b3b;
  border-radius: 50%;
  position: relative;
}

.upcoming__pulse::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid #ff3b3b;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

.upcoming__title {
  margin-bottom: 0.8rem;
  color: var(--c-white);
  line-height: 0.9;
  font-size: 3.5rem;
}

.upcoming__title em {
  font-style: normal;
  color: var(--c-gold);
  opacity: 0.8;
}

.upcoming__desc {
  color: var(--c-mid);
  max-width: 500px;
  font-size: 1rem;
  line-height: 1.5;
}

/* Highlight Section */
.upcoming__content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.release-highlight {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
  max-height: 500px;
}

.release-highlight__visual {
  position: relative;
  height: 100%;
  min-height: 350px;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  background: #000;
}

.release-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 1.5s ease;
  opacity: 0.6;
}

.release-highlight:hover .release-image {
  transform: scale(1.1);
  opacity: 0.8;
}

.incognito-badge {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  font-weight: 700;
}

.release-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.8) 100%);
}

.release-highlight__info {
  padding: 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
}

.release-highlight__date {
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: var(--c-gold);
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.release-highlight__info h3 {
  color: var(--c-white);
  line-height: 1;
  letter-spacing: -0.02em;
  font-size: 2.2rem;
}

.release-highlight__info p {
  color: var(--c-light);
  line-height: 1.6;
  opacity: 0.7;
  font-size: 0.95rem;
}

.release-highlight__footer {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin-top: 0.5rem;
}

.release-highlight__price {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--c-white);
}

/* Modal Styles */
.preorder-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.preorder-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.preorder-modal__content {
  position: relative;
  background: var(--c-white);
  color: var(--c-black);
  padding: 4.5rem 4rem;
  border-radius: var(--radius-lg);
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.8);
}

.modal-icon {
  margin-bottom: 2rem;
  color: var(--c-gold);
  display: flex;
  justify-content: center;
}

.preorder-modal__close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 2rem;
  line-height: 1;
  color: var(--c-mid);
  cursor: pointer;
  background: none;
  border: none;
}

.preorder-modal__content h3 {
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.preorder-modal__content p {
  margin-bottom: 3rem;
  opacity: 0.7;
  line-height: 1.6;
}

.preorder-modal__form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.preorder-modal__input {
  background: #f5f5f5;
  color: var(--c-black);
  border: 1px solid #ddd;
  padding: 1.2rem 1.5rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.3s;
}

.preorder-modal__input:focus {
  outline: none;
  border-color: var(--c-gold);
}

.preorder-modal__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.success-icon {
  width: 70px;
  height: 70px;
  background: var(--c-gold);
  color: var(--c-black);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .release-highlight { grid-template-columns: 1fr; }
  .release-highlight__visual { min-height: 400px; border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
  .release-highlight__info { padding: 3.5rem 2.5rem; }
}

@media (max-width: 600px) {
  .release-highlight__footer { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .release-highlight__footer .btn { width: 100%; }
  .preorder-modal__content { padding: 3.5rem 2rem; }
}
</style>
