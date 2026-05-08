<template>
  <LegalLayout title="Devoluciones y cambios" section="Ayuda">

    <p>
      Si por cualquier motivo la prenda no es lo que esperabas, te lo ponemos fácil para
      devolverla. Tienes derecho legal de desistimiento durante los 14 días naturales
      siguientes a la recepción del pedido, conforme al Real Decreto Legislativo 1/2007.
    </p>

    <h2>Plazo</h2>
    <p>
      <strong>14 días naturales</strong> desde la recepción para ejercer el derecho de
      desistimiento sin necesidad de justificación.
    </p>

    <h2>Condiciones de la prenda devuelta</h2>
    <p>Para que aceptemos la devolución, la prenda debe llegar:</p>
    <ul>
      <li>Sin signos de uso ni lavado.</li>
      <li>Con todas las etiquetas y precintos originales intactos.</li>
      <li>En su embalaje original.</li>
      <li>Acompañada del número de pedido o justificante de compra.</li>
    </ul>

    <h2>¿Cómo devolver una prenda?</h2>
    <ol>
      <li>Escríbenos a <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> con el asunto "Devolución pedido #XXXX".</li>
      <li>Te responderemos con las instrucciones y la dirección de envío.</li>
      <li>Empaqueta la prenda con su embalaje original y envíala.</li>
      <li>Conserva el justificante del envío hasta recibir la confirmación de la devolución.</li>
      <li>Una vez recibida y verificada, procesaremos el reembolso en un plazo máximo de 14 días.</li>
    </ol>

    <h2>Gastos de devolución</h2>
    <p>
      En el caso de un desistimiento ordinario, los gastos del envío de devolución corren
      por cuenta del cliente, salvo que la devolución se deba a un error en el envío o a
      un producto defectuoso, en cuyo caso los asume Le Siuuluette.
    </p>

    <h2>Productos defectuosos o errores en el envío</h2>
    <p>
      Si has recibido una prenda defectuosa o se ha producido un error en el envío,
      escríbenos en las 48 horas siguientes a la recepción adjuntando fotografías del
      producto a <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>. Te ofreceremos
      una reposición o el reembolso íntegro según el caso.
    </p>

    <h2>Reembolso</h2>
    <p>
      El reembolso se realizará al mismo método de pago utilizado en la compra, en un plazo
      máximo de 14 días desde la recepción y verificación de la prenda.
    </p>

    <h2>Garantía legal</h2>
    <p>
      Todas nuestras prendas tienen garantía legal de conformidad de
      <strong>3 años</strong> desde la entrega, conforme al artículo 120 del Real Decreto
      Legislativo 1/2007. La garantía cubre defectos de fabricación, no el desgaste por
      uso normal ni los daños por uso indebido.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'ReturnsView',
  components: { LegalLayout },
  data() { return { COMPANY } },
}
</script>
