<template>
  <section class="hero">
    
    <!-- Background Layers -->
    <div class="hero__bg">
      <div class="hero__bg-overlay"></div>
      <div class="hero__grain"></div>
    </div>

    <!-- Efecto Linterna (Ahora detrás de los isotipos) -->
    <div class="hero__flashlight"></div>

    <!-- Isotipo Backgrounds (Layered) -->
    <div class="hero__isotipo-bg hero__isotipo-bg--large">
      <video autoplay muted loop playsinline class="hero__isotipo-video">
        <source src="/SiuuTipo2.webm" type="video/webm" />
      </video>
    </div>

    <div class="hero__isotipo-bg">
      <video autoplay muted loop playsinline class="hero__isotipo-video">
        <source src="/SiuuTipo2.webm" type="video/webm" />
      </video>
    </div>

    <!-- Decorative Sidebar (Desktop only) -->
    <div class="hero__sidebar">
      <div class="hero__sidebar-line"></div>
      <span class="hero__sidebar-text">LE SIUULUETTE · BRAND · 2026</span>
      <div class="hero__sidebar-line"></div>
    </div>

    <!-- Main Container -->
    <div class="hero__container">
      <div class="hero__content">
        
        <!-- Eyebrow / Label -->
        <div class="hero__label-wrapper">
          <span class="hero__label-line"></span>
          <span class="hero__label">Nueva colección — Victoria</span>
        </div>

        <!-- Headline (Restaurado el estilo de 3 colores) -->
        <div class="hero__title-wrapper">
          <h1 class="hero__title">
            <span class="hero__title-line hero__title-line--1">Viste</span>
            <span class="hero__title-line hero__title-line--2">la</span>
            <span class="hero__title-line hero__title-line--3">victoria</span>
          </h1>
        </div>

        <!-- Subheadline -->
        <p class="hero__subtitle">
          No sigas tendencias. Créalas. Sportswear de alto rendimiento diseñado para quienes entienden que la victoria se viste cada día.
        </p>

        <!-- Actions -->
        <div class="hero__actions">
          <a href="#explora" class="btn btn-primary hero__btn">
            Comprar ahora
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="#ofertas" class="btn btn-outline hero__btn">
            Ver ofertas
          </a>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="hero__scroll">
      <span class="hero__scroll-text">Explora</span>
      <div class="hero__scroll-line">
        <div class="hero__scroll-dot"></div>
      </div>
    </div>

  </section>
</template>

<script>
export default {
  name: 'HeroSection'
}
</script>

<style scoped>
/* --- Hero Core --- */
.hero {
  position: relative;
  min-height: calc(100svh - 121px); 
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  overflow: hidden;
  background: var(--c-black); /* Cream */
  isolation: isolate;
}

/* --- Backgrounds --- */
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--c-black);
}

.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 30%, rgba(197, 163, 106, 0.08) 0%, transparent 70%);
}

.hero__flashlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0; /* Detrás de los videos */
  /* Linterna ajustada para rodear la figura grande */
  background: radial-gradient(
    circle at 77% 43%, 
    rgb(255, 255, 255) 0%, 
    rgb(255, 255, 255) 15%, 
    rgba(255, 255, 255, 0.831) 18%, /* Borde del halo */
    transparent 20%
  );
  opacity: 0.8;
}

.hero__grain {
  position: absolute;
  inset: -100%;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
  animation: grain 4s steps(10) infinite;
  pointer-events: none;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  50% { transform: translate(-15%, 10%); }
  90% { transform: translate(-10%, 10%); }
}

.hero__isotipo-bg {
  position: absolute;
  right: 15%;
  top: 30%;
  width: 70%;
  max-width: 950px;
  z-index: 2; /* Encima de la versión grande */
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 1;
}

.hero__isotipo-bg--large {
  right: -12%;
  top: -6%;
  width: 95%;
  max-width: 1350px;
  z-index: 1; /* Detrás */
  opacity: 0.75; /* Ajustado por el usuario */
}

.hero__isotipo-video {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.7;
  /* Hardware acceleration hacks to force blend-mode support */
  transform: translateZ(0);
  backface-visibility: hidden;
  /* Push any off-white to pure white for better multiply blending */
  filter: contrast(1.4) brightness(1.1);
}

@media (max-width: 1024px) {
  .hero__isotipo-bg {
    width: 90%;
    right: -20%;
    top: 30%;
    opacity: 0.2;
  }
}

/* --- Sidebar --- */
.hero__sidebar {
  position: absolute;
  left: 2rem;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 10rem 0;
  z-index: 10;
}

@media (max-width: 1024px) {
  .hero__sidebar { display: none; }
}

.hero__sidebar-line {
  width: 1px;
  flex: 1;
  background: rgba(92, 82, 72, 0.2);
}

.hero__sidebar-text {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: rgba(92, 82, 72, 0.655);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

/* --- Container & Content --- */
.hero__container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  z-index: 5;
}

@media (min-width: 1024px) {
  .hero__container {
    padding-left: 6rem;
  }
}

.hero__content {
  max-width: 850px;
}

/* Label / Eyebrow */
.hero__label-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  animation: fadeIn 0.8s ease-out both;
}

.hero__label-line {
  width: 3.5rem;
  height: 1px;
  background: var(--c-gold);
}

.hero__label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--c-gold);
}

/* Title Wrapper */
.hero__title-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.hero__title {
  display: flex;
  flex-direction: column;
}

.hero__title-line {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 10vw, 8.5rem);
  line-height: 0.85;
  text-transform: uppercase;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero__title-line--1 { color: var(--c-white); animation-delay: 0.2s; }
.hero__title-line--2 { 
  color: rgba(92, 82, 72, 0.6); 
  animation-delay: 0.35s;
  padding-left: 2rem;
}
.hero__title-line--3 { color: var(--c-gold); animation-delay: 0.5s; }

/* Subtitle */
.hero__subtitle {
  font-family: var(--font-body);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  color: rgba(92, 82, 72, 0.689);
  max-width: 550px;
  line-height: 1.6;
  margin-top: 2rem;
  margin-bottom: 3.5rem;
  animation: fadeUp 1s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Actions */
.hero__actions {
  display: flex;
  gap: 1.5rem;
  animation: fadeUp 1s 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero__btn {
  padding: 1rem 2.5rem !important;
}

/* --- Scroll --- */
.hero__scroll {
  position: absolute;
  bottom: 3rem;
  right: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) { .hero__scroll { display: none; } }

.hero__scroll-text {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(92, 82, 72, 0.5);
  writing-mode: vertical-rl;
}

.hero__scroll-line {
  width: 1px;
  height: 4rem;
  background: rgba(92, 82, 72, 0.2);
  position: relative;
  overflow: hidden;
}

.hero__scroll-dot {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 40%;
  background: var(--c-gold);
  animation: scrollAnim 2s infinite ease-in-out;
}

@keyframes scrollAnim {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(250%); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .hero__actions { flex-direction: column; width: 100%; }
  .hero__btn { justify-content: center; }
}
</style>
