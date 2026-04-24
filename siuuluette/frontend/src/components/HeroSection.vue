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

    <!-- Large Isotipo Background -->
    <div class="hero__isotipo-bg">
      <div class="hero__trigger"></div>
      <img src="/Siu_white.png" alt="" />
      <div class="hero__siuu">SIUULUETTE!</div>
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
        <a href="#explora" class="btn btn-primary hero__cta">
          Comprar ahora
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <a href="#ofertas" class="btn btn-outline hero__cta">
          Ver ofertas
        </a>
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
  z-index: 5; /* Above content for hover reach */
  pointer-events: none; /* Let clicks pass through transparent areas */
}

.hero__isotipo-bg img {
  width: 100%;
  height: auto;
  filter: invert(1) brightness(0.3) sepia(0.8) hue-rotate(-15deg)
          drop-shadow(0 0 35px rgba(114, 100, 64, 0.502)) 
          drop-shadow(0 0 80px rgba(108, 94, 59, 0.687));
  opacity: 0.55;
  transition: all 0.3s ease;
  pointer-events: none; /* Image box no longer catches hover */
}

/* Precise Trigger Area */
.hero__trigger {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
  height: 45%;
  pointer-events: auto;
  z-index: 10;
  cursor: help;
}

/* Easter Egg Styles */
.hero__siuu {
  position: absolute;
  top: 10%;
  left: 60%;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 5rem);
  color: var(--c-gold);
  opacity: 0;
  transform: rotate(-12deg) skewX(-10deg) scale(0.5);
  transition: all 0.4s var(--ease-spring);
  pointer-events: none;
  text-shadow: 0 0 20px rgba(92, 82, 72, 0.5);
  z-index: 15;
}

.hero__trigger:hover ~ .hero__siuu {
  opacity: 1;
  transform: rotate(-12deg) skewX(-10deg) scale(1.1);
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

.hero__headline-line--1 { 
  animation-delay: 0.3s; 
  color: var(--c-white);
  background: linear-gradient(135deg, var(--c-white) 0%, var(--c-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero__headline-line--2 { 
  animation-delay: 0.45s; 
  color: rgba(149, 148, 147, 0.85); /* Increased opacity for better visibility */
  padding-left: 8vw;
  letter-spacing: 0.05em; 
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
}
.hero__headline-line--3 { 
  animation-delay: 0.6s; 
  color: var(--c-gold);
  text-shadow: 0 0 30px rgba(92, 82, 72, 0.2);
}

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


/* --- Responsive --- */
@media (max-width: 768px) {
  .hero {
    padding: 70px 1.5rem 4rem;
    align-items: flex-end;
  }
  .hero__isotipo-bg { width: 110%; right: -10%; opacity: 0.15; }
}

@media (max-width: 480px) {
  .hero__ctas { flex-direction: column; }
  .hero__ctas .btn { width: 100%; }
}
</style>
