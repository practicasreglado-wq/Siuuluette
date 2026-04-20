<template>
  <!-- ==========================================
       SIUULUETTE — Category Grid
       6 visual category cards
       ========================================== -->
  <section class="categories section">
    <div class="container">

      <div class="categories__header">
        <span class="accent-line"></span>
        <span class="label">Explora</span>
        <h2 class="display-md categories__title">Todo lo que necesitas</h2>
      </div>

      <div class="categories__grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-card"
          :style="{ '--cat-img': `url(${cat.image})` }"
          @click="$emit('category-select', cat.name)"
        >
          <!-- Hover shimmer line -->
          <div class="cat-card__shimmer" aria-hidden="true"></div>

          <div class="cat-card__content">
            <span class="cat-card__count label">{{ cat.count }} productos</span>
            <h3 class="cat-card__name">{{ cat.name }}</h3>
            <span class="cat-card__arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { categories } from '../data/products.js'
export default {
  name: 'CategoryGrid',
  emits: ['category-select'],
  setup() { return { categories } }
}
</script>

<style scoped>
.categories {
  background: var(--c-dark);
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

/* Header */
.categories__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.categories__title { color: var(--c-white); }

/* Grid */
.categories__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* Card */
.cat-card {
  position: relative;
  height: 550px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-image: var(--cat-img);
  background-size: cover;
  background-position: center;
  transition: all 0.6s var(--ease-standard);
  border: 1px solid rgba(255,255,255,0.05);
}

.cat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(8,8,8,0.95) 0%,
    rgba(8,8,8,0.4) 40%,
    transparent 100%
  );
  transition: opacity 0.5s var(--ease-standard);
  z-index: 1;
}

.cat-card:hover {
  transform: translateY(-12px);
  border-color: rgba(201, 169, 110, 0.3);
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
}

/* Shimmer effect on hover */
.cat-card__shimmer {
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.08),
    transparent
  );
  transform: skewX(-25deg);
  transition: left 0.8s var(--ease-standard);
  z-index: 2;
}

.cat-card:hover .cat-card__shimmer {
  left: 150%;
}

/* Content */
.cat-card__content {
  position: relative;
  z-index: 3;
  margin: 1.5rem;
  padding: 2.5rem 2rem;
  background: rgba(15, 15, 15, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.5s var(--ease-standard);
}

.cat-card:hover .cat-card__content {
  background: rgba(201, 169, 110, 0.12);
  border-color: rgba(201, 169, 110, 0.4);
  transform: translateY(-5px);
}

.cat-card__count {
  color: var(--c-gold);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  opacity: 0.8;
}

.cat-card__name {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--c-white);
  line-height: 1;
}

.cat-card__arrow {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--c-gold);
  color: var(--c-black);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8) rotate(-45deg);
  transition: all 0.5s var(--ease-spring);
}

.cat-card:hover .cat-card__arrow {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .categories__grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .cat-card { height: 450px; }
  .cat-card__content { padding: 2rem 1.5rem; }
}

@media (max-width: 480px) {
  .cat-card { height: 350px; }
  .cat-card__name { font-size: 1.75rem; }
}
</style>
