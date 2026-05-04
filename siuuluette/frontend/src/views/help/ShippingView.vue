<template>
  <LegalLayout title="Envíos" section="Ayuda">

    <h2>Plazos de entrega</h2>
    <table>
      <thead>
        <tr>
          <th>Destino</th>
          <th>Plazo</th>
          <th>Coste</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>España (península)</td>
          <td>24-72 h laborables</td>
          <td>4,90 € — gratis a partir de 100 €</td>
        </tr>
        <tr>
          <td>Baleares</td>
          <td>3-5 días laborables</td>
          <td>7,90 € — gratis a partir de 150 €</td>
        </tr>
        <tr>
          <td>Canarias, Ceuta y Melilla</td>
          <td>5-7 días laborables</td>
          <td>14,90 € (impuestos locales aparte)</td>
        </tr>
        <tr>
          <td>Portugal e Italia</td>
          <td>3-5 días laborables</td>
          <td>9,90 €</td>
        </tr>
        <tr>
          <td>Resto Unión Europea</td>
          <td>5-7 días laborables</td>
          <td>14,90 €</td>
        </tr>
        <tr>
          <td>Reino Unido</td>
          <td>5-7 días laborables</td>
          <td>19,90 € (impuestos locales aparte)</td>
        </tr>
        <tr>
          <td>EE. UU. y Canadá</td>
          <td>7-12 días laborables</td>
          <td>24,90 € (impuestos de importación aparte)</td>
        </tr>
      </tbody>
    </table>

    <p class="callout">
      Los plazos indicados se cuentan desde la confirmación del pago, no desde la fecha del
      pedido. En periodos de drops puede haber un retraso adicional de 24-48 h por el
      volumen elevado.
    </p>

    <h2>Seguimiento del pedido</h2>
    <p>
      En cuanto el pedido salga del almacén, recibirás un email con el número de seguimiento
      y un enlace al transportista. Si el pedido está confirmado pero todavía no te ha
      llegado el email de envío, significa que aún se está preparando.
    </p>
    <p>
      Puedes consultar el estado en cualquier momento desde tu cuenta, en la sección
      "Mis pedidos".
    </p>

    <h2>¿Y si no estoy en casa cuando llegue?</h2>
    <p>
      Los transportistas con los que trabajamos suelen intentar la entrega 1-2 veces. Si no
      es posible, dejarán un aviso para reprogramar la entrega o recoger el paquete en un
      punto cercano. También suelen contactar por SMS o email para coordinarse contigo.
    </p>

    <h2>¿Mi pedido llegó en mal estado?</h2>
    <p>
      Sentimos muchísimo si esto ocurre. Escríbenos a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> en las 48 horas siguientes
      a la recepción adjuntando fotografías del paquete y de la prenda, y te enviaremos una
      reposición sin coste o procederemos al reembolso íntegro.
    </p>

    <h2>Impuestos y aduanas para envíos fuera de la UE</h2>
    <p>
      Los pedidos a destinos fuera de la Unión Europea pueden estar sujetos a aranceles e
      impuestos locales en el país de destino, que <strong>no están incluidos</strong> en el
      precio mostrado en la web. Estos importes los gestiona el transportista o las
      autoridades aduaneras y son responsabilidad del comprador.
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
