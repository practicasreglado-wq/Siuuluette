<template>
  <div class="legal-page pt-32 pb-24 px-6 md:px-12">
    <div class="legal-container">
      <h1 class="title">Política de Cookies</h1>
      <div class="content">
        <p class="last-updated">Última actualización: {{ new Date().toLocaleDateString('es-ES') }}</p>
        
        <h2>1. ¿Qué son las Cookies?</h2>
        <p>Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página. Las cookies suelen almacenar información de carácter técnico, preferencias personales, personalización de contenidos, estadísticas de uso, enlaces a redes sociales, acceso a cuentas de usuario, etc.</p>

        <h2>2. Cookies que utiliza este sitio web</h2>
        <p>Siguiendo las directrices de la Agencia Española de Protección de Datos procedemos a detallar el uso de cookies que hace esta web con el fin de informarle con la máxima exactitud posible.</p>
        
        <h3>2.1 Cookies Propias (Técnicas y Estrictamente Necesarias)</h3>
        <p>Son aquellas esenciales para el correcto funcionamiento de la página web. Permiten la navegación y el uso de las diferentes opciones o servicios como, por ejemplo, controlar el tráfico y la comunicación de datos, identificar la sesión, acceder a partes de acceso restringido o utilizar elementos de seguridad durante la navegación.</p>
        <ul>
          <li><strong>Session Cookies:</strong> Para mantener la sesión del usuario (Autenticación y Carrito de la compra).</li>
          <li><strong>Consent Cookie:</strong> Para recordar su elección sobre la aceptación del banner de cookies.</li>
        </ul>

        <h3>2.2 Cookies de Terceros</h3>
        <p>Son aquellas recopiladas y gestionadas por un tercero ajeno a nosotros.</p>
        <ul>
          <li><strong>Stripe:</strong> Utilizamos Stripe como pasarela de pago segura. Stripe utiliza cookies estrictamente necesarias para el procesamiento de pagos y la prevención de fraudes.</li>
        </ul>

        <h2>3. Desactivación o Eliminación de Cookies</h2>
        <p>En cualquier momento podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web. Estas acciones se realizan de forma diferente en función del navegador que esté usando:</p>
        <ul>
          <li><strong>Google Chrome:</strong> Configuración > Privacidad y seguridad > Cookies y otros datos de sitios.</li>
          <li><strong>Safari:</strong> Preferencias > Privacidad.</li>
          <li><strong>Mozilla Firefox:</strong> Opciones > Privacidad y Seguridad > Cookies y datos del sitio.</li>
          <li><strong>Microsoft Edge:</strong> Configuración > Cookies y permisos del sitio.</li>
        </ul>

        <h2>4. Notas Adicionales</h2>
        <p>Ni esta web ni sus representantes legales se hacen responsables ni del contenido ni de la veracidad de las políticas de privacidad que puedan tener los terceros mencionados en esta política de cookies.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  background-color: var(--c-black);
  color: #2D2D2D;
  font-family: 'Inter', sans-serif;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-display, serif);
  font-size: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-white);
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.content {
  font-size: 1rem;
  line-height: 1.8;
  color: #4A443F;
}

.last-updated {
  font-size: 0.85rem;
  color: #8A817C;
  margin-bottom: 2rem;
  font-style: italic;
}

h2 {
  font-family: var(--font-display, serif);
  font-size: 1.5rem;
  color: #5C5248;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  color: #1A1A1A;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

p {
  margin-bottom: 1rem;
}

ul {
  list-style-type: disc;
  padding-left: 2rem;
  margin-bottom: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}

strong {
  color: #000000;
}
</style>
