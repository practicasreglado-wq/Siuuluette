<template>
  <LegalLayout title="Envíos" section="Ayuda">

    <p class="lead">
      Realizamos envíos a España y al resto de la Unión Europea. Los costes y plazos
      exactos dependen del destino y se muestran en el checkout antes de confirmar
      el pedido, sin sorpresas posteriores.
    </p>

    <h2>Confirmación y preparación del pedido</h2>
    <p>
      En cuanto se confirma el pago, recibirás un email con el resumen del pedido y
      la factura en PDF. A partir de ese momento entra en preparación en nuestro
      almacén.
    </p>

    <h2>Seguimiento del pedido</h2>
    <p>
      Cuando el pedido salga del almacén, recibirás un segundo email con la
      información de seguimiento del transportista. Si tienes una cuenta de
      Le Siuuluette, también puedes consultar el estado en cualquier momento desde
      la sección "Mis pedidos".
    </p>

    <h2>¿Y si no estoy en casa cuando llegue?</h2>
    <p>
      Los transportistas suelen intentar la entrega en varias ocasiones. Si no es
      posible entregártelo, te dejarán un aviso para reprogramar la entrega o para
      recoger el paquete en un punto cercano. En la mayoría de casos también te
      contactarán por SMS o email para coordinarse contigo.
    </p>

    <h2>¿Mi pedido llegó en mal estado?</h2>
    <p>
      Sentimos muchísimo si esto ocurre. Escríbenos a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> dentro de las
      48 horas siguientes a la recepción, adjuntando fotografías del paquete y de
      la prenda. Te ofreceremos una reposición o el reembolso íntegro según el caso.
    </p>

    <h2>Impuestos y aduanas para envíos fuera de la UE</h2>
    <p>
      Los pedidos a destinos fuera de la Unión Europea pueden estar sujetos a
      aranceles e impuestos locales en el país de destino, que <strong>no están
      incluidos</strong> en el precio mostrado en la web. Estos importes los gestiona
      el transportista o las autoridades aduaneras y son responsabilidad del comprador.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'ShippingView',
  components: { LegalLayout },
  data() { return { COMPANY } },
}
</script>
