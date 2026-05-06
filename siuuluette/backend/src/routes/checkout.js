import Stripe from 'stripe'
import { supabase } from '../db/supabase.js'
import { issueInvoiceForOrder, fetchOrRegenerateInvoicePDF } from '../utils/invoiceService.js'
import { confirmOrderByPaymentIntent } from '../utils/paymentService.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function checkoutRoutes(fastify) {

  // POST /api/checkout/intent — Crear intención de pago
  fastify.post('/intent', async (request, reply) => {
    const { items } = request.body // Array de { id, qty }

    if (!items || !items.length) {
      return reply.status(400).send({ error: 'El carrito está vacío' })
    }

    try {
      // 1. Obtener info de variantes de la DB (seguridad)
      const variantIds = items.map(i => i.id)
      const { data: dbVariants, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          price_gross_override,
          product:products (
            price_gross,
            discount_percent
          )
        `)
        .in('id', variantIds)

      if (error) throw error

      // 2. Calcular el total real aplicando overrides y descuentos
      const totalAmount = items.reduce((sum, item) => {
        const v = dbVariants.find(dv => dv.id === Number(item.id))
        if (!v) return sum

        const basePrice = v.price_gross_override ?? v.product?.price_gross ?? 0
        const discount  = v.product?.discount_percent || 0
        const finalPrice = +(basePrice * (1 - discount / 100)).toFixed(2)

        const itemQty = item.qty || item.quantity || 0
        return sum + (finalPrice * itemQty)
      }, 0)

      // Stripe usa céntimos (monto * 100)
      const amountInCents = Math.round(totalAmount * 100)

      if (amountInCents < 50) { // Stripe requiere mínimo 0.50€
        return reply.status(400).send({ error: `Importe bajo: ${totalAmount}€` })
      }

      // 3. Crear el PaymentIntent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          products: JSON.stringify(items.map(i => i.id))
        }
      })

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount
      }

    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({
        error: 'Error al procesar el pago',
        message: err.message
      })
    }
  })

  // POST /api/checkout/attach — Adjuntar shipping + items + userId al PaymentIntent
  //
  // El frontend lo llama JUSTO antes de stripe.confirmPayment(). Asi cuando el
  // pago se completa, Stripe nos manda por webhook un PaymentIntent con toda
  // la info necesaria para crear el pedido aunque el navegador caiga y nunca
  // llame a /confirm.
  //
  // Lo que persistimos en metadata (limites de Stripe: 50 keys, 500 chars/value):
  //   - user_id          : UUID del usuario autenticado (del JWT)
  //   - cart_items       : JSON minimizado [{id,q,s}, ...]
  //   - shipping_addr    : JSON de la direccion
  //   - customer_email   : email
  //   - customer_name    : nombre
  //   - total_amount     : importe total bruto en EUR (string)
  fastify.post('/attach', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { paymentIntentId, shippingAddress, items, customerEmail, customerName, totalAmount } = request.body

    if (!paymentIntentId) {
      return reply.status(400).send({ error: 'paymentIntentId es requerido' })
    }
    if (!Array.isArray(items) || !items.length) {
      return reply.status(400).send({ error: 'items vacio' })
    }
    if (!shippingAddress) {
      return reply.status(400).send({ error: 'shippingAddress es requerido' })
    }

    // Compactamos cart para que entre en 500 chars (limite Stripe metadata)
    const cartCompact = items.map(it => ({
      id: Number(it.id),
      q: Number(it.qty || it.quantity || 1),
      s: it.selectedSize || it.size || null,
    }))
    const cartJson = JSON.stringify(cartCompact)
    const shippingJson = JSON.stringify(shippingAddress)

    if (cartJson.length > 500) {
      // Caso muy raro: cart enorme. Lo partimos en varios keys cart_items_0, cart_items_1...
      return reply.status(400).send({
        error: 'Carrito demasiado grande para metadata Stripe. Reducir items o partir.'
      })
    }
    if (shippingJson.length > 500) {
      return reply.status(400).send({ error: 'Direccion demasiado larga.' })
    }

    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          user_id: String(userId),
          cart_items: cartJson,
          shipping_addr: shippingJson,
          customer_email: customerEmail || '',
          customer_name:  customerName || '',
          total_amount:   String(totalAmount ?? ''),
        }
      })
      return { ok: true }
    } catch (err) {
      fastify.log.error({ err, paymentIntentId }, '[ATTACH] Error actualizando metadata')
      return reply.status(500).send({
        error: 'No se pudo adjuntar la metadata al PaymentIntent',
        message: err.message,
      })
    }
  })

  // POST /api/checkout/confirm — Finalizar pedido y guardar en DB
  // Camino sincrono desde el frontend justo despues de pagar. Crea el
  // pedido + items y delega en confirmOrderByPaymentIntent para emitir
  // la factura y enviar el email. Esa funcion es idempotente, asi que
  // si el webhook llega antes y la corre, /confirm no duplica nada.
  fastify.post('/confirm', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { paymentIntentId, shippingAddress, items, totalAmount } = request.body

    try {
      // 0. Idempotencia inicial: si ya existe un order con este
      //    paymentIntentId, no insertamos uno nuevo. Solo lo confirmamos.
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .maybeSingle()

      let order = existingOrder

      if (!order) {
        // 1. Crear el Pedido (Order)
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: userId,
            total_amount: totalAmount,
            status: 'paid',
            shipping_address: JSON.stringify(shippingAddress),
            stripe_payment_intent_id: paymentIntentId
          }])
          .select()
          .single()

        if (orderError) {
          throw orderError
        }
        order = newOrder

        // 2. Crear los Detalles del Pedido (Order Items)
        const variantIds = items.map(i => i.id)
        const { data: dbVariants } = await supabase
          .from('product_variants')
          .select(`
            id,
            color_name,
            price_gross_override,
            product:products (
              id, name, price_gross, discount_percent
            )
          `)
          .in('id', variantIds)

        const orderItems = items.map(item => {
          const v = dbVariants.find(dv => dv.id === item.id)
          const basePrice = v?.price_gross_override ?? v?.product?.price_gross ?? 0
          const discount  = v?.product?.discount_percent || 0
          const finalPrice = +(basePrice * (1 - discount / 100)).toFixed(2)

          return {
            order_id: order.id,
            product_id: v?.id || item.id, // ID de la variante
            quantity: item.qty || item.quantity || 0,
            unit_price: finalPrice,
            size: item.selectedSize || 'M'
          }
        })

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          throw itemsError
        }

        // 3. Vaciar el Carrito del Usuario
        if (userId) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
        }
      }

      // 4. Marcar pagado + emitir factura + enviar email (idempotente)
      const { invoice } = await confirmOrderByPaymentIntent({
        paymentIntentId,
        shippingAddress,
        logger: fastify.log,
      })

      return {
        message: 'Pedido guardado con éxito',
        orderId: order.id,
        invoice,
      }

    } catch (err) {
      console.error('[CHECKOUT_CONFIRM] Error crítico:', err)
      return reply.status(500).send({
        error: 'Error al guardar el pedido',
        message: err.message,
        details: err.details || null
      })
    }
  })

  // POST /api/checkout/webhook — Recibir eventos de Stripe
  //
  // Stripe nos avisa aqui cuando un PaymentIntent se completa, falla, etc.
  // Es nuestra red de seguridad: si el frontend no llega a llamar a /confirm
  // (cierre de pestaña, fallo de red, etc.), el webhook se asegura de que
  // el pedido quede consistente: marcado como 'paid', con factura emitida
  // y email enviado.
  //
  // IMPORTANTE: esta ruta NO tiene autenticacion JWT. La "autenticacion"
  // es la firma de Stripe (HMAC) sobre el body crudo, que verificamos abajo.
  // El raw body se preserva en request.rawBody gracias al contentTypeParser
  // configurado en server.js.
  fastify.post('/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      fastify.log.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET no configurado')
      return reply.status(500).send({ error: 'Webhook secret missing' })
    }
    if (!sig) {
      return reply.status(400).send({ error: 'Falta cabecera stripe-signature' })
    }

    // request.rawBody = Buffer crudo del body (lo preserva el contentTypeParser)
    const rawBody = request.rawBody || request.body
    let event
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } catch (err) {
      fastify.log.warn({ err: err.message }, '[WEBHOOK] Firma invalida')
      return reply.status(400).send({ error: `Firma invalida: ${err.message}` })
    }

    fastify.log.info({ type: event.type, id: event.id }, '[WEBHOOK] Evento recibido')

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const pi = event.data.object
          // Pasamos el PaymentIntent completo: si no existe order en DB,
          // paymentService lo crea desde la metadata (Fase B).
          await confirmOrderByPaymentIntent({
            paymentIntentId: pi.id,
            paymentIntent:   pi,
            logger: fastify.log,
          })
          break
        }

        case 'payment_intent.payment_failed': {
          const pi = event.data.object
          fastify.log.warn(
            { paymentIntentId: pi.id, error: pi.last_payment_error?.message },
            '[WEBHOOK] Pago fallido'
          )
          // De momento solo logueamos. Mas adelante: marcar order como 'failed'
          // o avisar al cliente.
          break
        }

        default:
          fastify.log.debug({ type: event.type }, '[WEBHOOK] Evento ignorado')
      }
    } catch (err) {
      // Si nuestra logica falla, devolvemos 500 para que Stripe reintente.
      fastify.log.error({ err, type: event.type }, '[WEBHOOK] Error procesando evento')
      return reply.status(500).send({ error: 'Error procesando evento' })
    }

    // Stripe espera 2xx para considerar el evento entregado
    return reply.status(200).send({ received: true })
  })

  // GET /api/orders — Obtener historial de pedidos del usuario
  fastify.get('/orders', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    // 1. Obtener pedidos
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (ordersError) return reply.status(400).send({ error: ordersError.message })

    // 2. Enriquecer los order_items con datos de variantes y productos (manual)
    const allVariantIds = orders.flatMap(o => o.order_items.map(oi => oi.product_id))
    
    if (allVariantIds.length > 0) {
      const { data: variants } = await supabase
        .from('product_variants')
        .select(`
          id, color_name,
          product:products (name, price_gross),
          images:product_images (url)
        `)
        .in('id', allVariantIds)

      orders.forEach(o => {
        o.order_items.forEach(oi => {
          oi.variant = variants?.find(v => v.id === oi.product_id) || null
        })
      })
    }

    return { orders }
  })

  // GET /api/checkout/orders/:id/invoice — Descargar PDF de factura
  fastify.get('/orders/:id/invoice', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params
    const userId = request.user.id
    const orderId = Number(id)

    try {
      // 1. Comprobar que el pedido existe y pertenece al usuario (o es admin)
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .single()

      if (orderErr || !order) {
        return reply.status(404).send({ error: 'Pedido no encontrado' })
      }
      if (order.user_id !== userId && request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'No tienes permiso para ver esta factura' })
      }

      // 2. Buscar la factura ya emitida para este pedido
      let { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle()

      // 3. Si el pedido es antiguo y no tiene factura, la emitimos ahora
      //    (compatibilidad con pedidos pre-existentes a este sistema).
      if (!invoice) {
        fastify.log.warn(
          { orderId },
          'Pedido sin factura: emitiendo retroactivamente'
        )
        const result = await issueInvoiceForOrder(orderId)
        invoice = result.invoice
        // Si la emision acaba de generar el buffer, lo aprovechamos
        if (result.pdfBuffer) {
          reply.type('application/pdf')
          reply.header(
            'Content-Disposition',
            `attachment; filename=${invoice.invoice_number}.pdf`
          )
          return reply.send(result.pdfBuffer)
        }
      }

      // 4. Recuperar el PDF (de Storage o regenerándolo desde snapshots)
      const pdfBuffer = await fetchOrRegenerateInvoicePDF(invoice)

      reply.type('application/pdf')
      reply.header(
        'Content-Disposition',
        `attachment; filename=${invoice.invoice_number}.pdf`
      )
      return reply.send(pdfBuffer)

    } catch (err) {
      fastify.log.error({ err, orderId }, 'Error al servir la factura')
      return reply.status(500).send({
        error: 'Error al obtener la factura',
        details: err.message
      })
    }
  })
}
