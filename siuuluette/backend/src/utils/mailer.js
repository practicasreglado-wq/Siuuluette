// backend/src/utils/mailer.js
//
// Envio de emails transaccionales mediante Resend.
//
// Diseño:
//   - Encapsula toda la logica del proveedor (Resend) de forma que
//     migrar a Klaviyo, Brevo o cualquier otro mas adelante sea
//     cambiar SOLO este archivo. El resto del codigo no tiene
//     constancia del proveedor concreto.
//   - Las funciones devuelven { success, messageId, error } y nunca
//     lanzan: el envio de email es 'best-effort' y NO debe abortar
//     el flujo de checkout.
//   - El override EMAIL_DEV_RECIPIENT_OVERRIDE redirige todos los
//     destinatarios a una sola direccion durante desarrollo, cuando
//     Resend esta en modo sandbox y no permite enviar a cualquiera.

import { Resend } from 'resend'
import { renderOrderConfirmationHTML } from './emailTemplates/orderConfirmation.js'

const apiKey         = process.env.RESEND_API_KEY
const fromAddress    = process.env.RESEND_FROM_EMAIL || 'Le Siuuluette <onboarding@resend.dev>'
const devOverride    = process.env.EMAIL_DEV_RECIPIENT_OVERRIDE || null

if (!apiKey) {
  console.warn('[MAILER] RESEND_API_KEY no esta definida; los envios de email se desactivaran.')
}

const resend = apiKey ? new Resend(apiKey) : null

/**
 * Envia el email de confirmacion de pedido con la factura PDF adjunta.
 *
 * @param {Object} params
 * @param {Object} params.invoice    - Fila de la tabla invoices (con invoice_number, totales, etc.)
 * @param {Object} params.customer   - Snapshot del comprador { name, email, address }
 * @param {Array}  params.items      - Lineas del pedido [{ name, color, size, quantity, unit_price_gross }]
 * @param {Buffer} params.pdfBuffer  - Buffer del PDF de la factura
 * @param {number} params.orderId    - ID del pedido (para referencia)
 * @returns {Promise<{success: boolean, messageId?: string, skipped?: boolean, error?: string}>}
 */
export async function sendOrderConfirmationEmail({
  invoice,
  customer,
  items,
  pdfBuffer,
  orderId,
}) {
  if (!resend) {
    return { success: false, skipped: true, error: 'RESEND_API_KEY no configurada' }
  }

  // Determinamos el destinatario:
  //   - Si hay override de desarrollo, va alli (sandbox de Resend).
  //   - Si no, al email del cliente del pedido.
  const recipient = devOverride || customer?.email
  if (!recipient) {
    return {
      success: false,
      skipped: true,
      error: 'Sin direccion de destinatario (cliente sin email y sin override)'
    }
  }

  // Construimos el subject y el HTML
  const subject = `Tu pedido en Le Siuuluette · ${invoice.invoice_number}`
  const html    = renderOrderConfirmationHTML({ invoice, customer, items, orderId })
  const text    = renderOrderConfirmationText({ invoice, customer, items, orderId })

  // Adjunto: la factura PDF
  const attachmentName = `${invoice.invoice_number}.pdf`
  const attachments    = pdfBuffer
    ? [{
        filename: attachmentName,
        content: pdfBuffer.toString('base64'),
      }]
    : []

  try {
    const { data, error } = await resend.emails.send({
      from:        fromAddress,
      to:          recipient,
      subject,
      html,
      text,
      attachments,
      headers: {
        // Marcar como transaccional para que clientes de email lo prioricen
        'X-Entity-Ref-ID': `order-${orderId}-invoice-${invoice.invoice_number}`,
      },
      tags: [
        { name: 'category', value: 'order_confirmation' },
        { name: 'invoice',  value: invoice.invoice_number },
      ],
    })

    if (error) {
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Version texto plano del email (fallback para clientes que no renderizan HTML).
 */
function renderOrderConfirmationText({ invoice, customer, items, orderId }) {
  const lines = []
  lines.push(`Hola ${customer?.name || 'cliente'},`)
  lines.push('')
  lines.push('Hemos recibido tu pedido en Le Siuuluette. Gracias por confiar en nosotros.')
  lines.push('')
  lines.push(`Numero de pedido: #${orderId}`)
  lines.push(`Numero de factura: ${invoice.invoice_number}`)
  lines.push('')
  lines.push('Resumen del pedido:')
  for (const it of items) {
    const desc = [it.name, it.color && `(${it.color})`, it.size && `Talla ${it.size}`].filter(Boolean).join(' ')
    const lineGross = (Number(it.unit_price_gross) * Number(it.quantity)).toFixed(2)
    lines.push(`  - ${desc} x${it.quantity} = ${lineGross} EUR`)
  }
  lines.push('')
  lines.push(`Base imponible: ${Number(invoice.total_net).toFixed(2)} EUR`)
  lines.push(`IVA (${invoice.tax_rate}%): ${Number(invoice.total_tax).toFixed(2)} EUR`)
  lines.push(`TOTAL: ${Number(invoice.total_gross).toFixed(2)} EUR`)
  lines.push('')

  const addr = customer?.address || {}
  if (addr.line1) {
    lines.push('Direccion de envio:')
    lines.push(`  ${addr.line1}`)
    lines.push(`  ${addr.postal_code || ''} ${addr.city || ''}, ${addr.state || ''}`)
    lines.push(`  ${addr.country || 'España'}`)
    lines.push('')
  }

  lines.push('Adjuntamos tu factura en PDF.')
  lines.push('')
  lines.push('Si tienes cualquier duda, responde a este correo.')
  lines.push('')
  lines.push('— El equipo de Le Siuuluette')
  return lines.join('\n')
}
