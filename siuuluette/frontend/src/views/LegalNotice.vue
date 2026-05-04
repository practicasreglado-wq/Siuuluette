<template>
  <div class="legal-page pt-32 pb-24 px-6 md:px-12">
    <div class="legal-container">
      <h1 class="title">Aviso Legal</h1>
      <div class="content">
        <p class="last-updated">Última actualización: {{ new Date().toLocaleDateString('es-ES') }}</p>
        
        <h2>1. Información General</h2>
        <p>En cumplimiento de lo dispuesto en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los siguientes datos del titular de este sitio web:</p>
        <ul>
          <li><strong>Razón Social:</strong> [RAZÓN SOCIAL / NOMBRE DEL TITULAR]</li>
          <li><strong>NIF/CIF:</strong> [NIF/CIF]</li>
          <li><strong>Domicilio Social:</strong> [DIRECCIÓN COMPLETA]</li>
          <li><strong>Email de Contacto:</strong> hola@lesiuuluette.com</li>
        </ul>

        <h2>2. Condiciones de Uso</h2>
        <p>El acceso y uso de este sitio web atribuye la condición de Usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este Aviso Legal. El Usuario se compromete a hacer un uso adecuado y lícito del sitio web y de sus contenidos.</p>

        <h2>3. Propiedad Intelectual e Industrial</h2>
        <p>Todos los contenidos de este sitio web, incluyendo textos, fotografías, gráficos, imágenes, iconos, tecnología, software, así como su diseño gráfico y códigos fuente, constituyen una obra cuya propiedad pertenece al titular, sin que puedan entenderse cedidos al Usuario ninguno de los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso de la web.</p>

        <h2>4. Exclusión de Responsabilidad</h2>
        <p>El titular no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.</p>

        <h2>5. Modificaciones</h2>
        <p>El titular se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  background-color: var(--c-black); /* Fondo original crema/arena */
  color: #2D2D2D; /* Texto oscuro profundo para lectura */
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
  color: #4A443F; /* Marrón oscuro para los párrafos */
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
  color: #5C5248; /* El color "gold" oscuro original para títulos */
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
