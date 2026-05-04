<template>
  <LegalLayout
    title="Aviso Legal"
    section="Legal"
    last-updated="2026"
  >
    <h2>1. Información del titular del sitio web</h2>
    <p>
      En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de
      la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa de los
      siguientes datos del titular de este sitio web:
    </p>
    <ul>
      <li><strong>Razón social:</strong> {{ COMPANY.legalName }}</li>
      <li><strong>Marca comercial:</strong> {{ COMPANY.registeredMark }}</li>
      <li><strong>NIF/CIF:</strong> {{ COMPANY.taxId }}</li>
      <li><strong>Domicilio:</strong> {{ formattedAddress }}</li>
      <li><strong>Email de contacto:</strong> {{ COMPANY.email }}</li>
      <li v-if="COMPANY.phone"><strong>Teléfono:</strong> {{ COMPANY.phone }}</li>
      <li><strong>Sitio web:</strong> {{ COMPANY.websiteUrl }}</li>
      <li v-if="COMPANY.registryInfo"><strong>Registro Mercantil:</strong> {{ COMPANY.registryInfo }}</li>
    </ul>

    <h2>2. Objeto</h2>
    <p>
      El presente Aviso Legal regula el uso del sitio web {{ COMPANY.websiteUrl }} (en adelante,
      "el Sitio Web"), titularidad de {{ COMPANY.legalName }}. La navegación por el Sitio Web
      atribuye la condición de Usuario, lo que implica la aceptación plena y sin reservas de
      todas las disposiciones incluidas en este Aviso Legal, así como en la Política de
      Privacidad y la Política de Cookies, en la versión publicada en cada momento de acceso.
    </p>

    <h2>3. Condiciones de uso</h2>
    <p>
      El Usuario se compromete a hacer un uso adecuado y lícito del Sitio Web de conformidad
      con la legislación aplicable, el presente Aviso Legal, la moral y las buenas costumbres
      generalmente aceptadas y el orden público.
    </p>
    <p>
      Queda expresamente prohibido el uso del Sitio Web con fines ilegales o no autorizados,
      o que de cualquier forma puedan dañar, inutilizar, sobrecargar o deteriorar el Sitio Web
      o impedir la normal utilización por parte de los Usuarios.
    </p>

    <h2>4. Propiedad intelectual e industrial</h2>
    <p>
      Todos los contenidos del Sitio Web (textos, fotografías, gráficos, imágenes, iconos,
      tecnología, software, diseños, código fuente, marcas, nombres comerciales, logotipos
      y demás signos distintivos) son propiedad exclusiva de {{ COMPANY.legalName }} o cuenta
      con la correspondiente autorización para su uso.
    </p>
    <p>
      La marca <strong>{{ COMPANY.registeredMark }}</strong> y el logotipo asociado son una
      marca registrada de {{ COMPANY.legalName }}. Cualquier uso, reproducción, distribución
      o explotación no autorizada será perseguido conforme a la legislación vigente en
      materia de propiedad intelectual e industrial.
    </p>

    <h2>5. Exclusión de responsabilidad</h2>
    <p>
      {{ COMPANY.legalName }} realizará sus mejores esfuerzos por mantener el Sitio Web en
      perfecto estado de funcionamiento, pero no garantiza la disponibilidad ni continuidad
      del mismo, ni se responsabiliza de los daños o perjuicios que puedan derivarse de:
    </p>
    <ul>
      <li>Interrupciones, virus informáticos, averías telefónicas o desconexiones en el funcionamiento operativo del sistema electrónico.</li>
      <li>Retrasos o bloqueos en el uso del sistema electrónico causados por deficiencias o sobrecargas en las redes de telecomunicaciones.</li>
      <li>Daños producidos por terceros mediante intromisiones ilegítimas fuera del control de {{ COMPANY.legalName }}.</li>
      <li>Inexactitudes, omisiones o errores en los contenidos publicados.</li>
    </ul>

    <h2>6. Enlaces a sitios de terceros</h2>
    <p>
      El Sitio Web puede contener enlaces a sitios web de terceros. {{ COMPANY.legalName }} no
      asume responsabilidad alguna sobre el contenido, política de privacidad o prácticas de
      dichos sitios. La presencia de enlaces a otras páginas web no implica recomendación
      o aprobación.
    </p>

    <h2>7. Modificaciones</h2>
    <p>
      {{ COMPANY.legalName }} se reserva el derecho de efectuar sin previo aviso las
      modificaciones que considere oportunas en el Sitio Web, pudiendo cambiar, suprimir o
      añadir tanto los contenidos y servicios prestados como la forma en la que estos
      aparezcan presentados o localizados.
    </p>

    <h2>8. Legislación aplicable y jurisdicción</h2>
    <p>
      El presente Aviso Legal se rige en todos y cada uno de sus extremos por la legislación
      española. Para la resolución de cualquier conflicto que pudiera derivarse del acceso al
      Sitio Web, ambas partes se someten expresamente a los Juzgados y Tribunales del
      domicilio del Usuario en aquellos casos en los que la normativa contemple esta
      posibilidad.
    </p>

    <h2>9. Contacto</h2>
    <p>
      Para cualquier consulta relacionada con el presente Aviso Legal, puede dirigirse a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY, getFormattedAddress } from '../../config/company.js'

export default {
  name: 'LegalNoticeView',
  components: { LegalLayout },
  data() {
    return {
      COMPANY,
      formattedAddress: getFormattedAddress(),
    }
  },
}
</script>
