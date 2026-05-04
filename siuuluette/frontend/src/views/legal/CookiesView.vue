<template>
  <LegalLayout
    title="Política de Cookies"
    section="Legal"
    last-updated="2026"
  >
    <h2>1. ¿Qué son las cookies?</h2>
    <p>
      Una cookie es un pequeño archivo de información que se descarga en el dispositivo del
      usuario al acceder a determinadas páginas web. Las cookies permiten a los sitios web,
      entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación
      del usuario o de su equipo y, dependiendo de la información que contengan y la forma
      en que se utilicen, pueden reconocer al usuario.
    </p>

    <h2>2. Tipos de cookies que utilizamos</h2>
    <p>
      En cumplimiento del artículo 22.2 de la Ley 34/2002 (LSSI-CE) y de las directrices de
      la Agencia Española de Protección de Datos, le informamos sobre las cookies que
      utilizamos en este Sitio Web.
    </p>

    <h3>Cookies técnicas (necesarias)</h3>
    <p>
      Son aquellas estrictamente necesarias para el funcionamiento del Sitio Web. Permiten
      al usuario navegar y utilizar las funcionalidades como, por ejemplo, mantener la sesión
      iniciada o gestionar el carrito de compra. <strong>No requieren consentimiento del usuario.</strong>
    </p>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Propósito</th>
          <th>Duración</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>token</td>
          <td>Sesión del usuario autenticado (JWT)</td>
          <td>30 días</td>
        </tr>
        <tr>
          <td>isLoggedIn</td>
          <td>Indicador local de sesión activa</td>
          <td>30 días</td>
        </tr>
        <tr>
          <td>guestCart</td>
          <td>Carrito de compras del usuario invitado</td>
          <td>Sesión</td>
        </tr>
      </tbody>
    </table>

    <h3>Cookies de preferencias</h3>
    <p>
      Permiten recordar las elecciones del usuario (idioma, tamaño de tipografía, etc.).
      <strong>Su uso requiere consentimiento.</strong> Actualmente no se utilizan en este
      Sitio Web.
    </p>

    <h3>Cookies analíticas</h3>
    <p>
      Permiten medir y analizar el comportamiento de los usuarios en el Sitio Web. La
      información recopilada se utiliza para elaborar informes estadísticos y mejorar la
      experiencia. <strong>Su uso requiere consentimiento.</strong>
    </p>
    <p class="callout">
      Actualmente este Sitio Web <strong>no utiliza cookies analíticas</strong>. Si en el
      futuro se incorporan herramientas como Google Analytics, esta política será actualizada
      y se solicitará el consentimiento expreso al usuario antes de su activación.
    </p>

    <h3>Cookies de marketing y publicidad</h3>
    <p>
      Se utilizan para mostrar anuncios personalizados al usuario en otros sitios web o redes
      sociales. <strong>Su uso requiere consentimiento expreso.</strong>
    </p>
    <p class="callout">
      Actualmente este Sitio Web <strong>no utiliza cookies de marketing</strong>. Si en el
      futuro se incorporan herramientas de seguimiento como el píxel de Meta o publicidad de
      TikTok, esta política será actualizada y se solicitará el consentimiento expreso al
      usuario.
    </p>

    <h3>Cookies de terceros</h3>
    <p>El Sitio Web integra servicios de terceros que pueden instalar sus propias cookies:</p>
    <ul>
      <li><strong>Stripe:</strong> procesamiento seguro de pagos. Sus cookies son técnicas y necesarias para la operación del checkout. Más información en <a href="https://stripe.com/es/cookie-settings" target="_blank" rel="noopener">stripe.com/es/cookie-settings</a>.</li>
      <li><strong>Supabase:</strong> servicio de base de datos y autenticación. Sus cookies son técnicas. Más información en <a href="https://supabase.com/privacy" target="_blank" rel="noopener">supabase.com/privacy</a>.</li>
    </ul>

    <h2>3. ¿Cómo gestionar las cookies?</h2>
    <p>
      El usuario puede permitir, bloquear o eliminar las cookies instaladas en su equipo
      mediante la configuración de las opciones del navegador. A continuación facilitamos los
      enlaces oficiales para gestionar las cookies en los principales navegadores:
    </p>
    <ul>
      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
      <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener">Mozilla Firefox</a></li>
      <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
      <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Microsoft Edge</a></li>
    </ul>
    <p>
      <strong>Aviso:</strong> si desactiva las cookies técnicas, el Sitio Web puede dejar de
      funcionar correctamente (por ejemplo, no podrá iniciar sesión ni completar una compra).
    </p>

    <h2>4. Modificaciones</h2>
    <p>
      Esta Política de Cookies puede ser modificada en función de novedades legislativas o
      cambios en las cookies utilizadas. Le recomendamos revisar esta página periódicamente.
    </p>

    <h2>5. Contacto</h2>
    <p>
      Para cualquier duda sobre esta Política de Cookies, puede dirigirse a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'CookiesView',
  components: { LegalLayout },
  data() { return { COMPANY } },
}
</script>
