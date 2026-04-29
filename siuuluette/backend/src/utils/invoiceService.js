// backend/src/utils/invoiceService.js
//
// Servicio que orquesta la emisión de una factura para un pedido:
//   1. Calcula totales (neto, IVA, bruto) a partir de los order_items.
//   2. Pide a Postgres el siguiente número correlativo.
//   3. Genera el PDF (con logo).
//   4. Sube el PDF al bucket "invoices" de Supabase Storage.
//   5. Inserta el registro en la tabla invoices con todos los snapshots.
//
// Pensado para ser idempotente y robusto: si el pedido ya tiene factura,
// devuelve la existente sin duplicar.

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { supabase } from '../db/supabase.js'
import { COMPANY, getIssuerSnapshot } from '../config/company.js'
import { generateInvoicePDF } from './invoice.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Ruta al logo. Por defecto buscamos en backend/src/assets/Logotipo.png.
// Si no está, caemos a la copia del frontend. Si tampoco está, el PDF
// se genera con el nombre en texto (sin imagen).
const DEFAULT_LOGO_CANDIDATES = [
  path.resolve(__dirname, '..', 'assets', 'Logotipo_r.png'),
  path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'img', 'Logotipo_r.png'),
]
const LOGO_PATH = process.env.INVOICE_LOGO_PATH ||
  DEFAULT_LOGO_CANDIDATES.find((p) => {
    try { return fs.existsSync(p) } catch { return false }
  }) ||
  DEFAULT_LOGO_CANDIDATES[0]

const STORAGE_BUCKET = 'invoices'

/**
 * Emite la factura para un pedido. Idempotente: si ya existe, la devuelve.
 *
 * @param {number} orderId
 * @param {Object} [opts]
 * @param {Object} [opts.shippingAddress] - Override puntual de la direccion (para flujos donde aun no se ha guardado en profiles).
 * @returns {Promise<{ invoice: Object, pdfBuffer: Buffer, isNew: boolean }>}
 */
export async function issueInvoiceForOrder(orderId, opts = {}) {
  // 1. Si ya existe factura para este pedido, devolverla (idempotencia)
  const { data: existing } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle()

  if (existing) {
    return { invoice: existing, pdfBuffer: null, isNew: false }
  }

  // 2. Cargar el pedido + items + variantes + producto
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(`
      id, user_id, total_amount, shipping_address, created_at,
      order_items (
        id, quantity, unit_price, size, product_id
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new Error(`Pedido ${orderId} no encontrado: ${orderErr?.message}`)
  }

  // Enriquecer items con nombre de producto y color
  const variantIds = order.order_items.map((oi) => oi.product_id)
  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      id, color_name,
      product:products ( name )
    `)
    .in('id', variantIds)

  const items = order.order_items.map((oi) => {
    const v = variants?.find((vv) => vv.id === oi.product_id)
    return {
      name: v?.product?.name || 'Producto Siuuluette',
      color: v?.color_name || null,
      size: oi.size || null,
      quantity: Number(oi.quantity),
      unit_price_gross: Number(oi.unit_price), // unit_price guardado es BRUTO (con IVA)
    }
  })

  // 3. Calcular totales (a partir de los items, no del total_amount del pedido,
  //    para evitar arrastres de redondeo en facturas multi-linea)
  const taxRate = COMPANY.vatRate
  const taxFactor = 1 + taxRate / 100

  let totalGross = 0
  let totalNet   = 0
  for (const it of items) {
    const lineGross = +(it.unit_price_gross * it.quantity).toFixed(2)
    const lineNet   = +(lineGross / taxFactor).toFixed(2)
    totalGross += lineGross
    totalNet   += lineNet
  }
  totalGross = +totalGross.toFixed(2)
  totalNet   = +totalNet.toFixed(2)
  const totalTax = +(totalGross - totalNet).toFixed(2)

  // 4. Construir snapshots
  const issuer = getIssuerSnapshot()

  // Cliente: nombre desde profile, dirección desde el shipping del pedido
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, phone')
    .eq('id', order.user_id)
    .maybeSingle()

  // El email del cliente vive en auth.users (no en profiles), lo cogemos via admin API
  let userEmail = null
  try {
    const { data: userResp } = await supabase.auth.admin.getUserById(order.user_id)
    userEmail = userResp?.user?.email || null
  } catch {
    // sin email es aceptable para emitir la factura (no es legalmente obligatorio)
  }

  let shippingAddress = opts.shippingAddress
  if (!shippingAddress) {
    try {
      shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : (order.shipping_address || {})
    } catch {
      shippingAddress = {}
    }
  }

  const customer = {
    user_id: order.user_id,
    name: profile?.username || 'Cliente Siuuluette',
    email: userEmail,
    phone: profile?.phone || null,
    address: shippingAddress,
    snapshot_at: new Date().toISOString(),
  }

  // 5. Generar el numero correlativo (atomico via RPC)
  const issueDate = new Date()
  const issueYear = issueDate.getFullYear()
  const series    = COMPANY.invoiceSeries

  const { data: nextSeq, error: seqErr } = await supabase
    .rpc('next_invoice_sequence', { p_series: series, p_year: issueYear })

  if (seqErr || nextSeq == null) {
    throw new Error(`No se pudo obtener el numero correlativo: ${seqErr?.message}`)
  }

  const sequenceNumber = Number(nextSeq)
  const invoiceNumber  = `${series}-${issueYear}-${String(sequenceNumber).padStart(6, '0')}`

  // 6. Generar el PDF
  const invoiceData = {
    invoice_number: invoiceNumber,
    issue_date:     issueDate,
    total_net:      totalNet,
    total_tax:      totalTax,
    tax_rate:       taxRate,
    total_gross:    totalGross,
  }

  const pdfBuffer = await generateInvoicePDF({
    invoice:  invoiceData,
    items,
    issuer,
    customer,
    logoPath: LOGO_PATH,
  })

  // 7. Subir el PDF a Storage
  const pdfPath = `${issueYear}/${invoiceNumber}.pdf`
  const { error: uploadErr } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadErr) {
    // No abortamos: persistimos la factura igualmente. El PDF puede regenerarse despues.
    console.error('[INVOICE_SERVICE] Error subiendo PDF a Storage:', uploadErr.message)
  }

  // 8. Insertar la fila de factura
  const { data: invoice, error: insertErr } = await supabase
    .from('invoices')
    .insert([{
      order_id:        orderId,
      series,
      issue_year:      issueYear,
      sequence_number: sequenceNumber,
      invoice_number:  invoiceNumber,
      issue_date:      issueDate.toISOString(),
      total_net:       totalNet,
      total_tax:       totalTax,
      tax_rate:        taxRate,
      total_gross:     totalGross,
      status:          'issued',
      pdf_path:        uploadErr ? null : pdfPath,
      issuer_snapshot:   issuer,
      customer_snapshot: customer,
    }])
    .select()
    .single()

  if (insertErr) {
    throw new Error(`Error guardando la factura en BD: ${insertErr.message}`)
  }

  return { invoice, pdfBuffer, isNew: true, customer, items }
}

/**
 * Recupera el PDF de una factura ya emitida desde Supabase Storage.
 * Si no encontramos el PDF en Storage, lo regeneramos desde los snapshots.
 *
 * @param {Object} invoice - Fila completa de la tabla invoices
 * @returns {Promise<Buffer>}
 */
export async function fetchOrRegenerateInvoicePDF(invoice) {
  // Intento descargar el PDF guardado
  if (invoice.pdf_path) {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(invoice.pdf_path)

    if (!error && data) {
      const arrayBuf = await data.arrayBuffer()
      return Buffer.from(arrayBuf)
    }
    console.warn(`[INVOICE_SERVICE] PDF en Storage no accesible (${invoice.pdf_path}), regenerando...`)
  }

  // Regeneración a partir del snapshot. Necesitamos los items del pedido.
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price, size, product_id')
    .eq('order_id', invoice.order_id)

  const variantIds = (orderItems || []).map((oi) => oi.product_id)
  const { data: variants } = await supabase
    .from('product_variants')
    .select(`id, color_name, product:products(name)`)
    .in('id', variantIds)

  const items = (orderItems || []).map((oi) => {
    const v = variants?.find((vv) => vv.id === oi.product_id)
    return {
      name: v?.product?.name || 'Producto Siuuluette',
      color: v?.color_name || null,
      size: oi.size || null,
      quantity: Number(oi.quantity),
      unit_price_gross: Number(oi.unit_price),
    }
  })

  return generateInvoicePDF({
    invoice: {
      invoice_number: invoice.invoice_number,
      issue_date:     invoice.issue_date,
      total_net:      invoice.total_net,
      total_tax:      invoice.total_tax,
      tax_rate:       invoice.tax_rate,
      total_gross:    invoice.total_gross,
    },
    items,
    issuer:   invoice.issuer_snapshot,
    customer: invoice.customer_snapshot,
    logoPath: LOGO_PATH,
  })
}
