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
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 220px);
  gap: 16px;
}

/* Make first card span 2 rows */
.cat-card:first-child {
  grid-row: span 2;
}

/* Card */
.cat-card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  display: block;
  background-image: var(--cat-img);
  background-size: cover;
  background-position: center;
  transition: transform var(--t-medium) var(--ease-standard);
}

.cat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(8,8,8,0.85) 0%,
    rgba(8,8,8,0.3) 50%,
    rgba(8,8,8,0.1) 100%
  );
  transition: background var(--t-medium);
  z-index: 1;
}

.cat-card:hover {
  transform: scale(1.015);
}

.cat-card:hover::before {
  background: linear-gradient(
    to top,
    rgba(8,8,8,0.9) 0%,
    rgba(8,8,8,0.5) 60%,
    rgba(8,8,8,0.2) 100%
  );
}

/* Shimmer effect on hover */
.cat-card__shimmer {
  position: absolute;
  top: 0;
  left: -120%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.06),
    transparent
  );
  transform: skewX(-20deg);
  transition: left 0.6s var(--ease-standard);
  z-index: 2;
  pointer-events: none;
}

.cat-card:hover .cat-card__shimmer {
  left: 180%;
}

/* Content */
.cat-card__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cat-card__count {
  opacity: 0;
  transform: translateY(4px);
  transition: all var(--t-medium) var(--ease-standard);
}

.cat-card:hover .cat-card__count {
  opacity: 1;
  transform: translateY(0);
}

.cat-card__name {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-white);
  line-height: 1;
}

.cat-card__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-gold);
  color: var(--c-black);
  margin-top: 0.5rem;
  opacity: 0;
  transform: translateX(-8px);
  transition: all var(--t-medium) var(--ease-spring);
}

.cat-card:hover .cat-card__arrow {
  opacity: 1;
  transform: translateX(0);
}

/* --- Responsive --- */
@media (max-width: 900px) {
  .categories__grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
  .cat-card:first-child { grid-row: span 1; }
}

@media (max-width: 580px) {
  .categories__grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, 160px);
  }
}

@media (max-width: 380px) {
  .categories__grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .cat-card { height: 200px; }
}
</style>
