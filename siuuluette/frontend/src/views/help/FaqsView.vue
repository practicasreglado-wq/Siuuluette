<template>
  <LegalLayout title="Preguntas frecuentes" section="Ayuda">

    <h2>Pedidos</h2>

    <h3>¿Cuánto tarda en llegar mi pedido?</h3>
    <p>
      Los plazos exactos dependen del destino y se muestran en el checkout antes de
      confirmar el pedido. En cuanto el pedido salga del almacén recibirás un email con
      el número de seguimiento del transportista.
    </p>

    <h3>¿Cuánto cuesta el envío?</h3>
    <p>
      Los gastos de envío se calculan en el checkout en función del destino, antes de la
      confirmación del pedido.
    </p>

    <h3>¿Puedo modificar o cancelar mi pedido?</h3>
    <p>
      Una vez confirmado el pago, los pedidos se preparan para minimizar el tiempo de
      entrega. Si necesitas modificar o cancelar, escríbenos cuanto antes a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> y haremos lo posible.
      Si el pedido ya ha salido, deberás esperar a recibirlo y proceder a una devolución.
    </p>

    <h2>Tallas y producto</h2>

    <h3>¿Cómo sé qué talla elegir?</h3>
    <p>
      En la ficha de cada producto encontrarás un enlace a la <strong>Guía de tallas</strong>
      con las medidas en centímetros. Si tienes dudas, escríbenos al email de soporte
      indicando tu altura, peso y la talla que sueles usar en otras marcas, y te ayudamos
      a encontrar la talla adecuada.
    </p>

    <h3>¿Los colores son fieles a la realidad?</h3>
    <p>
      Hacemos lo posible por fotografiar los productos con la mayor fidelidad de color. No
      obstante, la representación final puede variar ligeramente según el dispositivo y la
      configuración de pantalla del usuario.
    </p>

    <h3>¿Repondréis stock de un producto agotado?</h3>
    <p>
      Le Siuuluette opera con un modelo de drops limitados y numerados. Una vez agotado un
      producto, su disponibilidad puede no volver a darse.
    </p>

    <h2>Pagos</h2>

    <h3>¿Qué métodos de pago aceptáis?</h3>
    <p>
      Los pagos se procesan a través de la pasarela <strong>Stripe</strong>, certificada
      PCI-DSS. Los métodos de pago disponibles se muestran en el checkout. No almacenamos
      los datos de tu tarjeta en nuestros servidores.
    </p>

    <h3>¿Es seguro pagar en la web?</h3>
    <p>
      Sí. Toda la web utiliza conexión cifrada SSL/TLS y la pasarela de pagos cumple con los
      estándares de seguridad de la industria.
    </p>

    <h3>¿Cuándo se cobra el pedido?</h3>
    <p>
      El cargo se realiza en el momento de confirmar el pago. Recibirás un email de
      confirmación con el resumen del pedido y la factura en PDF.
    </p>

    <h2>Devoluciones</h2>

    <h3>¿Puedo devolver un producto?</h3>
    <p>
      Sí. Tienes derecho legal a desistir del pedido en los 14 días naturales tras la
      recepción, conforme al RDL 1/2007. Consulta los detalles del proceso en
      <router-link to="/ayuda/devoluciones">Devoluciones</router-link>.
    </p>

    <h3>¿Cuánto tarda en llegar el reembolso?</h3>
    <p>
      Una vez recibida y verificada la prenda, procesamos el reembolso en un plazo máximo
      de 14 días al mismo método de pago utilizado en la compra.
    </p>

    <h2>Cuenta y datos</h2>

    <h3>¿Tengo que crearme una cuenta para comprar?</h3>
    <p>
      Tener una cuenta te permite consultar el historial de pedidos y descargar tus
      facturas en cualquier momento.
    </p>

    <h3>¿Puedo eliminar mi cuenta?</h3>
    <p>
      Sí, en cualquier momento. Escríbenos a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> y procederemos al borrado
      conforme al RGPD. Tienes más información en nuestra
      <router-link to="/privacidad">Política de Privacidad</router-link>.
    </p>

    <h2>¿No encuentras lo que buscabas?</h2>
    <p>
      Escríbenos a <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> y te
      responderemos a la mayor brevedad.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'FaqsView',
  components: { LegalLayout },
  data() { return { COMPANY } },
}
</script>
