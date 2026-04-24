<template>
  <!-- ==========================================
       SIUULUETTE — Navbar Component
       Sticky header with logo, nav links & cart
       ========================================== -->
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled, 'navbar--menu-open': menuOpen }">
    <div class="navbar__inner">

      <!-- Brand Logo -->
      <router-link
        :to="{ path: '/', hash: '#inicio' }"
        class="navbar__brand"
        aria-label="Siuuluette inicio"
        @click="goToSection($event, '#inicio')"
      >
        <img src="/Siu_white.png" alt="Siuuluette isotipo" class="navbar__logo-icon" />
        <span class="navbar__logo-text">Le Siuuluette</span>
      </router-link>

      <!-- Primary Navigation (desktop) -->
      <nav class="navbar__nav" aria-label="Navegación principal">
        <router-link :to="{ path: '/', hash: '#inicio' }" class="navbar__link" :class="{ 'navbar__link--active': activeSection === 'inicio' }" @click="goToSection($event, '#inicio')">Inicio</router-link>
        <router-link :to="{ path: '/', hash: '#explora' }" class="navbar__link" :class="{ 'navbar__link--active': activeSection === 'explora' }" @click="goToSection($event, '#explora')">Explora</router-link>
        <router-link :to="{ path: '/', hash: '#ofertas' }" class="navbar__link navbar__link--accent" :class="{ 'navbar__link--active': activeSection === 'ofertas' }" @click="goToSection($event, '#ofertas')">Descuentos</router-link>
        <router-link :to="{ path: '/', hash: '#nosotros' }" class="navbar__link" :class="{ 'navbar__link--active': activeSection === 'nosotros' }" @click="goToSection($event, '#nosotros')">Nosotros</router-link>
      </nav>

      <!-- Actions -->
      <div class="navbar__actions">



        <!-- User Account -->
        <button 
          class="navbar__icon-btn" 
          :class="{ 'navbar__icon-btn--active': currentUser }"
          @click="handleUserClick" 
          :aria-label="currentUser ? `Sesión de ${currentUser.username || currentUser.email}` : 'Mi cuenta'"
        >
          <!-- User Initial -->
          <div v-if="currentUser" class="user-avatar">
            {{ (currentUser.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <!-- Guest Icon -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>

        <!-- Cart -->
        <button class="navbar__cart-btn" @click="$emit('open-cart')" :aria-label="`Carrito, ${cartCount} artículos`">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <Transition name="badge-pop">
            <span class="navbar__cart-badge" v-if="cartCount > 0" key="badge">{{ cartCount }}</span>
          </Transition>
        </button>

        <!-- Mobile Hamburger -->
        <button
          class="navbar__hamburger"
          @click="menuOpen = !menuOpen"
          :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
          :aria-expanded="menuOpen"
        >
          <span class="bar" :class="{ open: menuOpen }"></span>
          <span class="bar" :class="{ open: menuOpen }"></span>
          <span class="bar" :class="{ open: menuOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div class="navbar__mobile-menu" v-if="menuOpen">
        <nav class="mobile-nav">
          <router-link :to="{ path: '/', hash: '#inicio' }" class="mobile-nav__link" @click="closeMenuAndScroll($event, '#inicio')">Inicio</router-link>
          <router-link :to="{ path: '/', hash: '#explora' }" class="mobile-nav__link" @click="closeMenuAndScroll($event, '#explora')">Explora</router-link>
          <router-link :to="{ path: '/', hash: '#ofertas' }" class="mobile-nav__link mobile-nav__link--accent" @click="closeMenuAndScroll($event, '#ofertas')">Descuentos</router-link>
          <router-link :to="{ path: '/', hash: '#nosotros' }" class="mobile-nav__link" @click="closeMenuAndScroll($event, '#nosotros')">Nosotros</router-link>
          <button class="mobile-nav__link" @click="menuOpen = false; $emit('open-auth')">Mi cuenta</button>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script>
export default {
  name: 'Navbar',
  emits: ['open-cart', 'open-auth', 'logout', 'nav-click'],
  props: {
    cartCount: { type: Number, default: 0 },
    isScrolled: { type: Boolean, default: false },
    currentUser: { type: Object, default: null }
  },
  data() {
    return {
      menuOpen: false,
      activeSection: null
    }
  },
  mounted() {
    this.initScrollSpy()
  },
  methods: {
    initScrollSpy() {
      if (this.$route.path !== '/') {
        this.activeSection = null
        return
      }

      const options = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }

      // Cleanup previous observer if any
      if (this.observer) this.observer.disconnect()

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id
          }
        })
      }, options)

      const sections = ['inicio', 'explora', 'ofertas', 'nosotros']
      sections.forEach(id => {
        const el = document.getElementById(id)
        if (el) this.observer.observe(el)
      })
    },
    handleUserClick() {
      this.$emit('open-auth')
    },
    /**
     * Si ya estamos en "/", hacemos scroll suave al id sin navegar
     * (el router-link a la misma ruta no dispararía scrollBehavior).
     * Si estamos en otra ruta (p. ej. /producto/:slug), dejamos que
     * el router-link navegue y el scrollBehavior global haga el scroll.
     */
    goToSection(event, hash) {
      this.$emit('nav-click')
      if (this.$route.path === '/') {
        event.preventDefault()
        const el = document.querySelector(hash)
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 121
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }
    },
    closeMenuAndScroll(event, hash) {
      this.menuOpen = false
      this.goToSection(event, hash)
    }
  },
  watch: {
    '$route.path': {
      handler() {
        this.initScrollSpy()
      },
      immediate: true
    }
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect()
  }
}
</script>

<style scoped>
/* --- Base Navbar --- */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  transition: background var(--t-medium) var(--ease-standard),
              box-shadow var(--t-medium) var(--ease-standard),
              backdrop-filter var(--t-medium);
}

.navbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: transparent;
  transition: background var(--t-medium);
}

.navbar--scrolled::after {
  background: rgba(92, 82, 72, 0.12);
}

.navbar--scrolled {
  background: rgba(229, 224, 216, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 30px rgba(92, 82, 72, 0.15);
}

/* --- Inner Layout --- */
.navbar__inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 3rem; /* More padding on the sides */
  height: 85px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* --- Brand --- */
.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  flex-shrink: 0;
}

.navbar__logo-icon {
  width: auto;
  height: 40px;
  object-fit: contain;
  filter: brightness(0);
}

.navbar__logo-text {
  font-family: var(--font-display);
  font-size: 1.7rem;
  letter-spacing: 0.08em;
  color: var(--c-white);
  text-transform: uppercase;
  line-height: 1;
  position: relative;
  display: flex;
  align-items: baseline;
}

.navbar__logo-text::after {
  content: '®';
  font-size: 0.8rem;
  margin-left: 0.2rem;
  font-weight: 400;
  color: var(--c-light);
  position: relative;
  top: 0.25rem; /* Ajuste para bajarlo */
}

/* --- Desktop Nav --- */
.navbar__nav {
  display: flex;
  align-items: center;
  gap: 3.5rem; /* Wider gap between links */
}

.navbar__link {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-light);
  transition: color var(--t-fast);
  position: relative;
  padding-bottom: 2px;
}

.navbar__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--c-gold);
  transition: width var(--t-medium) var(--ease-standard);
}

.navbar__link:hover::after,
.navbar__link--active::after {
  width: 100%;
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--c-white);
}
.navbar__link--accent       { color: var(--c-accent-vibrant); font-weight: 600; }

/* --- Actions --- */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.navbar__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--c-white);
  transition: color var(--t-fast), background var(--t-fast);
  cursor: pointer;
  background: transparent;
  border: none;
}

.navbar__icon-btn--active {
  color: var(--c-gold);
}

.user-avatar {
  width: 24px;
  height: 24px;
  background: var(--c-gold);
  color: var(--c-black);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0;
  line-height: 1;
}

.user-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 6px;
  height: 6px;
  background: var(--c-gold);
  border-radius: 50%;
  border: 1px solid var(--c-black);
}

/* --- Cart Button --- */
.navbar__cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--c-white);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--t-fast), background var(--t-fast);
}

.navbar__cart-btn:hover {
  color: var(--c-white);
  background: rgba(92, 82, 72, 0.1);
}

.navbar__cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--c-gold);
  color: var(--c-black);
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* --- Hamburger --- */
.navbar__hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: 0.25rem;
}

.bar {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--c-light);
  border-radius: 2px;
  transition: all var(--t-medium) var(--ease-standard);
  transform-origin: center;
}

.bar.open:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.bar.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
.bar.open:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* --- Mobile Menu --- */
.navbar__mobile-menu {
  background: rgba(229, 224, 216, 0.98);
  border-top: 1px solid rgba(92, 82, 72, 0.12);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem 2rem;
  gap: 0;
}

.mobile-nav__link {
  display: block;
  padding: 1rem 0;
  font-size: 1.5rem;
  font-family: var(--font-display);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-light);
  border-bottom: 1px solid rgba(92, 82, 72, 0.08);
  transition: color var(--t-fast), padding-left var(--t-fast);
}

.mobile-nav__link:hover,
.mobile-nav__link--accent { color: var(--c-gold); padding-left: 0.5rem; }

/* --- Transitions --- */
.badge-pop-enter-active { animation: badge-pop 0.35s var(--ease-spring); }
.badge-pop-leave-active { animation: badge-pop 0.2s reverse ease-in; }
@keyframes badge-pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active { transition: all var(--t-medium) var(--ease-standard); max-height: 500px; }
.mobile-menu-enter-from,
.mobile-menu-leave-to     { max-height: 0; opacity: 0; }

/* --- Responsive --- */
@media (max-width: 900px) {
  .navbar__nav       { display: none; }
  .navbar__hamburger { display: flex; }
}

@media (max-width: 480px) {
  .navbar__inner { padding: 0 1rem; }
  .navbar__logo-text { font-size: 1.4rem; }
}
</style>
