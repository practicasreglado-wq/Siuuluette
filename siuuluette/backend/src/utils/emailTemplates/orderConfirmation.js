export function renderOrderConfirmationHTML({ invoice, customer, items, orderId }) {
  const customerName = customer?.name || 'Cliente'
  const invoiceNumber = invoice?.invoice_number || 'S/N'
  const totalAmount = Number(invoice?.total_gross || 0).toFixed(2)

  // Render items rows
  const itemsHtml = items.map(item => {
    const desc = [item.name, item.color && `(${item.color})`, item.size && `Talla ${item.size}`].filter(Boolean).join(' ')
    const price = (Number(item.unit_price_gross) * Number(item.quantity)).toFixed(2)
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #E5E0D8; font-size: 14px;">${desc} <span style="color: #999;">x${item.quantity}</span></td>
        <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #E5E0D8; font-size: 14px; text-align: right;">${price} €</td>
      </tr>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Pedido - Le Siuuluette</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; color: #E5E0D8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1A1A1A; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px; color: #C5A36A; text-transform: uppercase;">
                LE SIUULUETTE
              </h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.5; color: #E5E0D8;">
                Hola <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.5; color: #AAA;">
                Gracias por confiar en <strong>Le Siuuluette</strong>. Hemos recibido tu pedido y estamos preparándolo. No sigas tendencias, créalas.
              </p>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #222; border-radius: 6px; padding: 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 15px; border-bottom: 1px solid #444;">
                    <span style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Pedido #${orderId}</span><br>
                    <span style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Factura ${invoiceNumber}</span>
                  </td>
                </tr>
                <!-- Items -->
                ${itemsHtml}
                <!-- Total -->
                <tr>
                  <td style="padding-top: 15px; font-size: 16px; font-weight: bold; color: #FFF;">TOTAL</td>
                  <td style="padding-top: 15px; font-size: 16px; font-weight: bold; color: #C5A36A; text-align: right;">${totalAmount} €</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Info -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #888; line-height: 1.5;">
                Hemos adjuntado la factura en PDF en este correo para tus registros.
              </p>
              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.5;">
                Si tienes alguna duda o problema, por favor responde a este correo y te ayudaremos enseguida.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer Footer -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                © ${new Date().getFullYear()} Le Siuuluette. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
