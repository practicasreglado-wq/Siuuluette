import Stripe from 'stripe'
import { supabase } from '../db/supabase.js'
import { issueInvoiceForOrder, fetchOrRegenerateInvoicePDF } from '../utils/invoiceService.js'
import { confirmOrderByPaymentIntent } from '../utils/paymentService.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function checkoutRoutes(fastify) {

  // --- CREAR INTENCIÓN DE PAGO ---
  // Calcula el total real en el servidor y solicita a Stripe un PaymentIntent
  fastify.post('/intent', {
    onRequest: [fastify.csrfProtection]
  }, async (request, reply) => {
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
          discount_percent,
          product:products (
            price_gross,
            discount_percent
          )
        `)
        .in('id', variantIds)

      if (error) throw error

      // 1.5 [STOCK] Validar disponibilidad ANTES de crear el cobro.
      //     Si una prenda esta agotada, abortamos aqui: el cliente ve
      //     un error claro y NO se le llega a generar el PaymentIntent.
      //     La garantia DURA contra overselling esta en el trigger
      //     trg_decrement_variant_stock de la DB (descuenta al crear
      //     order_items); esto es la primera barrera, de cara al usuario.
      const { data: stockRows, error: stockErr } = await supabase
        .from('variant_stock')
        .select('variant_id, size, stock, stock_mode')
        .in('variant_id', variantIds)

      if (stockErr) throw stockErr

      for (const item of items) {
        const size = item.selectedSize || item.size || null
        const qty  = item.qty || item.quantity || 1
        const row  = stockRows.find(
          s => s.variant_id === Number(item.id) && s.size === size
        )

        // Sin registro de stock para esa variante+talla -> no vendible.
        if (!row) {
          return reply.status(400).send({
            error: 'Una de las prendas de tu carrito ya no esta disponible. Revisa el carrito.'
          })
        }
        // Modo 'limited': tiene que haber unidades suficientes.
        // (on_demand y preorder se consideran siempre disponibles.)
        if (row.stock_mode === 'limited' && (row.stock ?? 0) < qty) {
          return reply.status(400).send({
            error: `Stock insuficiente para una de las prendas (talla ${size || 'unica'}). Disponibles: ${row.stock ?? 0}.`
          })
        }
      }

      // 2. Calcular el total real aplicando overrides y descuentos
      const totalAmount = items.reduce((sum, item) => {
        const v = dbVariants.find(dv => dv.id === Number(item.id))
        if (!v) return sum

        const basePrice = v.price_gross_override ?? v.product?.price_gross ?? 0
        // El descuento de la variante (color) manda sobre el del producto.
        const discount  = v.discount_percent ?? v.product?.discount_percent ?? 0
        const finalPrice = +(basePrice * (1 - discount / 100)).toFixed(2)

        const itemQty = item.qty || item.quantity || 0
        return sum + (finalPrice * itemQty)
      }, 0)

      // Stripe usa céntimos (monto * 100)
      const amountInCents = Math.round(totalAmount * 100)

      if (amountInCents < 50) { // Stripe requiere mínimo 0.50€
        return reply.status(400).send({ error: `Importe bajo: ${totalAmount}€` })
      }

      // [SEGURIDAD] Compactamos cart y añadimos precio unitario del server para hacerlo inmutable
      const cartCompact = items.map(it => {
        const v = dbVariants.find(dv => dv.id === Number(it.id))
        const basePrice = v?.price_gross_override ?? v?.product?.price_gross ?? 0
        // El descuento de la variante (color) manda sobre el del producto.
        const discount  = v?.discount_percent ?? v?.product?.discount_percent ?? 0
        const finalPrice = +(basePrice * (1 - discount / 100)).toFixed(2)

        return {
          id: Number(it.id),
          q: Number(it.qty || it.quantity || 1),
          s: it.selectedSize || it.size || null,
          p: finalPrice
        }
      })
      const cartJson = JSON.stringify(cartCompact)

      // 3. Crear el PaymentIntent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          cart_items: cartJson // Inmutable
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

  // --- ADJUNTAR DATOS AL PAGO ---
  // Guarda los datos del cliente y envio en Stripe (ya no modifica el carrito, que es inmutable)
  fastify.post('/attach', {
    onRequest: [fastify.authenticate, fastify.csrfProtection]
  }, async (request, reply) => {
    const userId = request.user.id
    const { paymentIntentId, shippingAddress, customerEmail, customerName } = request.body

    if (!paymentIntentId) {
      return reply.status(400).send({ error: 'paymentIntentId es requerido' })
    }
    if (!shippingAddress) {
      return reply.status(400).send({ error: 'shippingAddress es requerido' })
    }

    const shippingJson = JSON.stringify(shippingAddress)

    if (shippingJson.length > 500) {
      return reply.status(400).send({ error: 'Direccion demasiado larga.' })
    }

    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          user_id: String(userId),
          shipping_addr: shippingJson,
          customer_email: customerEmail || '',
          customer_name:  customerName || '',
        }
      })
      return { ok: true }
    } catch (err) {
      fastify.log.error({ err, paymentIntentId }, '[ATTACH] Error actualizando metadata')
      return reply.status(500).send({
        error: 'No se pudo adjuntar la metadata al PaymentIntent'
      })
    }
  })

  // --- CONFIRMAR PEDIDO (SÍNCRONO) ---
  // Se llama desde el frontend tras el pago para verificar y crear el pedido (delegado a paymentService)
  fastify.post('/confirm', {
    onRequest: [fastify.authenticate, fastify.csrfProtection]
  }, async (request, reply) => {
    // [SEGURIDAD] Ignoramos items y totalAmount del request.body. Stripe es la única fuente de la verdad.
    const { paymentIntentId, shippingAddress } = request.body

    try {
      // 0. Validación con Stripe: Comprobar que el pago realmente se completó
      if (!paymentIntentId) {
        return reply.status(400).send({ error: 'El paymentIntentId es obligatorio' })
      }

      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      } catch (stripeErr) {
        fastify.log.warn({ paymentIntentId, err: stripeErr.message }, 'Intento de confirmar con ID inválido')
        return reply.status(400).send({ error: 'ID de pago no válido o no encontrado' })
      }

      if (paymentIntent.status !== 'succeeded') {
        fastify.log.warn({ paymentIntentId, status: paymentIntent.status }, 'Intento de confirmar pedido sin pago exitoso')
        return reply.status(400).send({ error: 'El pago no ha sido procesado o completado con éxito por Stripe' })
      }

      // [SEGURIDAD] Delegamos la creación segura a confirmOrderByPaymentIntent
      const { order, invoice } = await confirmOrderByPaymentIntent({
        paymentIntentId,
        paymentIntent,
        shippingAddress,
        logger: fastify.log,
      })

      if (!order) {
         return reply.status(500).send({ error: 'Error interno: No se pudo verificar ni crear el pedido.' })
      }

      return {
        message: 'Pedido procesado con éxito',
        orderId: order.id,
        invoice,
      }

    } catch (err) {
      fastify.log.error('[CHECKOUT_CONFIRM] Error crítico:', err)
      return reply.status(500).send({
        error: 'Error al procesar el pedido' // [SEGURIDAD] Información interna ofuscada
      })
    }
  })

  // --- WEBHOOK DE STRIPE ---
  // Recibe notificaciones automáticas de Stripe (ej: pago completado con éxito)
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

  // --- HISTORIAL DE PEDIDOS ---
  // Lista todos los pedidos realizados por el usuario logueado
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

  // --- DESCARGAR FACTURA ---
  // Genera y sirve el PDF de la factura asociada a un pedido
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
