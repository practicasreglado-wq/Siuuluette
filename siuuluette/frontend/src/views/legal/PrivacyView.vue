<template>
  <LegalLayout
    title="Política de Privacidad"
    section="Legal"
    last-updated="2026"
  >
    <p>
      En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo,
      relativo a la Protección de las Personas Físicas en lo que respecta al Tratamiento de
      Datos Personales (RGPD), y de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección
      de Datos Personales y garantía de los derechos digitales (LOPDGDD), {{ COMPANY.legalName }}
      le informa sobre el tratamiento de sus datos personales.
    </p>

    <h2>1. Responsable del tratamiento</h2>
    <ul>
      <li><strong>Identidad:</strong> {{ COMPANY.legalName }}</li>
      <li><strong>NIF/CIF:</strong> {{ COMPANY.taxId }}</li>
      <li><strong>Dirección:</strong> {{ formattedAddress }}</li>
      <li><strong>Email:</strong> {{ COMPANY.email }}</li>
      <li v-if="COMPANY.dpoEmail"><strong>Delegado de Protección de Datos:</strong> {{ COMPANY.dpoEmail }}</li>
    </ul>

    <h2>2. Finalidades del tratamiento</h2>
    <p>Tratamos sus datos personales con las siguientes finalidades:</p>
    <ul>
      <li><strong>Gestión de pedidos y compras:</strong> tramitar las compras realizadas en el sitio web, gestionar el envío y emitir la facturación correspondiente.</li>
      <li><strong>Atención al cliente:</strong> responder a las consultas, dudas o reclamaciones que el usuario nos haga llegar.</li>
      <li><strong>Gestión de la cuenta de usuario:</strong> permitir el registro, autenticación y mantenimiento de la cuenta personal del usuario.</li>
      <li><strong>Comunicaciones comerciales:</strong> enviar información sobre nuevos productos, promociones, drops y actividades de la marca, siempre que el usuario haya prestado su consentimiento expreso.</li>
      <li><strong>Cumplimiento de obligaciones legales:</strong> conservar la información necesaria para cumplir las obligaciones tributarias, contables y de protección al consumidor.</li>
    </ul>

    <h2>3. Base jurídica del tratamiento</h2>
    <ul>
      <li><strong>Ejecución de un contrato:</strong> para la gestión de los pedidos y la cuenta de usuario.</li>
      <li><strong>Consentimiento del interesado:</strong> para el envío de comunicaciones comerciales y suscripción a la lista VIP.</li>
      <li><strong>Cumplimiento de obligación legal:</strong> para la facturación, conservación contable y atención de derechos de consumidores.</li>
      <li><strong>Interés legítimo:</strong> para la prevención del fraude y la mejora de los servicios.</li>
    </ul>

    <h2>4. Datos que recogemos</h2>
    <p>Los datos personales que tratamos son aquellos que el usuario nos facilita directamente:</p>
    <ul>
      <li>Nombre, apellidos y nombre de usuario.</li>
      <li>Dirección de correo electrónico.</li>
      <li>Teléfono (opcional).</li>
      <li>Dirección postal (necesaria para el envío del pedido).</li>
      <li>Información de pago (procesada de forma segura por Stripe; nosotros no almacenamos los datos completos de la tarjeta).</li>
      <li>Historial de pedidos realizados.</li>
    </ul>

    <h2>5. Plazo de conservación</h2>
    <p>
      Los datos serán conservados durante el tiempo necesario para cumplir con la finalidad
      para la que se recabaron y, posteriormente, durante los plazos legalmente exigidos:
    </p>
    <ul>
      <li><strong>Datos de pedidos y facturación:</strong> 6 años (artículo 30 del Código de Comercio y Ley General Tributaria).</li>
      <li><strong>Datos de la cuenta de usuario:</strong> mientras el usuario mantenga la cuenta activa. Si solicita la baja, se eliminarán salvo obligación legal de conservación.</li>
      <li><strong>Datos para comunicaciones comerciales:</strong> hasta que el usuario revoque el consentimiento.</li>
    </ul>

    <h2>6. Destinatarios de los datos</h2>
    <p>Sus datos podrán ser comunicados a los siguientes destinatarios:</p>
    <ul>
      <li><strong>Empresas de transporte y logística</strong> para la entrega del pedido.</li>
      <li><strong>Proveedores de pago (Stripe)</strong> para procesar las transacciones.</li>
      <li><strong>Proveedores de envío de email transaccional (Resend)</strong> para el envío de la confirmación del pedido y la factura.</li>
      <li><strong>Proveedores de almacenamiento en la nube (Supabase)</strong> que actúan como Encargados del Tratamiento.</li>
      <li><strong>Administraciones Públicas</strong> cuando exista obligación legal.</li>
    </ul>
    <p>
      Algunos de estos proveedores pueden estar ubicados fuera del Espacio Económico Europeo.
      En esos casos garantizamos que la transferencia se realiza con las garantías adecuadas
      conforme al RGPD (Cláusulas Contractuales Tipo aprobadas por la Comisión Europea o
      decisiones de adecuación).
    </p>

    <h2>7. Derechos del usuario</h2>
    <p>El usuario puede ejercer en cualquier momento los siguientes derechos:</p>
    <ul>
      <li><strong>Acceso</strong> a los datos personales que se traten.</li>
      <li><strong>Rectificación</strong> de los datos inexactos o incompletos.</li>
      <li><strong>Supresión</strong> ("derecho al olvido") cuando los datos ya no sean necesarios.</li>
      <li><strong>Limitación</strong> del tratamiento en determinadas circunstancias.</li>
      <li><strong>Oposición</strong> al tratamiento de sus datos.</li>
      <li><strong>Portabilidad</strong> de los datos a otro responsable.</li>
      <li><strong>Revocar el consentimiento</strong> prestado en cualquier momento.</li>
    </ul>
    <p>
      Para ejercer cualquiera de estos derechos, el usuario puede dirigirse por escrito a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>, indicando claramente el
      derecho que desea ejercer y acompañando copia del DNI o documento equivalente que
      acredite su identidad.
    </p>
    <p>
      Asimismo, el usuario tiene derecho a presentar una reclamación ante la
      <strong>Agencia Española de Protección de Datos</strong>
      (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>) si considera
      que el tratamiento no se ajusta a la normativa vigente.
    </p>

    <h2>8. Seguridad</h2>
    <p>
      {{ COMPANY.legalName }} ha implementado las medidas técnicas y organizativas necesarias
      para garantizar la seguridad de los datos personales y evitar su alteración, pérdida,
      tratamiento o acceso no autorizado, todo ello conforme al estado de la técnica.
    </p>
    <p>
      Las comunicaciones se realizan mediante conexión segura SSL/TLS y los datos sensibles
      como la información de pago son procesados directamente por proveedores certificados PCI-DSS
      (Stripe), sin que sean almacenados en nuestros sistemas.
    </p>

    <h2>9. Modificaciones</h2>
    <p>
      Nos reservamos el derecho a modificar la presente Política de Privacidad para adaptarla
      a novedades legislativas o jurisprudenciales. Cualquier cambio será comunicado mediante
      su publicación en este Sitio Web.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY, getFormattedAddress } from '../../config/company.js'

export default {
  name: 'PrivacyView',
  components: { LegalLayout },
  data() {
    return {
      COMPANY,
      formattedAddress: getFormattedAddress(),
    }
  },
}
</script>
