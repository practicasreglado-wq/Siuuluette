<template>
  <LegalLayout title="Devoluciones y cambios" section="Ayuda">

    <p>
      Queremos que te lleves la prenda perfecta. Si por cualquier motivo no es lo que
      esperabas, te lo ponemos fácil para devolverla o cambiarla.
    </p>

    <h2>Plazos</h2>
    <ul>
      <li><strong>Derecho legal de desistimiento:</strong> 14 días naturales desde la recepción del pedido.</li>
      <li><strong>Plazo extendido Le Siuuluette:</strong> 30 días naturales para cambios de talla o color (sujeto a stock).</li>
    </ul>

    <h2>Condiciones de la prenda devuelta</h2>
    <p>Para que aceptemos la devolución, la prenda debe llegar:</p>
    <ul>
      <li>Sin signos de uso ni lavado.</li>
      <li>Con todas las etiquetas y precintos originales intactos.</li>
      <li>En su embalaje original (caja, papel de seda y tarjetón de número de serie).</li>
      <li>Acompañada del ticket o número de pedido.</li>
    </ul>

    <h2>¿Cómo devolver una prenda?</h2>
    <ol>
      <li>Escríbenos a <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> con el asunto "Devolución pedido #XXXX".</li>
      <li>Te responderemos con las instrucciones y la dirección de envío en menos de 24 h laborables.</li>
      <li>Empaqueta la prenda con su embalaje original y envíala con el transportista que prefieras.</li>
      <li>Conserva el justificante del envío hasta recibir la confirmación de la devolución.</li>
      <li>Una vez recibida y verificada, procesaremos el reembolso o el cambio en un plazo máximo de 14 días.</li>
    </ol>

    <h2>Cambios de talla o color</h2>
    <p>
      <strong>Primer cambio gratuito.</strong> Si lo que necesitas es otra talla o color del
      mismo producto y todavía hay stock disponible, los gastos del primer envío de
      devolución corren por cuenta de Le Siuuluette. Indícanoslo en el email para que te
      enviemos una etiqueta prepagada.
    </p>
    <p class="callout">
      Importante: como operamos con drops limitados, el stock de tallas y colores puede
      cambiar entre el momento de tu compra y tu solicitud de cambio. Si la talla o color
      que buscas ya no está disponible, te ofreceremos el reembolso íntegro como alternativa.
    </p>

    <h2>Devoluciones por desistimiento (14 días)</h2>
    <p>
      Conforme a la Ley General para la Defensa de los Consumidores y Usuarios, tienes
      derecho a desistir del pedido sin necesidad de justificación dentro de los 14 días
      naturales siguientes a la recepción.
    </p>
    <p>
      En este supuesto, los <strong>gastos del envío de devolución corren por cuenta del
      cliente</strong>, salvo que la devolución se deba a un error nuestro o a un producto
      defectuoso. El reembolso del importe de la prenda y los gastos de envío inicial se
      realizará al mismo método de pago utilizado.
    </p>

    <h2>Productos defectuosos o errores en el envío</h2>
    <p>
      Si has recibido una prenda defectuosa o se ha producido un error en el envío, los
      gastos de devolución corren por nuestra cuenta. Escríbenos en las 48 horas siguientes
      a la recepción adjuntando fotografías del producto a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>.
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
