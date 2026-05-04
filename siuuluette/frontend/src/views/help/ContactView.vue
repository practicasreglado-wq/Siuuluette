<template>
  <LegalLayout title="Contacto" section="Ayuda">

    <p>
      Estamos aquí para ayudarte. La mejor forma de contactar con nosotros es por correo
      electrónico — solemos responder en menos de 24 horas laborables.
    </p>

    <h2>Atención al cliente</h2>
    <p>
      <strong>Email:</strong>
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>
    </p>
    <p v-if="COMPANY.phone">
      <strong>Teléfono:</strong> {{ COMPANY.phone }}
    </p>
    <p>
      <strong>Horario:</strong> Lunes a viernes, de 10:00 a 18:00 (CET).
    </p>

    <h2>¿Para qué tipo de consulta es cada vía?</h2>
    <ul>
      <li><strong>Pedidos, envíos y devoluciones:</strong> el email es la opción más rápida — incluye tu número de pedido si lo tienes.</li>
      <li><strong>Tallas y producto:</strong> escríbenos contándonos tu altura, peso y talla habitual y te recomendamos.</li>
      <li><strong>Colaboraciones, prensa o influencers:</strong> envíanos un email con el asunto "Colaboración" y nos pondremos en contacto.</li>
      <li><strong>Marca registrada / falsificaciones:</strong> consulta nuestra
        <router-link to="/marca-registrada">página de Marca Registrada</router-link>.</li>
    </ul>

    <h2>Datos del titular</h2>
    <p>
      <strong>{{ COMPANY.legalName }}</strong><br>
      NIF/CIF: {{ COMPANY.taxId }}<br>
      {{ formattedAddress }}
    </p>

    <h2>Redes sociales</h2>
    <p>
      Síguenos en nuestras redes sociales para estar al tanto de los próximos drops y
      contenido exclusivo. Por mensajería privada también solemos responder, aunque para
      consultas sobre pedidos el email sigue siendo más rápido y ordenado.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY, getFormattedAddress } from '../../config/company.js'

export default {
  name: 'ContactView',
  components: { LegalLayout },
  data() {
    return {
      COMPANY,
      formattedAddress: getFormattedAddress(),
    }
  },
}
</script>
