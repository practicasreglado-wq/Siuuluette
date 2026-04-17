<template>
  <!-- ==========================================
       SIUULUETTE — Footer Section
       Full footer with links, social, newsletter mini
       ========================================== -->
  <footer class="footer">

    <!-- Top Bar: Marquee -->
    <div class="footer__marquee" aria-hidden="true">
      <div class="footer__marquee-track">
        <span v-for="n in 8" :key="n" class="footer__marquee-item">
          SIUULUETTE &nbsp;·&nbsp; VISTE LA VICTORIA &nbsp;·&nbsp; MAKE IT REAL &nbsp;·&nbsp;
        </span>
      </div>
    </div>

    <!-- Main Footer -->
    <div class="footer__main">
      <div class="footer__inner">

        <!-- Brand Column -->
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="../assets/isotipo.jpeg" alt="Siuuluette" class="footer__logo-icon" />
            <span class="footer__logo-text">Siuuluette</span>
          </div>
          <p class="footer__tagline">
            No sigas tendencias.<br />Créalas.
          </p>
          <div class="footer__social">
            <a
              v-for="social in socials"
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
              class="footer__social-link"
            >
              <span v-html="social.icon"></span>
            </a>
          </div>
        </div>

        <!-- Links Columns -->
        <div
          v-for="col in linkColumns"
          :key="col.title"
          class="footer__col"
        >
          <h3 class="footer__col-title">{{ col.title }}</h3>
          <ul class="footer__links">
            <li v-for="link in col.links" :key="link.label">
              <a href="#" class="footer__link">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Mini Newsletter -->
        <div class="footer__newsletter">
          <h3 class="footer__col-title">Comunidad</h3>
          <p class="footer__newsletter-text">
            Acceso anticipado a drops y contenido exclusivo.
          </p>
          <form class="footer__form" @submit.prevent="handleMiniSubmit" novalidate>
            <div class="footer__input-row">
              <input
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                class="footer__input"
                :disabled="subscribed"
                aria-label="Tu email para la newsletter"
              />
              <button
                type="submit"
                class="footer__submit"
                :disabled="subscribed"
                aria-label="Suscribirse"
              >
                <svg v-if="!subscribed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span v-else>✓</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer__bottom">
      <div class="footer__bottom-inner">
        <p class="footer__copyright">
          © {{ year }} Siuuluette Brand. Todos los derechos reservados.
        </p>
        <div class="footer__legal">
          <a href="#" class="footer__legal-link">Privacidad</a>
          <a href="#" class="footer__legal-link">Términos</a>
          <a href="#" class="footer__legal-link">Cookies</a>
          <a href="#" class="footer__legal-link">Accesibilidad</a>
        </div>
        <div class="footer__payments" aria-label="Métodos de pago aceptados">
          <span class="footer__payment-icon">VISA</span>
          <span class="footer__payment-icon">MC</span>
          <span class="footer__payment-icon">AMEX</span>
          <span class="footer__payment-icon">PAY</span>
        </div>
      </div>
    </div>

  </footer>
</template>

<script>
export default {
  name: 'FooterSection',
  data() {
    return {
      email: '',
      subscribed: false,
      year: new Date().getFullYear(),
      socials: [
        {
          name: 'Instagram',
          href: '#',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>`,
        },
        {
          name: 'TikTok',
          href: '#',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
          </svg>`,
        },
        {
          name: 'Twitter / X',
          href: '#',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 4l16 16M4 20L20 4"/>
          </svg>`,
        },
        {
          name: 'YouTube',
          href: '#',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 8a2.83 2.83 0 0 0-2-2C18.18 6 12 6 12 6s-6.18 0-8 .46a2.83 2.83 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .46 4 2.83 2.83 0 0 0 2 2C6 18.55 12 18.55 12 18.55s6.18 0 8-.46a2.83 2.83 0 0 0 2-2 29 29 0 0 0 .54-4 29 29 0 0 0-.54-4z"/>
            <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none"/>
          </svg>`,
        },
      ],
      linkColumns: [
        {
          title: 'Tienda',
          links: [
            { label: 'Hombre' },
            { label: 'Mujer' },
            { label: 'Drops' },
            { label: 'Colecciones' },
            { label: 'Accesorios' },
            { label: 'Ediciones Limitadas' },
          ],
        },
        {
          title: 'Marca',
          links: [
            { label: 'Nosotros' },
            { label: 'Manifiesto' },
            { label: 'Comunidad' },
            { label: 'Blog' },
            { label: 'Prensa' },
            { label: 'Colaboraciones' },
          ],
        },
        {
          title: 'Ayuda',
          links: [
            { label: 'Contacto' },
            { label: 'Envíos y devoluciones' },
            { label: 'Guía de tallas' },
            { label: 'FAQ' },
            { label: 'Estado del pedido' },
          ],
        },
      ],
    }
  },
  methods: {
    handleMiniSubmit() {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRx.test(this.email)) return
      this.subscribed = true
    }
  }
}
</script>

<style scoped>
.footer {
  background: var(--c-dark);
  border-top: 1px solid rgba(255,255,255,0.05);
}

/* --- Marquee Strip --- */
.footer__marquee {
  background: var(--c-gold);
  overflow: hidden;
  padding: 0.65rem 0;
  white-space: nowrap;
}

.footer__marquee-track {
  display: inline-flex;
  animation: marquee 28s linear infinite;
  will-change: transform;
}

.footer__marquee-item {
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  color: var(--c-black);
  padding-right: 1rem;
  flex-shrink: 0;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* --- Main Footer --- */
.footer__main {
  padding: 5rem 2rem 4rem;
}

.footer__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 4rem;
  align-items: start;
}

/* Brand column */
.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.footer__logo-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: invert(1);
  opacity: 0.8;
}

.footer__logo-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-white);
}

.footer__tagline {
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--c-grey);
  line-height: 1.6;
}

/* Social */
.footer__social {
  display: flex;
  gap: 0.5rem;
}

.footer__social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--c-grey);
  background: transparent;
  transition: all var(--t-fast);
}

.footer__social-link:hover {
  border-color: var(--c-gold);
  color: var(--c-gold);
  background: rgba(201,169,110,0.06);
}

/* Link Columns */
.footer__col-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-off-white);
  margin-bottom: 1.5rem;
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.footer__link {
  font-size: 0.875rem;
  color: var(--c-grey);
  transition: color var(--t-fast), padding-left var(--t-fast);
  display: inline-block;
}

.footer__link:hover {
  color: var(--c-off-white);
  padding-left: 4px;
}

/* Newsletter mini */
.footer__newsletter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer__newsletter-text {
  font-size: 0.85rem;
  color: var(--c-grey);
  line-height: 1.6;
}

.footer__input-row {
  display: flex;
  gap: 0;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color var(--t-fast);
}

.footer__input-row:focus-within {
  border-color: var(--c-gold);
}

.footer__input {
  flex: 1;
  padding: 0.7rem 0.9rem;
  background: var(--c-dark-2);
  border: none;
  color: var(--c-white);
  font-size: 0.85rem;
  outline: none;
}

.footer__input::placeholder { color: var(--c-mid); }
.footer__input:disabled     { opacity: 0.5; }

.footer__submit {
  padding: 0 1rem;
  background: var(--c-gold);
  color: var(--c-black);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: background var(--t-fast);
  flex-shrink: 0;
}

.footer__submit:hover   { background: var(--c-gold-light); }
.footer__submit:disabled { background: #2e7d32; color: #fff; cursor: default; }

/* --- Bottom Bar --- */
.footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 1.5rem 2rem;
}

.footer__bottom-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer__copyright {
  font-size: 0.75rem;
  color: var(--c-grey);
  letter-spacing: 0.04em;
}

.footer__legal {
  display: flex;
  gap: 1.5rem;
}

.footer__legal-link {
  font-size: 0.72rem;
  color: var(--c-grey);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color var(--t-fast);
}

.footer__legal-link:hover { color: var(--c-off-white); }

.footer__payments {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer__payment-icon {
  padding: 0.25rem 0.6rem;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--c-grey);
}

/* --- Responsive --- */
@media (max-width: 1100px) {
  .footer__inner {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3rem;
  }
  .footer__brand { grid-column: span 3; }
  .footer__newsletter { grid-column: span 3; }
}

@media (max-width: 700px) {
  .footer__inner {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
  .footer__brand { grid-column: span 2; }
  .footer__newsletter { grid-column: span 2; }
}

@media (max-width: 480px) {
  .footer__inner  { grid-template-columns: 1fr; }
  .footer__brand  { grid-column: span 1; }
  .footer__newsletter { grid-column: span 1; }
  .footer__bottom-inner { flex-direction: column; align-items: flex-start; }
}
</style>
