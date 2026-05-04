<template>
  <div class="legal-page pt-32 pb-24 px-6 md:px-12">
    <div class="legal-container">
      <h1 class="title">Política de Privacidad</h1>
      <div class="content">
        <p class="last-updated">Última actualización: {{ new Date().toLocaleDateString('es-ES') }}</p>
        
        <h2>1. Responsable del Tratamiento</h2>
        <p>De conformidad con lo dispuesto en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y en la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se le informa que los datos personales que nos facilite serán tratados por:</p>
        <ul>
          <li><strong>Responsable:</strong> [RAZÓN SOCIAL / NOMBRE DEL TITULAR]</li>
          <li><strong>NIF:</strong> [NIF/CIF]</li>
          <li><strong>Email:</strong> hola@lesiuuluette.com</li>
        </ul>

        <h2>2. Finalidad del Tratamiento</h2>
        <p>Los datos personales recogidos serán tratados con las siguientes finalidades:</p>
        <ul>
          <li>Gestionar y procesar las compras realizadas en nuestra tienda online.</li>
          <li>Enviar correos electrónicos de confirmación de pedido y seguimiento de envíos.</li>
          <li>Responder a las consultas o solicitudes de información realizadas a través de nuestros canales de contacto.</li>
          <li>Si nos da su consentimiento expreso, enviarle comunicaciones comerciales sobre nuestras colecciones, ofertas y novedades.</li>
        </ul>

        <h2>3. Legitimación del Tratamiento</h2>
        <p>La base legal para el tratamiento de sus datos es la ejecución del contrato de compraventa y su consentimiento expreso para el envío de comunicaciones comerciales.</p>

        <h2>4. Conservación de los Datos</h2>
        <p>Los datos proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales.</p>

        <h2>5. Cesión a Terceros</h2>
        <p>Los datos no se cederán a terceros salvo en los casos en que exista una obligación legal o sea estrictamente necesario para la ejecución del servicio (por ejemplo, empresas de transporte para el envío del pedido o pasarelas de pago como Stripe).</p>

        <h2>6. Sus Derechos</h2>
        <p>Tiene derecho a obtener confirmación sobre si estamos tratando sus datos personales, así como a acceder a los mismos, solicitar la rectificación de los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos ya no sean necesarios para los fines que fueron recogidos. Puede ejercer sus derechos enviando un correo a hola@lesiuuluette.com.</p>
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
