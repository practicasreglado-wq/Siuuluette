<template>
  <LegalLayout
    title="Marca Registrada"
    section="Legal"
    last-updated="2026"
  >
    <h2>Le Siuuluette<sup>®</sup>: una marca protegida</h2>
    <p>
      <strong>{{ COMPANY.registeredMark }}</strong> y el logotipo asociado son una marca
      registrada propiedad de {{ COMPANY.legalName }}. La marca se encuentra protegida bajo
      la legislación española y europea en materia de propiedad intelectual e industrial.
    </p>

    <h2>1. Alcance de la protección</h2>
    <p>
      El símbolo <strong>®</strong> que acompaña al nombre y al logotipo de Le Siuuluette
      indica que la marca está oficialmente registrada en los siguientes organismos:
    </p>
    <ul>
      <li><strong>Oficina Española de Patentes y Marcas (OEPM)</strong> — España</li>
      <li><strong>Oficina de Propiedad Intelectual de la Unión Europea (EUIPO)</strong> — protección extendida a los 27 Estados miembros</li>
    </ul>
    <p>
      Esta protección abarca el nombre, el logotipo, el isotipo de la silueta y los elementos
      gráficos asociados a la identidad de marca, en las clases relevantes del Acuerdo de
      Niza (vestuario, calzado, artículos deportivos, accesorios, contenidos digitales y
      otros usos comerciales).
    </p>

    <h2>2. Usos no autorizados</h2>
    <p>
      Cualquier uso, reproducción, distribución, comunicación pública, transformación o
      explotación comercial del nombre, logotipo o elementos gráficos de
      {{ COMPANY.registeredMark }} <strong>requiere autorización expresa y por escrito</strong>
      por parte de {{ COMPANY.legalName }}.
    </p>
    <p>Quedan expresamente prohibidas, sin autorización previa:</p>
    <ul>
      <li>La fabricación, importación o comercialización de productos que reproduzcan total o parcialmente la marca o el logotipo.</li>
      <li>El uso de la marca en publicidad, dominios web o redes sociales que pueda inducir a confusión sobre el origen del producto.</li>
      <li>La reventa de productos falsificados o que imiten elementos distintivos de la marca.</li>
      <li>La utilización del logotipo o de la silueta en contextos que puedan dañar la imagen o reputación de la marca.</li>
    </ul>

    <h2>3. Política de tolerancia cero contra falsificaciones</h2>
    <p>
      {{ COMPANY.tradeName }} mantiene una política activa de monitoreo y defensa de su
      marca. Las infracciones detectadas serán perseguidas por las vías civil y penal
      previstas en la legislación, incluyendo:
    </p>
    <ul>
      <li>Acciones de cesación e indemnización conforme a la Ley 17/2001 de Marcas.</li>
      <li>Acciones por competencia desleal conforme a la Ley 3/1991.</li>
      <li>Denuncia ante las autoridades aduaneras para la incautación de productos falsificados.</li>
      <li>Acciones penales en los supuestos previstos en los artículos 273 y siguientes del Código Penal.</li>
    </ul>

    <h2>4. Denuncia de infracciones</h2>
    <p>
      Si has detectado un uso no autorizado de la marca {{ COMPANY.registeredMark }} o
      productos que parecen ser falsificaciones, puedes ayudarnos comunicándolo a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>, indicando:
    </p>
    <ul>
      <li>URL, plataforma o ubicación física del uso detectado.</li>
      <li>Descripción del producto o uso.</li>
      <li>Capturas de pantalla o fotografías si dispones de ellas.</li>
    </ul>
    <p>
      Tu colaboración nos ayuda a proteger la autenticidad de la marca y la confianza de
      nuestra comunidad.
    </p>

    <h2>5. Solicitudes de licencia o colaboración</h2>
    <p>
      Si estás interesado en una colaboración comercial, una licencia de uso de la marca o
      una alianza estratégica con {{ COMPANY.tradeName }}, puedes contactarnos en
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>. Estudiaremos tu propuesta
      y, en caso de interés mutuo, formalizaremos un acuerdo por escrito.
    </p>

    <h2>6. Filosofía de marca</h2>
    <p class="callout">
      Le Siuuluette no es solo una marca de ropa: es el símbolo de todo lo que se puede
      conseguir cuando decides no rendirte. Por eso protegemos su autenticidad con la
      misma intensidad con la que la creamos.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'TrademarkView',
  components: { LegalLayout },
  data() { return { COMPANY } },
}
</script>
