// backend/src/utils/invoice.js
//
// Generador de PDF de factura.
//
// Diseño:
//   - Toma como entrada datos ya calculados (invoice, items, issuer, customer)
//     en lugar de calcular nada por sí mismo. La logica de calculo vive en
//     invoiceService.js — esta función solo dibuja.
//   - Devuelve un Buffer con el PDF, no un stream. Asi quien llama puede
//     subirlo a Storage Y enviarlo al cliente sin generarlo dos veces.
//   - Carga el logo como imagen si el archivo existe; si no, cae a texto.

import PDFDocument from 'pdfkit'
import fs from 'fs'

/**
 * Genera el PDF de la factura y devuelve un Buffer.
 *
 * @param {Object} params
 * @param {Object} params.invoice  - { invoice_number, issue_date, total_net, total_tax, tax_rate, total_gross }
 * @param {Array}  params.items    - Lineas: [{ name, quantity, unit_price_gross, color, size }]
 * @param {Object} params.issuer   - Snapshot del emisor (ver getIssuerSnapshot)
 * @param {Object} params.customer - Snapshot del comprador { name, address: {...}, email }
 * @param {string} [params.logoPath] - Ruta absoluta al PNG/JPG del logo. Si falla, se omite.
 * @returns {Promise<Buffer>}
 */
export function generateInvoicePDF({ invoice, items, issuer, customer, logoPath }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks = []
      doc.on('data', (c) => chunks.push(c))
      doc.on('end',  ()  => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // ---- HEADER: logo + datos del emisor ----------------------------
      const headerY = 50

      // Intento dibujar el logo. Si la ruta no existe o pdfkit falla,
      // capturamos el error y caemos al texto.
      let logoDrawn = false
      if (logoPath) {
        try {
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 30, 10, { fit: [220, 100] })
            logoDrawn = true
          }
        } catch (e) {
          // logo no dibujable: seguimos con texto
          logoDrawn = false
        }
      }

      if (!logoDrawn) {
        doc
          .fillColor('#3d362f')
          .font('Helvetica-Bold')
          .fontSize(20)
          .text(issuer.trade_name || 'LE SIUULUETTE', 50, headerY)
      }

      // Datos del emisor (debajo del logo o nombre)
      const issuerY = headerY + 75
      doc
        .fillColor('#3d362f')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(issuer.legal_name || '[RAZÓN SOCIAL PENDIENTE]', 50, issuerY)
        .font('Helvetica')
        .fontSize(9)
        .text(`NIF: ${issuer.tax_id || '[NIF PENDIENTE]'}`, 50, issuerY + 13)
        .text(issuer.address_line1 || '', 50, issuerY + 26)
        .text(`${issuer.postal_code || ''} ${issuer.city || ''}, ${issuer.province || ''}`, 50, issuerY + 39)
        .text(`${issuer.country || 'España'} · ${issuer.email || ''}`, 50, issuerY + 52)

      // ---- HEADER (derecha): bloque FACTURA ---------------------------
      doc
        .fillColor('#d4af37')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('FACTURA', 400, headerY, { align: 'right' })

      const issueDate = invoice.issue_date instanceof Date
        ? invoice.issue_date
        : new Date(invoice.issue_date)

      doc
        .fillColor('#3d362f')
        .font('Helvetica')
        .fontSize(10)
        .text(`Nº: ${invoice.invoice_number}`, 400, headerY + 28, { align: 'right' })
        .text(`Fecha: ${issueDate.toLocaleDateString('es-ES')}`, 400, headerY + 43, { align: 'right' })

      // Linea separadora
      doc.moveTo(50, 175).lineTo(550, 175).stroke('#d5cfc5')

      // ---- CLIENTE ----------------------------------------------------
      const addr = customer.address || {}
      doc
        .fillColor('#3d362f')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('FACTURAR / ENVIAR A:', 50, 195)
        .font('Helvetica')
        .fontSize(10)
        .text(customer.name || 'Cliente Siuuluette', 50, 210)
        .text(addr.line1 || '', 50, 224)
        .text(`${addr.postal_code || ''} ${addr.city || ''}, ${addr.state || ''}`, 50, 238)
        .text(addr.country || 'España', 50, 252)
      if (customer.email) {
        doc.text(customer.email, 50, 266)
      }

      // ---- TABLA DE ITEMS --------------------------------------------
      const tableTop = 310
      doc.font('Helvetica-Bold').fontSize(10)
      drawRow(doc, tableTop, 'Producto', 'Cant.', 'Neto', `IVA ${invoice.tax_rate}%`, 'Total')
      doc.moveTo(50, tableTop + 18).lineTo(550, tableTop + 18).stroke('#d5cfc5')

      let cursorY = tableTop + 28
      doc.font('Helvetica').fontSize(10)

      const taxFactor = 1 + Number(invoice.tax_rate) / 100

      for (const it of items) {
        const gross = Number(it.unit_price_gross)
        const net   = +(gross / taxFactor).toFixed(2)
        const vat   = +(gross - net).toFixed(2)
        const lineTotal = +(gross * it.quantity).toFixed(2)

        const desc = [
          it.name,
          it.color ? `(${it.color})` : '',
          it.size  ? `· Talla ${it.size}` : ''
        ].filter(Boolean).join(' ')

        drawRow(
          doc, cursorY,
          desc,
          it.quantity.toString(),
          `${net.toFixed(2)} €`,
          `${vat.toFixed(2)} €`,
          `${lineTotal.toFixed(2)} €`
        )
        cursorY += 22

        // Salto de pagina si nos pasamos
        if (cursorY > 700) {
          doc.addPage()
          cursorY = 50
        }
      }

      // ---- TOTALES ----------------------------------------------------
      doc.moveTo(50, cursorY + 8).lineTo(550, cursorY + 8).stroke('#d5cfc5')

      const summaryY = cursorY + 24
      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Base imponible:', 350, summaryY)
        .text(`${Number(invoice.total_net).toFixed(2)} €`, 480, summaryY, { align: 'right' })
        .text(`IVA (${invoice.tax_rate}%):`, 350, summaryY + 18)
        .text(`${Number(invoice.total_tax).toFixed(2)} €`, 480, summaryY + 18, { align: 'right' })
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#3d362f')
        .text('TOTAL:', 350, summaryY + 42)
        .text(`${Number(invoice.total_gross).toFixed(2)} €`, 480, summaryY + 42, { align: 'right' })

      // ---- PIE DE PÁGINA ---------------------------------------------
      const footerY = 760
      doc
        .font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#8c8276')
        .text(
          `Factura emitida electrónicamente por ${issuer.legal_name || 'el emisor'}. ` +
          `Conserve este documento durante el plazo legalmente establecido.`,
          50, footerY,
          { align: 'center', width: 500 }
        )

      if (issuer.registry_info) {
        doc.text(issuer.registry_info, 50, footerY + 14, { align: 'center', width: 500 })
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

function drawRow(doc, y, item, qty, net, vat, total) {
  doc
    .text(item, 50, y, { width: 180 })
    .text(qty,   240, y, { width: 40,  align: 'center' })
    .text(net,   300, y, { width: 70,  align: 'right' })
    .text(vat,   380, y, { width: 70,  align: 'right' })
    .text(total, 480, y, { width: 70,  align: 'right' })
}
