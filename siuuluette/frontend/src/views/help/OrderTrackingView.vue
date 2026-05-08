<template>
  <LegalLayout title="Seguimiento de pedido" section="Ayuda">

    <h2>¿Cómo seguir mi pedido?</h2>
    <p>
      Hay dos formas de saber en qué estado está tu pedido:
    </p>

    <h3>1. Desde tu cuenta</h3>
    <p>
      Inicia sesión, abre el panel de usuario (icono arriba a la derecha) y entra en la
      sección <strong>"Mis pedidos"</strong>. Verás todos los pedidos realizados con su
      estado actual.
    </p>

    <h3>2. Desde el email del transportista</h3>
    <p>
      Cuando tu pedido salga del almacén, te enviaremos un email con el número de
      seguimiento y un enlace al transportista. Desde ahí podrás ver el detalle del recorrido
      del paquete.
    </p>

    <h2>¿Cuándo me llegará el pedido?</h2>
    <p>
      Los plazos exactos dependen del destino y se muestran en el checkout antes de
      confirmar el pedido. Los plazos se cuentan desde la confirmación del pago, no desde
      la fecha del pedido. Más detalle en
      <router-link to="/ayuda/envios">Envíos</router-link>.
    </p>

    <h2>Mi pedido lleva más tiempo del previsto</h2>
    <p>
      Lo primero es revisar el estado en tu cuenta y en el seguimiento del transportista.
      A veces el paquete está en un punto cercano pendiente de recoger y no se notifica
      bien. Si efectivamente hay un retraso real, escríbenos a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> con tu número de pedido y
      lo revisamos.
    </p>

    <h2>No recibo el email de envío</h2>
    <p>
      Si tu pedido aparece como enviado pero no has recibido el email del transportista,
      revisa la carpeta de Spam o Promociones. Si tampoco aparece allí, escríbenos y te
      lo reenviamos.
    </p>

    <h2>¿Puedo cambiar la dirección una vez confirmado el pedido?</h2>
    <p>
      Si el pedido aún no ha salido, sí — escríbenos cuanto antes a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> con el número de pedido y
      la dirección correcta. Una vez que el pedido haya salido del almacén ya no es posible
      modificar el destino, aunque a veces el transportista permite redirigir desde su
      propia plataforma.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'
import { COMPANY } from '../../config/company.js'

export default {
  name: 'OrderTrackingView',
  components: { LegalLayout },
  data() { return { COMPANY } },
}
</script>
