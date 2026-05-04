<template>
  <!-- ==========================================
       SIUULUETTE — Legal Layout
       Layout compartido por todas las páginas legales/ayuda/comunidad
       Provee título, breadcrumb y un wrapper consistente.
       ========================================== -->
  <div class="legal-page">
    <div class="legal-page__inner">

      <nav class="legal-page__breadcrumb">
        <router-link :to="{ name: 'home' }">Inicio</router-link>
        <span class="sep">/</span>
        <span class="muted">{{ section || 'Legal' }}</span>
        <span class="sep">/</span>
        <span>{{ title }}</span>
      </nav>

      <header class="legal-page__header">
        <span class="legal-page__eyebrow">{{ section || 'Información Legal' }}</span>
        <h1 class="legal-page__title">{{ title }}</h1>
        <p v-if="lastUpdated" class="legal-page__updated">
          Última actualización: {{ lastUpdated }}
        </p>
      </header>

      <article class="legal-page__content">
        <slot />
      </article>

    </div>
  </div>
</template>

<script>
export default {
  name: 'LegalLayout',
  props: {
    title:       { type: String, required: true },
    section:     { type: String, default: 'Legal' },
    lastUpdated: { type: String, default: '' },
  }
}
</script>

<style scoped>
.legal-page {
  min-height: 80vh;
  background: var(--c-black);
  color: var(--c-white);
  padding: calc(85px + 2rem) 2rem 4rem;
}

.legal-page__inner {
  max-width: 820px;
  margin: 0 auto;
}

/* Breadcrumb */
.legal-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.72rem;
  color: var(--c-grey);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
}
.legal-page__breadcrumb a {
  color: var(--c-grey);
  text-decoration: none;
  transition: color var(--t-fast);
}
.legal-page__breadcrumb a:hover { color: var(--c-gold); }
.legal-page__breadcrumb .sep    { opacity: 0.4; }
.legal-page__breadcrumb .muted  { color: var(--c-light); }

/* Header */
.legal-page__header {
  border-bottom: 1px solid rgba(92, 82, 72, 0.15);
  padding-bottom: 2rem;
  margin-bottom: 2.5rem;
}

.legal-page__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-gold);
  font-weight: 600;
  display: block;
  margin-bottom: 0.6rem;
}

.legal-page__title {
  font-family: var(--font-display);
  font-size: 2.4rem;
  letter-spacing: 0.02em;
  line-height: 1.15;
  color: var(--c-white);
  margin: 0;
}

.legal-page__updated {
  margin: 1rem 0 0;
  font-size: 0.78rem;
  color: var(--c-grey);
  letter-spacing: 0.04em;
}

/* Content (slot) */
.legal-page__content :deep(h2) {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: 0.04em;
  color: var(--c-white);
  margin: 2.5rem 0 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(92, 82, 72, 0.15);
}

.legal-page__content :deep(h2:first-child) {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.legal-page__content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--c-off-white);
  margin: 2rem 0 0.8rem;
}

.legal-page__content :deep(p) {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--c-light);
  margin: 0 0 1rem;
}

.legal-page__content :deep(ul),
.legal-page__content :deep(ol) {
  margin: 0 0 1.2rem;
  padding-left: 1.4rem;
}

.legal-page__content :deep(li) {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--c-light);
  margin-bottom: 0.4rem;
}

.legal-page__content :deep(strong) {
  color: var(--c-white);
  font-weight: 600;
}

.legal-page__content :deep(a) {
  color: var(--c-gold);
  text-decoration: underline;
  transition: color var(--t-fast);
}
.legal-page__content :deep(a:hover) { color: var(--c-accent-vibrant); }

.legal-page__content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2rem 0;
  font-size: 0.88rem;
}
.legal-page__content :deep(th),
.legal-page__content :deep(td) {
  padding: 0.7rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(92, 82, 72, 0.15);
}
.legal-page__content :deep(th) {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-grey);
  font-weight: 600;
}

.legal-page__content :deep(.callout) {
  background: rgba(92, 82, 72, 0.08);
  border-left: 3px solid var(--c-gold);
  padding: 1rem 1.2rem;
  margin: 1.5rem 0;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .legal-page { padding: calc(85px + 1rem) 1rem 3rem; }
  .legal-page__title { font-size: 1.7rem; }
}
</style>
