<template>
  <!-- ==========================================
       SIUULUETTE — Footer Section
       Redesigned premium footer - Compact & Refined
       ========================================== -->
  <footer class="footer">

    <!-- Top Bar: Marquee -->
    <div class="footer__marquee" aria-hidden="true">
      <div class="footer__marquee-track">
        <span v-for="n in 8" :key="n" class="footer__marquee-item">
          LE SIUULUETTE &nbsp;·&nbsp; VISTE LA VICTORIA &nbsp;·&nbsp; MAKE IT REAL &nbsp;·&nbsp;
        </span>
      </div>
    </div>

    <!-- Highlights Bar -->
    <div class="footer__highlights">
      <div class="footer__highlights-inner">
        <div v-for="(item, idx) in highlights" :key="idx" class="highlight-item">
          <component :is="item.icon" class="highlight-icon" />
          <span class="highlight-text">{{ item.text }}</span>
        </div>
      </div>
    </div>

    <!-- Main Footer Content -->
    <div class="footer__main">
      <div class="footer__grid">
        
        <!-- Brand & Social Column -->
        <div class="footer__brand-col">
          <div class="footer__large-logo">
            <img src="/img/Logotipo_f.png" alt="Le Siuuluette" class="brand-logo-img" />
          </div>
          
          <div class="footer__social-links">
            <a v-for="social in socials" :key="social.name" :href="social.url" class="social-link" target="_blank" rel="noopener">
              <component :is="social.icon" class="social-icon-svg" />
              <span class="social-name">{{ social.name }}</span>
            </a>
          </div>
        </div>

        <!-- Links Columns -->
        <div v-for="col in columns" :key="col.title" class="footer__links-col">
          <h4 class="col-title">{{ col.title }}</h4>
          <ul class="col-list">
            <li v-for="link in col.links" :key="link.label">
              <a :href="link.href" class="footer-link">{{ link.label }}</a>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer__bottom">
      <div class="footer__bottom-inner">
        <div class="footer__copyright">
          © {{ year }} SIUULUETTE BRAND. TODOS LOS DERECHOS RESERVADOS.
        </div>
      </div>
    </div>

  </footer>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue';

const year = new Date().getFullYear();

// Simple SVG Icons as components
const IconHelp = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
    h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
  ])
});

const IconShipping = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '1', y: '3', width: '15', height: '13' }),
    h('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
    h('circle', { cx: '5.5', cy: '18.5', r: '2.5' }),
    h('circle', { cx: '18.5', cy: '18.5', r: '2.5' })
  ])
});

const IconReturns = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
    h('path', { d: 'M3 3v5h5' })
  ])
});

const IconSecurity = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
    h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
  ])
});

const IconInstagram = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '2', y: '2', width: '20', height: '20', rx: '5', ry: '5' }),
    h('path', { d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }),
    h('line', { x1: '17.5', y1: '6.5', x2: '17.51', y2: '6.5' })
  ])
});

const IconTikTok = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5' })
  ])
});

const IconYouTube = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z' }),
    h('polygon', { points: '9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02' })
  ])
});

const highlights = [
  { text: 'Resolvemos tus dudas', icon: IconHelp },
  { text: 'Entrega gratis a partir de 100€', icon: IconShipping },
  { text: 'Devoluciones gratis en 30 días', icon: IconReturns },
  { text: 'Pago 100% seguro', icon: IconSecurity },
];

const socials = [
  { name: 'Instagram', url: '#', icon: IconInstagram },
  { name: 'TikTok', url: '#', icon: IconTikTok },
  { name: 'YouTube', url: '#', icon: IconYouTube },
];

const columns = [
  {
    title: 'AYUDA',
    links: [
      { label: 'FAQs', href: '/ayuda/faqs' },
      { label: 'Contacto', href: '/ayuda/contacto' },
      { label: 'Envíos', href: '/ayuda/envios' },
      { label: 'Devoluciones', href: '/ayuda/devoluciones' },
      { label: 'Seguimiento de pedido', href: '/ayuda/seguimiento' },
    ]
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Aviso Legal', href: '/aviso-legal' },
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Condiciones Generales', href: '/terminos' },
      { label: 'Marca Registrada', href: '/marca-registrada' },
    ]
  },
  {
    title: 'COMUNIDAD',
    links: [
      { label: 'Lista VIP', href: '/lista-vip' },
      { label: 'Sostenibilidad', href: '/sostenibilidad' },
    ]
  }
];
</script>

<style scoped>
.footer {
  background: var(--c-dark);
  color: var(--c-white);
  border-top: 1px solid rgba(0,0,0,0.05);
}

/* --- Marquee --- */
.footer__marquee {
  background: var(--c-gold);
  overflow: hidden;
  padding: 0.35rem 0;
  white-space: nowrap;
}
.footer__marquee-track {
  display: inline-flex;
  animation: marquee 30s linear infinite;
}
.footer__marquee-item {
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  color: var(--c-black);
  padding-right: 2rem;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* --- Highlights Bar --- */
.footer__highlights {
  padding: 0.4rem 2rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.footer__highlights-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}
.highlight-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.highlight-icon {
  width: 24px;
  height: 24px;
  color: var(--c-gold);
  flex-shrink: 0;
}
.highlight-text {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* --- Main Footer --- */
.footer__main {
  padding: 1rem 2rem;
}
.footer__grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
}

/* Brand Col */
.footer__brand-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.brand-logo-img {
  max-width: 180px;
  height: auto;
  opacity: 0.95;
}
.footer__social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.social-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--c-grey);
  font-size: 0.8rem;
  transition: color var(--t-fast);
}
.social-link:hover {
  color: var(--c-gold);
}
.social-icon-svg {
  width: 18px;
  height: 18px;
}
.social-name {
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Links Cols */
.col-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  color: var(--c-white);
}
.col-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.footer-link {
  font-size: 0.85rem;
  color: var(--c-grey);
  transition: all var(--t-fast);
}
.footer-link:hover {
  color: var(--c-gold);
  transform: translateX(3px);
}

/* --- Bottom Bar --- */
.footer__bottom {
  padding: 0.5rem 2rem;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.footer__bottom-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}
.footer__copyright {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--c-grey);
}

/* --- Responsive --- */
@media (max-width: 1100px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
  .footer__brand-col {
    grid-column: span 2;
    align-items: center;
    text-align: center;
  }
  .footer__social-links {
    justify-content: center;
  }
}
@media (max-width: 600px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
  .footer__brand-col {
    grid-column: span 1;
  }
  .footer__bottom-inner {
    flex-direction: column;
    text-align: center;
  }
  .footer__highlights-inner {
    grid-template-columns: 1fr;
  }
}
</style>
