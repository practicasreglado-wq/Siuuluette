/**
 * ARCHIVO: utils/paymentService.js
 * DESCRIPCIÓN: Implementa la lógica de negocio idempotente para confirmar pedidos pagados.
 * Maneja la creación automática de órdenes en la base de datos a partir de metadata en caso de desconexión del cliente, invoca la generación de facturas y coordina el envío de correos de confirmación.
 */
// backend/src/utils/paymentService.js
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
 * CONFIRMAR PEDIDO PAGADO
 * Esta es la función principal que se ejecuta cuando un pago tiene éxito.
 * 1. Busca el pedido en la base de datos.
 * 2. Si no existe, lo crea usando los datos de respaldo de Stripe (Metadata).
 * 3. Emite la factura legal y envía el email de confirmación al cliente.
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
 * CREACIÓN DE EMERGENCIA DESDE STRIPE
 * Si el usuario cierra la pestaña antes de que el frontend avise al servidor,
 * esta función reconstruye el pedido completo usando la información que guardamos
 * preventivamente en los servidores de Stripe.
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
      id, color_name, price_gross_override, discount_percent,
      product:products ( id, name, price_gross, discount_percent )
    `)
    .in('id', variantIds)

  if (vErr) {
    throw new Error(`Error cargando variantes desde metadata: ${vErr.message}`)
  }

  // 2. Insertar el order
  // [SEGURIDAD] Ignoramos cualquier total_amount proporcionado por el cliente.
  // La cantidad recibida por Stripe es la única fuente de la verdad.
  const totalAmount = paymentIntent.amount_received / 100
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
    // El descuento de la variante (color) manda sobre el del producto.
    const discount  = v?.discount_percent ?? v?.product?.discount_percent ?? 0
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
    // El trigger trg_decrement_variant_stock de la DB descuenta el
    // stock al insertar cada linea y RECHAZA la insercion si alguna
    // prenda se quedo sin unidades entre el pago y la confirmacion
    // (carrera por la ultima unidad). Si eso pasa, el 'order' ya se
    // creo unas lineas mas arriba y quedaria huerfano (sin order_items
    // y sin stock descontado), asi que lo borramos para no dejar
    // basura en la DB. El cobro de Stripe, si existio, habra que
    // reembolsarlo manualmente desde el dashboard de Stripe.
    log.error?.(
      { orderId: newOrder.id, paymentIntentId: paymentIntent.id, err: itemsErr.message },
      '[paymentService] Fallo al crear order_items (posible falta de stock). Limpiando order huerfano.'
    )
    await supabase.from('orders').delete().eq('id', newOrder.id)
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
