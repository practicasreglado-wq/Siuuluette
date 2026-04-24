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
          SIUULUETTE® &nbsp;·&nbsp; VISTE LA VICTORIA &nbsp;·&nbsp; MAKE IT REAL &nbsp;·&nbsp;
        </span>
      </div>
    </div>

    <!-- Main Footer -->
    <div class="footer__main">
      <div class="footer__inner">

        <!-- Brand Column -->
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="/Siu_white.png" alt="Siuuluette" class="footer__logo-icon" />
            <span class="footer__logo-text">Siuuluette</span>
          </div>
          <p class="footer__tagline">
            No sigas tendencias.<br />Créalas.
          </p>

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
              <a :href="link.href" class="footer__link">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer__col">
          <h3 class="footer__col-title">Contacto</h3>
          <ul class="footer__links">
            <li>
              <a href="mailto:hola@lesiuuluette.com" class="footer__link">hola@lesiuuluette.com</a>
            </li>
            <li>
              <a href="tel:+34000000000" class="footer__link">+34 000 000 000</a>
            </li>
          </ul>
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
          <a href="#" class="footer__legal-link">Términos, Privacidad y Accesibilidad</a>
          <a href="#" class="footer__legal-link">Cookies</a>
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
      year: new Date().getFullYear(),
      socials: [],
      linkColumns: [
        {
          title: 'Navegación',
          links: [
            { label: 'Inicio', href: '#inicio' },
            { label: 'Explora', href: '#explora' },
            { label: 'Drops', href: '#drops' },
            { label: 'Nosotros', href: '#nosotros' },
          ],
        },
      ],
    }
  },
  methods: {}
}
</script>

<style scoped>
.footer {
  background: var(--c-dark);
  border-top: 1px solid rgba(92, 82, 72, 0.1);
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
  grid-template-columns: 2fr 1.5fr 1.5fr;
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
  opacity: 0.8;
  filter: invert(1);
}

.footer__logo-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-white);
  display: flex;
  align-items: baseline;
}

.footer__logo-text::after {
  content: '®';
  font-size: 0.65rem;
  margin-left: 0.15rem;
  color: var(--c-grey);
  position: relative;
  top: 0.2rem; /* Ajuste para bajarlo */
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
  border: 1px solid rgba(92, 82, 72, 0.15);
  color: var(--c-grey);
  background: transparent;
  transition: all var(--t-fast);
}

.footer__social-link:hover {
  border-color: var(--c-gold);
  color: var(--c-gold);
  background: rgba(92, 82, 72, 0.08);
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



/* --- Bottom Bar --- */
.footer__bottom {
  border-top: 1px solid rgba(92, 82, 72, 0.1);
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
