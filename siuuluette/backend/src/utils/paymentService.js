// backend/src/utils/paymentService.js
//
// Logica idempotente de "confirmar pedido pagado":
//   - busca el order por stripe_payment_intent_id
//   - si ya esta en 'paid' y tiene factura, no hace nada (idempotencia)
//   - si no, lo marca como pagado, emite la factura y envia el email
//
// Esta funcion es la fuente unica de verdad para confirmar un pedido,
// y la usan tanto el endpoint /confirm (camino sincrono desde el frontend)
// como el webhook de Stripe (camino asincrono desde Stripe).
//
// Si los dos caminos llegan a la vez, la idempotencia evita que se
// dupliquen facturas o emails: la primera llamada hace el trabajo, la
// segunda detecta que ya esta hecho y retorna lo existente.

import { supabase } from '../db/supabase.js'
import { issueInvoiceForOrder } from './invoiceService.js'
import { sendOrderConfirmationEmail } from './mailer.js'

/**
 * Confirma un pedido a partir de su PaymentIntent de Stripe.
 * Idempotente: llamarla varias veces produce el mismo resultado.
 *
 * Comportamiento:
 *   - Si existe un order para ese paymentIntentId, lo confirma (paid + factura + email).
 *   - Si NO existe y se pasa el `paymentIntent` completo con metadata adjuntada
 *     por /attach, crea el order + items + vacia el carrito ANTES de confirmar.
 *
 * @param {Object} params
 * @param {string} params.paymentIntentId - ID del PaymentIntent (pi_...)
 * @param {Object} [params.paymentIntent] - PaymentIntent completo (con metadata). Necesario si el order aun no existe (caso webhook autonomo).
 * @param {Object} [params.shippingAddress] - Override puntual de la direccion (solo cuando lo pasa /confirm)
 * @param {Object} [params.logger] - logger fastify para trazas (opcional)
 * @returns {Promise<{ order: Object, invoice: Object|null, alreadyProcessed: boolean }>}
 */
export async function confirmOrderByPaymentIntent({ paymentIntentId, paymentIntent, shippingAddress, logger }) {
  const log = logger || console

  if (!paymentIntentId) {
    throw new Error('paymentIntentId es requerido')
  }

  // 1. Buscar el order asociado a este PaymentIntent
  let { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (orderErr) {
    throw new Error(`Error buscando pedido por paymentIntentId: ${orderErr.message}`)
  }

  // 2. Si no existe, intentamos crearlo desde la metadata del PaymentIntent
  if (!order) {
    if (!paymentIntent) {
      log.warn?.(
        { paymentIntentId },
        '[paymentService] PaymentIntent pagado sin order en DB y sin paymentIntent ' +
        'para leer metadata. /confirm probablemente aun no llego. No-op.'
      )
      return { order: null, invoice: null, alreadyProcessed: false }
    }

    const created = await createOrderFromPaymentIntentMetadata(paymentIntent, log)
    if (!created) {
      // Metadata insuficiente (paymentIntent sin /attach previo)
      log.warn?.(
        { paymentIntentId },
        '[paymentService] PaymentIntent sin metadata utilizable. ' +
        'Saltando creacion automatica.'
      )
      return { order: null, invoice: null, alreadyProcessed: false }
    }
    order = created
  }

  // 2. Si ya esta pagado y tiene factura, no hacemos nada (idempotencia)
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('invoice_number, issue_date')
    .eq('order_id', order.id)
    .maybeSingle()

  if (order.status === 'paid' && existingInvoice) {
    log.info?.(
      { orderId: order.id, paymentIntentId },
      '[paymentService] Pedido ya estaba pagado y facturado. Skip.'
    )
    return { order, invoice: existingInvoice, alreadyProcessed: true }
  }

  // 3. Marcar el pedido como pagado si todavia no lo esta
  if (order.status !== 'paid') {
    const { error: updErr } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order.id)

    if (updErr) {
      throw new Error(`Error marcando el pedido ${order.id} como pagado: ${updErr.message}`)
    }
  }

  // 4. Emitir factura (issueInvoiceForOrder ya es idempotente: si existe la devuelve)
  let invoiceResult = null
  try {
    invoiceResult = await issueInvoiceForOrder(order.id, { shippingAddress })
    log.info?.(
      { orderId: order.id, invoice: invoiceResult.invoice.invoice_number },
      '[paymentService] Factura emitida'
    )
  } catch (invErr) {
    log.error?.(
      { orderId: order.id, err: invErr },
      '[paymentService] Pedido pagado pero la emision de factura ha fallado'
    )
    // No relanzamos: el pedido ya esta pagado. La factura se podra
    // reintentar despues desde el endpoint de descarga.
    return { order, invoice: null, alreadyProcessed: false }
  }

  // 5. Enviar email solo si la factura es nueva
  if (invoiceResult.isNew) {
    try {
      const mailRes = await sendOrderConfirmationEmail({
        invoice: invoiceResult.invoice,
        customer: invoiceResult.customer,
        items: invoiceResult.items,
        pdfBuffer: invoiceResult.pdfBuffer,
        orderId: order.id,
      })

      if (mailRes?.success) {
        log.info?.({ messageId: mailRes.messageId }, '[paymentService] Email de confirmacion enviado')
      } else if (!mailRes?.skipped) {
        log.error?.({ err: mailRes?.error }, '[paymentService] Fallo al enviar email')
      }
    } catch (mailErr) {
      log.error?.({ err: mailErr }, '[paymentService] Error inesperado enviando email')
    }
  }

  return {
    order,
    invoice: {
      invoice_number: invoiceResult.invoice.invoice_number,
      issue_date:     invoiceResult.invoice.issue_date,
    },
    alreadyProcessed: false,
  }
}

/**
 * Crea un order + order_items en la DB a partir de la metadata que el
 * frontend adjunto al PaymentIntent via /attach.
 *
 * Solo se llama desde el webhook cuando llega payment_intent.succeeded
 * y NO existe un order para ese paymentIntent (caso "frontend cayo").
 *
 * @param {Object} paymentIntent - Objeto PaymentIntent completo de Stripe
 * @param {Object} log - logger
 * @returns {Promise<Object|null>} El order creado, o null si falta metadata.
 */
async function createOrderFromPaymentIntentMetadata(paymentIntent, log) {
  const meta = paymentIntent?.metadata || {}
  if (!meta.user_id || !meta.cart_items || !meta.shipping_addr) {
    return null
  }

  let cart, shipping
  try {
    cart     = JSON.parse(meta.cart_items)
    shipping = JSON.parse(meta.shipping_addr)
  } catch (e) {
    log.error?.({ err: e, paymentIntentId: paymentIntent.id }, '[paymentService] metadata corrupta')
    return null
  }

  // 1. Calcular precio unitario por linea (mismo algoritmo que /confirm)
  const variantIds = cart.map(c => Number(c.id))
  const { data: variants, error: vErr } = await supabase
    .from('product_variants')
    .select(`
      id, color_name, price_gross_override,
      product:products ( id, name, price_gross, discount_percent )
    `)
    .in('id', variantIds)

  if (vErr) {
    throw new Error(`Error cargando variantes desde metadata: ${vErr.message}`)
  }

  // 2. Insertar el order
  const totalAmount = Number(meta.total_amount) || (paymentIntent.amount_received / 100)
  const { data: newOrder, error: orderErr } = await supabase
    .from('orders')
    .insert([{
      user_id: meta.user_id,
      total_amount: totalAmount,
      status: 'paid',
      shipping_address: JSON.stringify(shipping),
      stripe_payment_intent_id: paymentIntent.id,
    }])
    .select()
    .single()

  if (orderErr) {
    // 23505 = unique_violation en Postgres.
    // Esto pasa cuando /confirm y el webhook corren en paralelo: /confirm
    // gana la carrera y crea el order; el webhook llega un milisegundo
    // despues e intenta crearlo otra vez. No es un error: simplemente
    // recuperamos el order que /confirm ya creo y seguimos.
    if (orderErr.code === '23505' || /duplicate key/i.test(orderErr.message || '')) {
      log.info?.(
        { paymentIntentId: paymentIntent.id },
        '[paymentService] Race con /confirm: order ya existe, recuperando.'
      )
      const { data: existing } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single()
      return existing // los order_items ya los inserto /confirm, no duplicamos
    }
    throw new Error(`Error creando order desde webhook: ${orderErr.message}`)
  }

  // 3. Insertar order_items
  const orderItems = cart.map(it => {
    const v = variants?.find(vv => vv.id === Number(it.id))
    const basePrice = v?.price_gross_override ?? v?.product?.price_gross ?? 0
    const discount  = v?.product?.discount_percent || 0
    const finalPrice = +(basePrice * (1 - discount / 100)).toFixed(2)
    return {
      order_id: newOrder.id,
      product_id: Number(it.id),
      quantity: Number(it.q) || 1,
      unit_price: finalPrice,
      size: it.s || 'M',
    }
  })

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsErr) {
    throw new Error(`Error creando order_items desde webhook: ${itemsErr.message}`)
  }

  // 4. Vaciar carrito del usuario
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', meta.user_id)

  log.info?.(
    { orderId: newOrder.id, paymentIntentId: paymentIntent.id },
    '[paymentService] Order creado desde metadata (webhook autonomo)'
  )
  return newOrder
}
