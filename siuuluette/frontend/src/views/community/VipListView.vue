<template>
  <LegalLayout title="Lista VIP" section="Comunidad">

    <p class="lead">
      Únete a la <strong>Lista VIP</strong> de Le Siuuluette y recibe acceso anticipado de
      24 horas a cada drop, antes que el público general. Solo unas cientos de unidades por
      lanzamiento, sin restock. Si no estás en la Lista VIP, lo más probable es que no
      llegues a tiempo.
    </p>

    <div class="vip-form">
      <form v-if="status !== 'success'" @submit.prevent="handleSubmit">
        <div class="vip-field">
          <label for="vip-email">Tu email</label>
          <input
            id="vip-email"
            v-model="email"
            type="email"
            required
            placeholder="tu@email.com"
            :disabled="status === 'loading'"
          />
        </div>

        <div class="vip-consent">
          <label>
            <input type="checkbox" v-model="consent" required />
            <span>
              Acepto recibir comunicaciones comerciales de Le Siuuluette y he leído la
              <router-link to="/privacidad">Política de Privacidad</router-link>.
            </span>
          </label>
        </div>

        <button
          type="submit"
          class="vip-submit"
          :disabled="status === 'loading' || !email || !consent"
        >
          {{ status === 'loading' ? 'Apuntándote...' : 'Quiero ser VIP' }}
        </button>

        <p v-if="status === 'error'" class="vip-error">
          Algo ha fallado. Inténtalo de nuevo en un momento o escríbenos a
          <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>.
        </p>
      </form>

      <div v-else class="vip-success">
        <h3>Bienvenido a la familia.</h3>
        <p>
          Te hemos apuntado a la Lista VIP. Recibirás el acceso anticipado al próximo drop
          en <strong>{{ email }}</strong> 24 horas antes que el público general.
        </p>
      </div>
    </div>

    <h2>¿Qué obtienes por unirte?</h2>
    <ul>
      <li><strong>Acceso anticipado de 24 horas</strong> a cada drop antes del público general.</li>
      <li><strong>Avisos de lanzamiento</strong> con la cuenta atrás exacta del próximo drop.</li>
      <li><strong>Contenido exclusivo</strong>: detrás de cámaras del proceso creativo, entrevistas con atletas embajadores y la historia de cada drop antes de su salida.</li>
      <li><strong>Invitaciones a pop-ups y eventos</strong> en Madrid, Barcelona y otras ciudades.</li>
      <li><strong>Beneficios sorpresa puntuales</strong> reservados solo a la lista.</li>
    </ul>

    <h2>El compromiso</h2>
    <p>
      No vendemos tu email. No te vamos a saturar. Recibirás como máximo
      <strong>2-3 emails al mes</strong>, todos con propósito y valor real. Si en algún
      momento dejas de querer recibirlos, puedes darte de baja con un solo clic desde
      cualquier email.
    </p>

    <h2>Una nota importante</h2>
    <p class="callout">
      Por nuestro modelo de drops limitados, las unidades se agotan en horas — a veces
      en minutos. La Lista VIP es la única forma de tener una probabilidad real de
      conseguir lo que quieres antes de que se agote. Make it real.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'VipListView',
  components: { LegalLayout },
  data() {
    return {
      COMPANY,
      email: '',
      consent: false,
      status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    }
  },
  methods: {
    async handleSubmit() {
      this.status = 'loading'
      try {
        // TODO: integrar con backend cuando exista el endpoint /api/newsletter
        // De momento simulamos un alta correcta para que la UX sea funcional.
        await new Promise(resolve => setTimeout(resolve, 800))
        this.status = 'success'
      } catch (err) {
        this.status = 'error'
      }
    },
  },
}
</script>

<style scoped>
.lead {
  font-size: 1.05rem !important;
  line-height: 1.7;
  color: var(--c-off-white) !important;
}

.vip-form {
  background: rgba(92, 82, 72, 0.08);
  border: 1px solid rgba(92, 82, 72, 0.2);
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
}

.vip-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.vip-field label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-grey);
  font-weight: 600;
}

.vip-field input {
  background: transparent;
  border: 1px solid rgba(92, 82, 72, 0.3);
  border-radius: 4px;
  padding: 0.85rem 1rem;
  color: var(--c-white);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color var(--t-fast);
}

.vip-field input:focus {
  outline: none;
  border-color: var(--c-gold);
}

.vip-consent {
  margin: 1.2rem 0;
  font-size: 0.85rem;
  color: var(--c-light);
  line-height: 1.5;
}

.vip-consent label {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  cursor: pointer;
}

.vip-consent input[type="checkbox"] {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.vip-submit {
  width: 100%;
  padding: 1rem;
  background: var(--c-gold);
  color: var(--c-black);
  border: none;
  border-radius: 4px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast);
}

.vip-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.vip-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vip-error {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--c-off-white);
}

.vip-success {
  text-align: center;
  padding: 1rem;
}

.vip-success h3 {
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 0.04em;
  color: var(--c-gold);
  margin-bottom: 1rem;
}

.vip-success p {
  font-size: 0.95rem;
  color: var(--c-off-white);
  line-height: 1.6;
}
</style>
