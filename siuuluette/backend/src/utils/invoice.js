import PDFDocument from 'pdfkit'

/**
 * Genera un PDF de factura proforma para un pedido
 * @param {Object} order - Datos del pedido (incluye order_items y perfil)
 * @param {Stream} stream - Stream donde escribir el PDF (res de fastify)
 */
export async function generateInvoicePDF(order, stream) {
  const doc = new PDFDocument({ margin: 50 })

  // Pipe the PDF to the response stream
  doc.pipe(stream)

  // --- HEADER: Datos de la Empresa (Vendedor) ---
  doc
    .fillColor('#3d362f')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('LE SIUULUETTE', 50, 50)
    .fontSize(10)
    .font('Helvetica')
    .text('Siuuluette Brand S.L. (Dato de prueba)', 50, 75)
    .text('NIF: B-12345678', 50, 90)
    .text('Calle del Lujo, 42, 28001 Madrid', 50, 105)
    .text('hola@siuuluette.com', 50, 120)
    .moveDown()

  // --- FACTURA INFO ---
  const invoiceNumber = `FAC-${order.id.toString().padStart(6, '0')}`
  const date = new Date(order.created_at).toLocaleDateString('es-ES')

  doc
    .fillColor('#d4af37') // Color Oro
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('FACTURA', 400, 50, { align: 'right' })
    .fillColor('#3d362f')
    .font('Helvetica')
    .fontSize(10)
    .text(`Nº: ${invoiceNumber}`, 400, 70, { align: 'right' })
    .text(`Fecha: ${date}`, 400, 85, { align: 'right' })

  doc.moveTo(50, 150).lineTo(550, 150).stroke('#d5cfc5')

  // --- CLIENTE (Comprador) ---
  const shipping = JSON.parse(order.shipping_address || '{}')
  const clientName = order.user?.username || 'Cliente Siuuluette'
  
  doc
    .font('Helvetica-Bold')
    .text('ENVIAR A:', 50, 170)
    .font('Helvetica')
    .text(clientName, 50, 185)
    .text(`${shipping.line1 || ''}`, 50, 200)
    .text(`${shipping.city || ''}, ${shipping.state || ''} ${shipping.postal_code || ''}`, 50, 215)
    .text(`${shipping.country || 'España'}`, 50, 230)

  // --- TABLA DE PRODUCTOS ---
  const tableTop = 280
  doc.font('Helvetica-Bold')
  
  // Headers
  generateTableRow(doc, tableTop, 'Producto', 'Cant.', 'Neto', 'IVA (21%)', 'Total')
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke('#d5cfc5')
  
  let currentTop = tableTop + 30
  doc.font('Helvetica')

  order.order_items.forEach((item) => {
    const productName = item.variant?.product?.name || 'Producto Siuuluette'
    const color = item.variant?.color_name ? ` (${item.variant.color_name})` : ''
    const size = item.size ? ` - Talla ${item.size}` : ''
    
    // El unit_price es el precio BRUTO (con IVA)
    const gross = parseFloat(item.unit_price)
    const net = +(gross / 1.21).toFixed(2)
    const vat = +(gross - net).toFixed(2)
    const lineTotal = +(gross * item.quantity).toFixed(2)

    generateTableRow(
      doc, 
      currentTop, 
      `${productName}${color}${size}`, 
      item.quantity.toString(), 
      `${net}€`, 
      `${vat}€`, 
      `${lineTotal}€`
    )
    
    currentTop += 25
  })

  // --- TOTALES ---
  doc.moveTo(50, currentTop + 10).lineTo(550, currentTop + 10).stroke('#d5cfc5')
  
  const totalNet = order.order_items.reduce((acc, i) => acc + (parseFloat(i.unit_price) / 1.21 * i.quantity), 0)
  const totalTax = order.order_items.reduce((acc, i) => acc + ((parseFloat(i.unit_price) - parseFloat(i.unit_price)/1.21) * i.quantity), 0)
  const total = order.total_amount

  const summaryTop = currentTop + 30
  doc
    .font('Helvetica')
    .text('Subtotal (Neto):', 350, summaryTop)
    .text(`${totalNet.toFixed(2)}€`, 480, summaryTop, { align: 'right' })
    .text('IVA (21%):', 350, summaryTop + 20)
    .text(`${totalTax.toFixed(2)}€`, 480, summaryTop + 20, { align: 'right' })
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('TOTAL FACTURA:', 350, summaryTop + 45)
    .text(`${total}€`, 480, summaryTop + 45, { align: 'right' })

  // --- PIE DE PÁGINA ---
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .fillColor('#8c8276')
    .text('Gracias por confiar en Le Siuuluette. Esta es una factura proforma generada automáticamente.', 50, 700, { align: 'center', width: 500 })

  // Finalize the PDF
  doc.end()
}

function generateTableRow(doc, y, item, qty, net, vat, total) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 180 })
    .text(qty, 240, y, { width: 40, align: 'center' })
    .text(net, 300, y, { width: 70, align: 'right' })
    .text(vat, 380, y, { width: 70, align: 'right' })
    .text(total, 480, y, { width: 70, align: 'right' })
}
