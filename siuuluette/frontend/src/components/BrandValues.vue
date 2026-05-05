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

      <div class="values__grid" @mousemove="handleMouseMove" @mouseleave="resetTilt">
        <div
          v-for="(value, i) in values"
          :key="value.id"
          class="value-card"
          :style="{ 
            '--delay': `${i * 0.1}s`,
            transform: hoveredIndex === i ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)` : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
            zIndex: hoveredIndex === i ? 10 : 1
          }"
          @mouseenter="hoveredIndex = i"
        >
          <!-- Glare effect -->
          <div 
            class="value-card__glare" 
            v-if="hoveredIndex === i"
            :style="{ 
              left: `${mousePos.x}%`, 
              top: `${mousePos.y}%` 
            }"
          ></div>

          <div class="value-card__icon-wrapper">
            <div class="value-card__icon" v-html="value.icon" aria-hidden="true"></div>
          </div>

          <div class="value-card__content">
            <h3 class="value-card__title">{{ value.title }}</h3>
            <p class="value-card__text">{{ value.text }}</p>
          </div>
          
          <div class="value-card__number" aria-hidden="true">0{{ i + 1 }}</div>
          <div class="value-card__accent"></div>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'BrandValues',
  setup() {
    const hoveredIndex = ref(null)
    const tilt = reactive({ x: 0, y: 0 })
    const mousePos = reactive({ x: 50, y: 50 })

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
          <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
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

    function handleMouseMove(e) {
      if (hoveredIndex.value === null) return
      
      const card = e.currentTarget.children[hoveredIndex.value]
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      tilt.x = ((y - centerY) / centerY) * -10
      tilt.y = ((x - centerX) / centerX) * 10

      mousePos.x = (x / rect.width) * 100
      mousePos.y = (y / rect.height) * 100
    }

    function resetTilt() {
      hoveredIndex.value = null
      tilt.x = 0
      tilt.y = 0
    }

    return { 
      values, 
      hoveredIndex, 
      tilt, 
      mousePos, 
      handleMouseMove, 
      resetTilt 
    }
  }
}
</script>

<style scoped>
.values {
  background: var(--c-dark);
  border-top: 1px solid rgba(92, 82, 72, 0.1);
  border-bottom: 1px solid rgba(92, 82, 72, 0.1);
  position: relative;
  overflow: hidden;
}

.values::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background-image: url('/img/Logotipo.png');
  background-repeat: repeat;
  background-size: 180px;
  opacity: 0.15;
  transform: rotate(-30deg);
  pointer-events: none;
  z-index: 0;
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
  position: relative;
  z-index: 2;
  text-shadow: 0 0 30px var(--c-dark), 0 0 10px var(--c-dark);
}

/* Grid */
.values__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  background: rgba(92, 82, 72, 0.1);
}

/* Card */
.value-card {
  padding: 3rem 2.5rem;
  background: var(--c-dark-2);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: background var(--t-medium), transform 0.1s ease-out, box-shadow var(--t-medium);
  will-change: transform;
}

.value-card:hover {
  background: var(--c-dark-3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

/* Glare Effect */
.value-card__glare {
  position: absolute;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.12) 0%, transparent 60%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 5;
}

/* Icon */
.value-card__icon-wrapper {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(92, 82, 72, 0.08);
  transition: all var(--t-medium) var(--ease-spring);
  border: 1px solid rgba(92, 82, 72, 0.1);
  position: relative;
  z-index: 2;
}

.value-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-gold);
  transition: transform var(--t-medium) var(--ease-spring);
}

.value-card:hover .value-card__icon-wrapper {
  background: var(--c-gold);
  transform: translateY(-5px) scale(1.1);
  border-color: transparent;
  box-shadow: 0 10px 20px rgba(92, 82, 72, 0.2);
}

.value-card:hover .value-card__icon {
  color: var(--c-black);
}

/* Content */
.value-card__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--c-white);
  letter-spacing: 0.02em;
}

.value-card__text {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--c-light); /* Darker for better legibility */
  font-weight: 400;
}

/* Decorative number */
.value-card__number {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  font-family: var(--font-display);
  font-size: 4rem;
  color: rgba(0, 0, 0, 0.03); /* Subtle dark number */
  line-height: 1;
  pointer-events: none;
  user-select: none;
  transition: all var(--t-medium);
}

.value-card:hover .value-card__number {
  color: rgba(0, 0, 0, 0.15); /* Darker on hover */
  transform: translate(-10px, -10px) scale(1.05);
}

/* Bottom Accent */
.value-card__accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--c-gold);
  transition: width var(--t-medium) var(--ease-standard);
}

.value-card:hover .value-card__accent {
  width: 100%;
}

/* Responsive */
@media (max-width: 900px) {
  .values__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .values { padding: 4rem 0; }
  .values__title { font-size: 2.2rem; }
  .values::before {
    background-size: 110px;
    opacity: 0.12;
    transform: rotate(-25deg) scale(1.2);
  }
}

@media (max-width: 560px) {
  .values__grid {
    grid-template-columns: 1fr;
  }
}
</style>
