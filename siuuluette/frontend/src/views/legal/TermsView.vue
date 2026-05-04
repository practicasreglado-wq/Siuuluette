<template>
  <LegalLayout
    title="Condiciones Generales de Venta"
    section="Legal"
    last-updated="2026"
  >
    <p>
      Las presentes Condiciones Generales de Venta (en adelante, "CGV") regulan las relaciones
      comerciales entre {{ COMPANY.legalName }} (en adelante, "{{ COMPANY.tradeName }}") y los
      usuarios que adquieran productos a través del sitio web {{ COMPANY.websiteUrl }}.
    </p>
    <p>
      La compra a través del Sitio Web implica la aceptación plena de estas CGV en la versión
      publicada en el momento de la realización del pedido.
    </p>

    <h2>1. Identificación del vendedor</h2>
    <ul>
      <li><strong>Razón social:</strong> {{ COMPANY.legalName }}</li>
      <li><strong>NIF/CIF:</strong> {{ COMPANY.taxId }}</li>
      <li><strong>Domicilio:</strong> {{ formattedAddress }}</li>
      <li><strong>Email de contacto:</strong> {{ COMPANY.email }}</li>
    </ul>

    <h2>2. Productos</h2>
    <p>
      {{ COMPANY.tradeName }} ofrece productos textiles de la categoría sportswear y athleisure
      premium en colecciones limitadas ("drops"). Las características esenciales (composición,
      tallaje, color, precio) se especifican en la ficha de cada producto.
    </p>
    <p>
      Las imágenes de los productos son meramente orientativas. {{ COMPANY.tradeName }} hace
      sus mejores esfuerzos por mostrar los colores con la máxima fidelidad, pero pueden
      existir diferencias mínimas debido a la configuración del dispositivo del usuario.
    </p>

    <h2>3. Política de drops y disponibilidad</h2>
    <p>
      Los productos de {{ COMPANY.tradeName }} se comercializan en colecciones limitadas y
      numeradas. Una vez agotadas las unidades, <strong>los productos no se reponen</strong>.
      La disponibilidad mostrada en la ficha de producto se actualiza en tiempo real.
    </p>

    <h2>4. Precios y forma de pago</h2>
    <p>
      Los precios se muestran en euros (€) e incluyen el Impuesto sobre el Valor Añadido (IVA)
      al tipo general del {{ COMPANY.vatRate }}%, salvo indicación expresa contraria. Los gastos
      de envío se calcularán en el momento del checkout antes de la confirmación del pedido.
    </p>
    <p>
      Aceptamos los siguientes métodos de pago, procesados de forma segura mediante la pasarela
      de pagos Stripe:
    </p>
    <ul>
      <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express).</li>
      <li>Apple Pay y Google Pay.</li>
      <li>Bizum (cuando esté disponible).</li>
    </ul>
    <p>
      {{ COMPANY.tradeName }} <strong>no almacena los datos completos de la tarjeta del usuario</strong>;
      estos son procesados directamente por Stripe bajo el estándar de seguridad PCI-DSS.
    </p>

    <h2>5. Realización del pedido</h2>
    <p>El proceso de compra consta de los siguientes pasos:</p>
    <ol>
      <li>Selección del producto, color y talla.</li>
      <li>Adición al carrito.</li>
      <li>Acceso al checkout y cumplimentación de los datos de envío y facturación.</li>
      <li>Selección del método de pago.</li>
      <li>Aceptación de las presentes CGV y de la Política de Privacidad.</li>
      <li>Confirmación del pago.</li>
    </ol>
    <p>
      Una vez confirmado el pago, el usuario recibirá por email un correo de confirmación con
      el detalle del pedido y la factura en formato PDF. La aceptación del pedido por parte
      de {{ COMPANY.tradeName }} queda condicionada a la disponibilidad real del producto.
    </p>

    <h2>6. Envío</h2>
    <p>
      Los pedidos se envían a la dirección indicada por el usuario en el momento del checkout.
      Los plazos de entrega aproximados son:
    </p>
    <ul>
      <li><strong>España (península):</strong> 24-72 horas laborables.</li>
      <li><strong>Baleares y Canarias:</strong> 3-5 días laborables.</li>
      <li><strong>Unión Europea:</strong> 3-7 días laborables.</li>
      <li><strong>Resto del mundo:</strong> 7-15 días laborables.</li>
    </ul>
    <p>
      <strong>Envío gratuito en pedidos superiores a 100 €</strong> con destino a España
      (península). Para el resto de zonas, los gastos se calcularán en el checkout.
    </p>

    <h2>7. Derecho de desistimiento</h2>
    <p>
      Conforme al Real Decreto Legislativo 1/2007 de Defensa de los Consumidores y Usuarios,
      el usuario dispone de un plazo de <strong>14 días naturales</strong> desde la recepción
      del producto para ejercer el derecho de desistimiento sin necesidad de justificación.
    </p>
    <p>Para ejercer este derecho, el usuario debe:</p>
    <ol>
      <li>Comunicarlo por email a <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> indicando el número de pedido y la prenda a devolver.</li>
      <li>Enviar la prenda en su embalaje original, sin signos de uso, con todas las etiquetas y precintos intactos.</li>
      <li>Conservar el justificante del envío.</li>
    </ol>
    <p>
      Una vez recibida y verificada la prenda, {{ COMPANY.tradeName }} reembolsará el importe
      pagado en un plazo máximo de 14 días, mediante el mismo método de pago utilizado en la
      compra. <strong>Los gastos de envío de la devolución corren por cuenta del usuario</strong>,
      salvo en caso de producto defectuoso o error en el envío.
    </p>

    <h2>8. Cambios y devoluciones gratuitas en 30 días</h2>
    <p>
      Más allá del derecho legal de desistimiento (14 días), {{ COMPANY.tradeName }} ofrece
      voluntariamente un plazo extendido de <strong>30 días</strong> para cambios de talla
      o color (sujeto a disponibilidad del stock). En este supuesto, los gastos del primer
      envío de devolución corren por cuenta de {{ COMPANY.tradeName }}.
    </p>

    <h2>9. Garantía</h2>
    <p>
      Los productos cuentan con la garantía legal de conformidad de <strong>3 años</strong>
      desde la entrega, conforme a la Ley General para la Defensa de los Consumidores y
      Usuarios. Esta garantía cubre defectos de fabricación, no el desgaste por uso normal
      ni los daños derivados de un uso indebido.
    </p>

    <h2>10. Resolución de conflictos</h2>
    <p>
      En caso de cualquier conflicto, el usuario puede ponerse en contacto con
      {{ COMPANY.tradeName }} en <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a>
      para intentar resolverlo amistosamente.
    </p>
    <p>
      Asimismo, conforme al Reglamento (UE) 524/2013, le informamos de la existencia de la
      <strong>Plataforma de Resolución de Litigios en Línea</strong> de la Comisión Europea,
      accesible en
      <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.
    </p>

    <h2>11. Legislación aplicable y jurisdicción</h2>
    <p>
      Las presentes CGV se rigen por la legislación española. Para la resolución de cualquier
      controversia, las partes se someten a los Juzgados y Tribunales del domicilio del
      consumidor en aquellos casos en que la normativa lo contemple.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY, getFormattedAddress } from '../../config/company.js'

export default {
  name: 'TermsView',
  components: { LegalLayout },
  data() {
    return {
      COMPANY,
      formattedAddress: getFormattedAddress(),
    }
  },
}
</script>
