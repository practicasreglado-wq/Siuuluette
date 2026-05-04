import Stripe from 'stripe'
import { supabase } from '../db/supabase.js'
import { issueInvoiceForOrder, fetchOrRegenerateInvoicePDF } from '../utils/invoiceService.js'
import { sendOrderConfirmationEmail } from '../utils/mailer.js'

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

  // POST /api/checkout/confirm — Finalizar pedido y guardar en DB
  fastify.post('/confirm', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { paymentIntentId, shippingAddress, items, totalAmount } = request.body

    try {
      // 1. Crear el Pedido (Order)
      const { data: order, error: orderError } = await supabase
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

      // 2. Crear los Detalles del Pedido (Order Items)
      // Buscamos las variantes para saber los precios finales guardados
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
          product_id: v?.id || item.id, // Guardamos el ID de la variante aquí
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

      // 4. Emitir factura (best-effort: si falla NO abortamos el pedido,
      //    el cliente ya pagó. Logueamos y se podrá reintentar despues
      //    desde un panel admin o un job de retry).
      let invoiceInfo = null
      try {
        const result = await issueInvoiceForOrder(order.id, {
          shippingAddress
        })
        invoiceInfo = {
          invoice_number: result.invoice.invoice_number,
          issue_date:     result.invoice.issue_date,
        }
        fastify.log.info(
          { orderId: order.id, invoice: invoiceInfo.invoice_number },
          'Factura emitida correctamente'
        )

        // Enviar email de confirmacion con la factura
        if (result.isNew) {
          try {
            const mailRes = await sendOrderConfirmationEmail({
              invoice: result.invoice,
              customer: result.customer,
              items: result.items,
              pdfBuffer: result.pdfBuffer,
              orderId: order.id
            })
            
            if (!mailRes.success && !mailRes.skipped) {
              fastify.log.error({ err: mailRes.error }, 'Fallo el envio del email de confirmacion')
            } else if (mailRes.success) {
              fastify.log.info({ messageId: mailRes.messageId }, 'Email de confirmacion enviado')
            }
          } catch (mailErr) {
            fastify.log.error({ err: mailErr }, 'Error inesperado al enviar el email')
          }
        }

      } catch (invErr) {
        fastify.log.error(
          { orderId: order.id, err: invErr },
          'Pedido guardado pero la emisión de factura ha fallado'
        )
      }

      return {
        message: 'Pedido guardado con éxito',
        orderId: order.id,
        invoice: invoiceInfo,
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
