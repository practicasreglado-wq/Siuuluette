<template>
  <LegalLayout title="Preguntas frecuentes" section="Ayuda">

    <h2>Pedidos</h2>

    <h3>¿Cuánto tarda en llegar mi pedido?</h3>
    <p>
      En España (península) los pedidos llegan en 24-72 horas laborables desde la confirmación
      del pago. Para Baleares, Canarias y resto de la Unión Europea, el plazo es de 3-7 días
      laborables. Internacional: 7-15 días.
    </p>

    <h3>¿El envío es gratis?</h3>
    <p>
      <strong>Sí, en pedidos superiores a 100 €</strong> con destino a España (península).
      Para el resto de zonas y pedidos por debajo de ese importe, los gastos de envío se
      calculan en el checkout antes de la confirmación.
    </p>

    <h3>¿Puedo modificar o cancelar mi pedido?</h3>
    <p>
      Una vez confirmado el pago, los pedidos se preparan inmediatamente para minimizar el
      tiempo de entrega. Si necesitas modificar o cancelar, escríbenos cuanto antes a
      <a :href="`mailto:${COMPANY.email}`">{{ COMPANY.email }}</a> y haremos lo posible. Si
      el pedido ya ha salido, deberás esperar a recibirlo y proceder a una devolución.
    </p>

    <h2>Tallas y producto</h2>

    <h3>¿Cómo sé qué talla elegir?</h3>
    <p>
      En la ficha de cada producto encontrarás un enlace a la <strong>Guía de tallas</strong>
      con las medidas exactas en centímetros. Si tienes dudas, escríbenos al email de soporte
      indicando tu altura, peso y la talla que sueles usar en otras marcas, y te ayudamos a
      encontrar la talla ideal.
    </p>

    <h3>¿Los colores son fieles a la realidad?</h3>
    <p>
      Hacemos lo posible por fotografiar los productos con la mayor fidelidad de color. No
      obstante, la representación final puede variar ligeramente según el dispositivo y la
      configuración de pantalla del usuario.
    </p>

    <h3>¿Repondréis stock de un producto agotado?</h3>
    <p>
      <strong>No.</strong> Le Siuuluette opera con un modelo de drops limitados y numerados.
      Una vez agotado, el producto no vuelve. Suscríbete a nuestra
      <router-link to="/lista-vip">Lista VIP</router-link> para tener acceso anticipado al
      próximo drop.
    </p>

    <h2>Pagos</h2>

    <h3>¿Qué métodos de pago aceptáis?</h3>
    <p>
      Aceptamos tarjetas Visa, Mastercard, American Express, Apple Pay y Google Pay. Todos
      los pagos se procesan de forma segura mediante Stripe, certificada PCI-DSS. No
      almacenamos los datos de tu tarjeta en nuestros servidores.
    </p>

    <h3>¿Es seguro pagar en la web?</h3>
    <p>
      Sí. Toda la web utiliza conexión cifrada SSL/TLS. La pasarela de pagos (Stripe) cumple
      el más alto estándar de seguridad de la industria, el mismo que usan empresas como
      Amazon, Booking o Spotify.
    </p>

    <h3>¿Cuándo se cobra el pedido?</h3>
    <p>
      El cargo se realiza en el momento de confirmar el pago. Recibirás inmediatamente un
      email de confirmación con el resumen del pedido y la factura en PDF.
    </p>

    <h2>Devoluciones</h2>

    <h3>¿Puedo devolver un producto?</h3>
    <p>
      Sí. Tienes derecho legal a desistir del pedido en los 14 días naturales tras la
      recepción. Además, ofrecemos voluntariamente un plazo extendido de
      <strong>30 días para cambios de talla o color</strong> con primer envío de devolución
      gratuito. Consulta los detalles en
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
      No es obligatorio para tu primera compra, pero te lo recomendamos: tener una cuenta te
      permite ver el historial de pedidos, descargar facturas y unirte a la Lista VIP para
      acceder antes que nadie a los próximos drops.
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
      respondemos en menos de 24 horas laborables.
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
