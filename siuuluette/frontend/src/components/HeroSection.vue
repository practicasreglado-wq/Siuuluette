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
      <img src="/Siu_white.png" alt="" />
    </div>

    <!-- Content -->
    <div class="hero__content">
      <div class="hero__eyebrow">
        <span class="accent-line"></span>
        <span class="label">Nueva colección 2026</span>
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
          Ver limitados
        </a>
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
  padding: 0 2rem 2rem;
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
    radial-gradient(ellipse 120% 80% at 60% 40%, rgba(92, 82, 72, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 80% 60% at 10% 80%, rgba(92, 82, 72, 0.02) 0%, transparent 50%),
    var(--c-black);
}

.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(229, 224, 216, 0) 0%,
    rgba(229, 224, 216, 0.2) 40%,
    rgba(229, 224, 216, 0.8) 80%,
    var(--c-black) 100%
  );
}

/* Grain texture */
.hero__grain {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}

/* --- Large Isotipo Background --- */
.hero__isotipo-bg {
  position: absolute;
  right: 2%;
  top: 50%;
  transform: translateY(-40%);
  width: 75%;
  max-width: 900px;
  z-index: 1;
  pointer-events: none;
}

.hero__isotipo-bg img {
  width: 100%;
  height: auto;
  filter: invert(1)
          drop-shadow(0 0 22px rgba(207, 153, 71, 0.612)) 
          drop-shadow(0 0 40px rgba(234, 205, 116, 0.523));
  opacity: 0.36;
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
.hero__headline-line--2 { 
  animation-delay: 0.45s; 
  color: rgba(149, 148, 147, 0.559); 
  padding-left: 8vw;
  letter-spacing: 0.05em; /* Add space between L and A */
}
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
  animation: fadeIn 0.8s 1s both;
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
  .hero__isotipo-bg { width: 110%; right: -10%; opacity: 0.15; }
  .hero__scroll-hint { display: none; }
}

@media (max-width: 480px) {
  .hero__ctas { flex-direction: column; }
  .hero__ctas .btn { width: 100%; }
}
</style>
