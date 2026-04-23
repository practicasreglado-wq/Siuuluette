<template>
  <!-- ==========================================
       SIUULUETTE — Brand Values Section
       4 pillars with icons
       ========================================== -->
  <section class="values section">
    <div class="container">

      <div class="values__header">
        <span class="accent-line"></span>
        <span class="label">Por qué Le Siuuluette</span>
        <h2 class="display-md values__title">Construido<br/>diferente</h2>
      </div>

      <div class="values__grid">
        <div
          v-for="(value, i) in values"
          :key="value.id"
          class="value-card"
          :style="{ '--delay': `${i * 0.1}s` }"
        >
          <div class="value-card__icon" v-html="value.icon" aria-hidden="true"></div>
          <div class="value-card__content">
            <h3 class="value-card__title">{{ value.title }}</h3>
            <p class="value-card__text">{{ value.text }}</p>
          </div>
          <div class="value-card__number" aria-hidden="true">0{{ i + 1 }}</div>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'BrandValues',
  setup() {
    const values = [
      {
        id: 1,
        title: 'Calidad Premium',
        text: 'Materiales certificados seleccionados. Cada prenda supera 40 controles de calidad antes de llevar el isotipo.',
        icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>`,
      },
      {
        id: 2,
        title: 'Producción Limitada',
        text: 'Nunca fabricamos más de lo que vendemos. Cada unidad numerada a mano. Sin restock. Sin soldes.',
        icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`,
      },
      {
        id: 3,
        title: 'Estilo Sport-Luxury',
        text: 'La fusión entre rendimiento deportivo y estética de lujo. Para el gimnasio, la calle y todo lo que hay entre medias.',
        icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`,
      },
      {
        id: 4,
        title: 'Diseño Atemporal',
        text: 'Nuestras piezas trascienden las tendencias efímeras. Siluetas diseñadas para perdurar en el tiempo, tanto en calidad como en estilo.',
        icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`,
      },
    ]
    return { values }
  }
}
</script>

<style scoped>
.values {
  background: var(--c-dark);
  border-top: 1px solid rgba(92, 82, 72, 0.1);
  border-bottom: 1px solid rgba(92, 82, 72, 0.1);
}

.values__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 4rem;
}

.values__title {
  color: var(--c-white);
  max-width: 500px;
}

/* Grid */
.values__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}

/* Card */
.value-card {
  padding: 2.5rem 2rem;
  background: var(--c-dark-2);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: background var(--t-medium);
  border-right: 1px solid rgba(92, 82, 72, 0.1);
}

.value-card:last-child { border-right: none; }

.value-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--c-gold);
  transition: width var(--t-slow) var(--ease-standard);
}

.value-card:hover {
  background: var(--c-dark-3);
}

.value-card:hover::before {
  width: 100%;
}

/* Icon */
.value-card__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: rgba(92, 82, 72, 0.08);
  color: var(--c-gold);
  border: 1px solid rgba(92, 82, 72, 0.15);
  flex-shrink: 0;
  transition: background var(--t-medium), transform var(--t-medium) var(--ease-spring);
}

.value-card:hover .value-card__icon {
  background: rgba(92, 82, 72, 0.15);
  transform: scale(1.08);
}

/* Content */
.value-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-off-white);
  letter-spacing: 0.02em;
}

.value-card__text {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--c-grey);
  font-weight: 300;
}

/* Decorative number */
.value-card__number {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  font-family: var(--font-display);
  font-size: 3.5rem;
  color: rgba(255, 255, 255, 0.269);
  line-height: 1;
  pointer-events: none;
  user-select: none;
  transition: color var(--t-medium);
}

.value-card:hover .value-card__number {
  color: rgba(92, 82, 72, 0.475);
}

/* Responsive */
@media (max-width: 900px) {
  .values__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
  }
  .value-card { border-right: 1px solid rgba(255,255,255,0.04); }
  .value-card:nth-child(2n) { border-right: none; }
  .value-card:nth-child(n+3) { border-top: 2px solid rgba(255,255,255,0.04); }
}

@media (max-width: 560px) {
  .values__grid {
    grid-template-columns: 1fr;
  }
  .value-card { border-right: none; border-top: 1px solid rgba(255,255,255,0.04); }
  .value-card:first-child { border-top: none; }
}
</style>
