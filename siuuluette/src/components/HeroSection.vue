<template>
  <!-- ==========================================
       SIUULUETTE — Hero Section
       Full-screen cinematic hero with brand statement
       ========================================== -->
  <section class="hero">

    <!-- Background Video / Image Layer -->
    <div class="hero__bg">
      <div class="hero__bg-overlay"></div>
      <!-- Grain texture overlay -->
      <div class="hero__grain"></div>
    </div>

    <!-- Isotipo Large Background -->
    <div class="hero__isotipo-bg" aria-hidden="true">
      <img src="../assets/isotipo.jpeg" alt="" />
    </div>

    <!-- Content -->
    <div class="hero__content">
      <div class="hero__eyebrow">
        <span class="accent-line"></span>
        <span class="label">Nueva colección 2025</span>
      </div>

      <h1 class="hero__headline">
        <span class="hero__headline-line hero__headline-line--1">Viste</span>
        <span class="hero__headline-line hero__headline-line--2">la</span>
        <span class="hero__headline-line hero__headline-line--3">victoria</span>
      </h1>

      <p class="hero__subline">
        No sigas tendencias. Créalas.<br />
        <span>Sportswear premium para quienes no se rinden.</span>
      </p>

      <div class="hero__ctas">
        <a href="#colecciones" class="btn btn-primary hero__cta">
          Comprar ahora
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <a href="#drops" class="btn btn-outline hero__cta">
          Ver colección
        </a>
      </div>

      <!-- Stats bar -->
      <div class="hero__stats">
        <div class="hero__stat">
          <span class="hero__stat-num">6</span>
          <span class="hero__stat-label">Drops anuales</span>
        </div>
        <div class="hero__stat-divider"></div>
        <div class="hero__stat">
          <span class="hero__stat-num">500</span>
          <span class="hero__stat-label">Und. por drop</span>
        </div>
        <div class="hero__stat-divider"></div>
        <div class="hero__stat">
          <span class="hero__stat-num">10+</span>
          <span class="hero__stat-label">Países</span>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="hero__scroll-hint" aria-hidden="true">
      <span class="label">Scroll</span>
      <div class="hero__scroll-line">
        <div class="hero__scroll-dot"></div>
      </div>
    </div>

  </section>
</template>

<script>
export default { name: 'HeroSection' }
</script>

<style scoped>
/* --- Hero Container --- */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  padding: 0 2rem 6rem;
  overflow: hidden;
  background: var(--c-black);
  /* top padding for navbar */
  padding-top: 70px;
}

/* --- Background --- */
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 120% 80% at 60% 40%, rgba(201,169,110,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 80% 60% at 10% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
    var(--c-black);
}

.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(8,8,8,0.2) 0%,
    rgba(8,8,8,0.1) 40%,
    rgba(8,8,8,0.85) 80%,
    var(--c-black) 100%
  );
}

/* Grain texture */
.hero__grain {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* --- Large Isotipo Background --- */
.hero__isotipo-bg {
  position: absolute;
  right: -4%;
  top: 50%;
  transform: translateY(-50%);
  width: 55%;
  max-width: 700px;
  opacity: 0.06;
  z-index: 1;
  pointer-events: none;
  filter: invert(1);
}

.hero__isotipo-bg img {
  width: 100%;
  height: auto;
}

/* --- Content --- */
.hero__content {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Eyebrow */
.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.8s 0.2s both;
}

/* Headline */
.hero__headline {
  display: block;
  margin-bottom: 2rem;
}

.hero__headline-line {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(5.5rem, 16vw, 16rem);
  line-height: 0.88;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  animation: heroLine 0.9s var(--ease-standard) both;
}

.hero__headline-line--1 { animation-delay: 0.3s; color: var(--c-white); }
.hero__headline-line--2 { animation-delay: 0.45s; color: rgba(245,243,239,0.4); padding-left: 8vw; }
.hero__headline-line--3 { animation-delay: 0.6s; color: var(--c-gold); }

@keyframes heroLine {
  from { opacity: 0; transform: translateY(60px) skewY(3deg); }
  to   { opacity: 1; transform: translateY(0) skewY(0); }
}

/* Subline */
.hero__subline {
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  font-weight: 300;
  color: var(--c-light);
  margin-bottom: 2.5rem;
  line-height: 1.7;
  max-width: 450px;
  animation: fadeIn 0.8s 0.8s both;
}

.hero__subline span { color: var(--c-off-white); }

/* CTAs */
.hero__ctas {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 4rem;
  animation: fadeIn 0.8s 1s both;
}

/* Stats */
.hero__stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  animation: fadeIn 0.8s 1.2s both;
}

.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.hero__stat-num {
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1;
  color: var(--c-white);
  letter-spacing: 0.02em;
}

.hero__stat-label {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-grey);
}

.hero__stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.12);
}

/* Scroll indicator */
.hero__scroll-hint {
  position: absolute;
  bottom: 2.5rem;
  right: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  z-index: 2;
  animation: fadeIn 1s 1.4s both;
}

.hero__scroll-line {
  width: 1px;
  height: 60px;
  background: rgba(255,255,255,0.15);
  position: relative;
  overflow: hidden;
}

.hero__scroll-dot {
  width: 1px;
  height: 20px;
  background: var(--c-gold);
  animation: scrollDown 2s ease-in-out infinite;
}

@keyframes scrollDown {
  0%   { transform: translateY(-20px); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: translateY(60px); opacity: 0; }
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .hero {
    padding: 70px 1.5rem 4rem;
    align-items: flex-end;
  }
  .hero__isotipo-bg { width: 90%; right: -20%; opacity: 0.04; }
  .hero__stats { gap: 1.2rem; }
  .hero__scroll-hint { display: none; }
}

@media (max-width: 480px) {
  .hero__ctas { flex-direction: column; }
  .hero__ctas .btn { width: 100%; }
}
</style>
