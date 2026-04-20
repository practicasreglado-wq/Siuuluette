<template>
  <!-- ==========================================
       SIUULUETTE — Newsletter Section
       Community / email capture block
       ========================================== -->
  <section class="newsletter">
    <div class="newsletter__inner">

      <!-- Left: Copy -->
      <div class="newsletter__copy">
        <span class="newsletter__isotipo" aria-hidden="true">
          <img src="/Siu_white.png" alt="" />
        </span>
        <span class="accent-line"></span>
        <span class="label">Acceso anticipado</span>
        <h2 class="display-md newsletter__title">
          Sé el primero.<br />
          <span>Siempre.</span>
        </h2>
        <p class="body-lg newsletter__sub">
          Únete a la comunidad. Recibe acceso exclusivo a cada drop 24 horas antes que nadie,
          descuentos reservados y contenido que no encontrarás en ningún otro sitio.
        </p>
        <div class="newsletter__perks">
          <div class="newsletter__perk" v-for="perk in perks" :key="perk">
            <span class="newsletter__perk-dot"></span>
            <span>{{ perk }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="newsletter__form-block">
        <form class="newsletter__form" @submit.prevent="handleSubmit" novalidate>
          <div class="newsletter__field">
            <label for="nl-name" class="newsletter__label">Tu nombre</label>
            <input
              id="nl-name"
              v-model="form.name"
              type="text"
              placeholder="Cómo quieres que te llamemos"
              class="newsletter__input"
              autocomplete="given-name"
            />
          </div>

          <div class="newsletter__field">
            <label for="nl-email" class="newsletter__label">Email</label>
            <input
              id="nl-email"
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              class="newsletter__input"
              :class="{ 'newsletter__input--error': emailError }"
              autocomplete="email"
            />
            <span class="newsletter__error" v-if="emailError">Por favor, introduce un email válido.</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary newsletter__submit"
            :disabled="submitted"
          >
            <span v-if="!submitted">Unirme a la familia</span>
            <span v-else>✓ Bienvenido/a a la familia</span>
          </button>

          <p class="newsletter__disclaimer">
            Sin spam. Solo lo que importa. Cancela cuando quieras.
          </p>
        </form>

        <!-- Proof -->
        <div class="newsletter__proof">
          <div class="newsletter__avatars" aria-hidden="true">
            <div
              v-for="(c, i) in ['C','A','M','R']"
              :key="i"
              class="newsletter__avatar"
              :style="{ left: `${i * 24}px`, zIndex: 4 - i }"
            >{{ c }}</div>
          </div>
          <p class="newsletter__proof-text">
            Más de <strong>12.000 personas</strong> ya en la lista
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'NewsletterSection',
  data() {
    return {
      form: { name: '', email: '' },
      emailError: false,
      submitted: false,
      perks: [
        'Acceso a drops 24h antes',
        'Descuentos exclusivos para miembros',
        'Contenido detrás de cámaras',
        'Invitaciones a eventos privados',
      ]
    }
  },
  methods: {
    handleSubmit() {
      this.emailError = false
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRx.test(this.form.email)) {
        this.emailError = true
        return
      }
      this.submitted = true
      // In production: call your API here
    }
  }
}
</script>

<style scoped>
.newsletter {
  background: var(--c-black);
  border-top: 1px solid rgba(92, 82, 72, 0.12);
}

.newsletter__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
  align-items: center;
}

/* Isotipo decoration */
.newsletter__isotipo {
  display: block;
  width: 60px;
  opacity: 0.15;
  margin-bottom: 1.5rem;
  filter: invert(1);
}

.newsletter__isotipo img { width: 100%; }

/* Copy */
.newsletter__copy { display: flex; flex-direction: column; gap: 1rem; }

.newsletter__title {
  color: var(--c-white);
  margin-top: 0.5rem;
}

.newsletter__title span { color: var(--c-gold); }

.newsletter__sub {
  max-width: 440px;
  color: var(--c-light);
}

/* Perks list */
.newsletter__perks {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.newsletter__perk {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--c-light);
}

.newsletter__perk-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-gold);
  flex-shrink: 0;
}

/* Form block */
.newsletter__form-block {
  background: var(--c-dark);
  border-radius: var(--radius-lg);
  padding: 3rem;
  border: 1px solid rgba(92, 82, 72, 0.12);
}

.newsletter__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.newsletter__field { display: flex; flex-direction: column; gap: 0.4rem; }

.newsletter__label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-grey);
}

.newsletter__input {
  width: 100%;
  padding: 0.9rem 1.1rem;
  background: var(--c-dark-2);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  color: var(--c-white);
  font-size: 0.95rem;
  outline: none;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.newsletter__input::placeholder { color: var(--c-mid); }

.newsletter__input:focus {
  border-color: var(--c-gold);
  box-shadow: 0 0 0 3px rgba(92, 82, 72, 0.12);
}

.newsletter__input--error { border-color: #e57373; }
.newsletter__error {
  font-size: 0.75rem;
  color: #e57373;
  margin-top: 0.25rem;
}

.newsletter__submit {
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem;
  font-size: 0.95rem;
}

.newsletter__submit:disabled {
  background: #2e7d32;
  color: #fff;
  cursor: default;
}

.newsletter__disclaimer {
  font-size: 0.72rem;
  color: var(--c-grey);
  text-align: center;
  letter-spacing: 0.04em;
}

/* Social proof */
.newsletter__proof {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(92, 82, 72, 0.12);
}

.newsletter__avatars {
  position: relative;
  width: 88px;
  height: 36px;
  flex-shrink: 0;
}

.newsletter__avatar {
  position: absolute;
  top: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-mid);
  border: 2px solid var(--c-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--c-white);
}

.newsletter__avatar:nth-child(1) { background: #4a4a4a; }
.newsletter__avatar:nth-child(2) { background: var(--c-gold-dark); }
.newsletter__avatar:nth-child(3) { background: #3a5a4a; }
.newsletter__avatar:nth-child(4) { background: #5a3a4a; }

.newsletter__proof-text {
  font-size: 0.8rem;
  color: var(--c-grey);
  line-height: 1.4;
}

.newsletter__proof-text strong { color: var(--c-off-white); }

/* Responsive */
@media (max-width: 900px) {
  .newsletter__inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 480px) {
  .newsletter__form-block { padding: 2rem 1.5rem; }
}
</style>
