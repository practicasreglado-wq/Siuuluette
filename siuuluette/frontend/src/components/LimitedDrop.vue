<template>
  <!-- ==========================================
       SIUULUETTE — Limited Drop Section
       Exclusive drop reveal block with countdown
       ========================================== -->
  <section class="drop">
    <div class="drop__inner">

      <!-- Background Isotipo -->
      <div class="drop__bg-isotipo" aria-hidden="true">
        <img src="/Siu_white.png" alt="" />
      </div>

      <!-- Content -->
      <div class="drop__content">

        <div class="drop__eyebrow">
          <span class="drop__dot"></span>
          <span class="label">Disponible ahora — Unidades limitadas</span>
        </div>

        <p class="drop__edition">Drop 02</p>

        <h2 class="drop__title">
          Las<br/>
          <em>4:00</em><br/>
          AM.
        </h2>

        <p class="drop__desc">
          Cuando nadie te ve, tú ya estás trabajando.<br />
          350 unidades. Negro absoluto. Nunca se repone.
        </p>

        <!-- Stock Meter -->
        <div class="drop__stock">
          <div class="drop__stock-header">
            <span class="label">Stock restante</span>
            <span class="drop__stock-num">{{ stockLeft }} / 350</span>
          </div>
          <div class="drop__stock-bar">
            <div class="drop__stock-fill" :style="{ width: stockPct + '%' }"></div>
          </div>
          <p class="drop__stock-warning" v-if="stockLeft < 100">
            ⚡ Quedan menos de 100 unidades
          </p>
        </div>

        <!-- Price -->
        <div class="drop__price-block">
          <span class="drop__price">€195</span>
          <span class="drop__price-note">Precio único. Sin restock.</span>
        </div>

        <div class="drop__actions">
          <button class="btn btn-primary drop__cta" @click="handleDrop">
            Acceder al drop
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <span class="drop__vip-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Acceso VIP 24h antes
          </span>
        </div>
      </div>

      <!-- Side visual -->
      <div class="drop__visual">
        <div class="drop__product-card drop__product-card--silhouette">
          <div class="drop__silhouette-wrapper">
            <img
              src="/Siu_white.png"
              alt="Siuuluette Brand Silhouette"
              class="drop__product-img-silhouette"
            />
          </div>
          <div class="drop__product-info">
            <span class="label">Diseño exclusivo</span>
            <p>Edición Limitada — Próximamente</p>
            <div class="drop__product-tags">
              <span class="badge badge-gold">Numerado</span>
              <span class="badge badge-dark">Coleccionable</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'LimitedDrop',
  emits: ['add-to-cart'],
  data() {
    return {
      stockLeft: 147,
    }
  },
  computed: {
    stockPct() {
      return (this.stockLeft / 350) * 100
    }
  },
  methods: {
    handleDrop() {
      this.$emit('add-to-cart', {
        id: 99,
        name: 'Hoodie Drop 02 — Las 4AM',
        category: 'Ediciones Limitadas',
        price: 195,
        image: '/Siu_white.png',
      })
    }
  }
}
</script>

<style scoped>
.drop {
  background: var(--c-dark);
  position: relative;
  overflow: hidden;
}

.drop__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

/* Background Isotipo */
.drop__bg-isotipo {
  position: absolute;
  left: -5%;
  top: 50%;
  transform: translateY(-50%);
  width: 50%;
  opacity: 0.03;
  pointer-events: none;
  filter: invert(1);
  z-index: 1;
}
.drop__bg-isotipo img { width: 100%; }

/* Eyebrow */
.drop__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.drop__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-gold);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(92, 82, 72, 0.4); }
  50%       { opacity: 0.8; transform: scale(1.1); box-shadow: 0 0 0 8px rgba(92, 82, 72, 0); }
}

/* Edition */
.drop__edition {
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 0.3em;
  color: var(--c-grey);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

/* Title */
.drop__title {
  font-family: var(--font-display);
  font-size: clamp(5rem, 9vw, 10rem);
  line-height: 0.88;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--c-white);
  margin-bottom: 2rem;
}

.drop__title em {
  font-style: normal;
  color: var(--c-gold);
}

/* Description */
.drop__desc {
  font-size: 1rem;
  font-weight: 300;
  color: var(--c-light);
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 380px;
}

/* Stock meter */
.drop__stock {
  margin-bottom: 2rem;
  max-width: 380px;
}

.drop__stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.drop__stock-num {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--c-off-white);
}

.drop__stock-bar {
  height: 3px;
  background: rgba(92, 82, 72, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.drop__stock-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-gold-dark), var(--c-gold));
  border-radius: 2px;
  transition: width 1s var(--ease-standard);
}

.drop__stock-warning {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #e57373;
  font-weight: 500;
}

/* Price */
.drop__price-block {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 2rem;
}

.drop__price {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--c-white);
  letter-spacing: 0.04em;
}

.drop__price-note {
  font-size: 0.75rem;
  color: var(--c-grey);
  letter-spacing: 0.08em;
}

/* Actions */
.drop__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.drop__cta { min-width: 200px; }

.drop__vip-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--c-grey);
  letter-spacing: 0.06em;
}

.drop__visual { 
  position: relative; 
  display: flex;
  justify-content: center;
}

.drop__product-card {
  width: 100%;
  max-width: 460px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--c-dark-2);
  border: 1px solid rgba(92, 82, 72, 0.12);
  box-shadow: var(--shadow-card);
  transition: transform 0.4s var(--ease-standard);
}

.drop__product-card:hover {
  transform: translateY(-5px);
  border-color: rgba(92, 82, 72, 0.3);
}

.drop__product-img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
}

.drop__silhouette-wrapper {
  width: 100%;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(92, 82, 72, 0.15) 0%, transparent 70%);
  padding: 4rem;
}

.drop__product-img-silhouette {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  filter: invert(1)
          drop-shadow(0 0 20px rgba(92, 82, 72, 0.25)) 
          drop-shadow(0 0 40px rgba(92, 82, 72, 0.12));
  opacity: 0.9;
}

.drop__product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drop__product-info p {
  font-size: 0.85rem;
  color: var(--c-light);
}

.drop__product-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 900px) {
  .drop__inner {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: var(--space-lg) var(--space-md);
  }
  .drop__visual { order: -1; max-width: 400px; }
}

@media (max-width: 480px) {
  .drop__actions { flex-direction: column; align-items: flex-start; }
  .drop__cta { width: 100%; }
}
</style>
