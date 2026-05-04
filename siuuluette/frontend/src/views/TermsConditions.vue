<template>
  <div class="legal-page pt-32 pb-24 px-6 md:px-12">
    <div class="legal-container">
      <h1 class="title">Términos y Condiciones</h1>
      <div class="content">
        <p class="last-updated">Última actualización: {{ new Date().toLocaleDateString('es-ES') }}</p>
        
        <h2>1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar el sitio web de Le Siuuluette, así como al realizar compras a través de él, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá utilizar nuestros servicios.</p>

        <h2>2. Proceso de Compra</h2>
        <p>Para realizar un pedido, debe seguir el procedimiento de compra online y hacer clic en "Pagar ahora". Una vez hecho esto, recibirá un correo electrónico acusando recibo de su pedido (la "Confirmación de Pedido"). Todos los pedidos están sujetos a la aceptación y disponibilidad de los productos.</p>

        <h2>3. Precios y Pagos</h2>
        <p>Los precios de la página web incluyen IVA pero excluyen los gastos de envío, que se añadirán al importe total debido. Los precios pueden cambiar en cualquier momento, pero los posibles cambios no afectarán a los pedidos con respecto a los cuales ya le hayamos enviado una Confirmación de Pedido.</p>
        <p>El pago puede realizarse de forma segura mediante tarjetas de crédito o débito a través de la pasarela de pago Stripe.</p>

        <h2>4. Envíos y Entregas</h2>
        <p>Nos comprometemos a hacer todo lo posible para enviar su pedido en el menor tiempo posible. Los plazos de entrega variarán según la ubicación del destinatario. No nos hacemos responsables de posibles retrasos en la entrega causados por la empresa de mensajería o fuerza mayor.</p>

        <h2>5. Cambios y Devoluciones</h2>
        <p>Dispone de un plazo de 14 días naturales desde la recepción de su pedido para solicitar un cambio de talla o una devolución, siempre que las prendas se encuentren en perfecto estado, con sus etiquetas originales y sin signos de uso. Los gastos de envío de la devolución correrán a cargo del cliente, a menos que el producto presente algún defecto de fábrica.</p>

        <h2>6. Ley Aplicable y Jurisdicción</h2>
        <p>El uso de nuestra página web y los contratos de compra de productos a través de dicha página web se regirán por la legislación española. Cualquier controversia que surja o guarde relación con el uso de la página web o con dichos contratos será sometida a la jurisdicción no exclusiva de los juzgados y tribunales españoles.</p>
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
