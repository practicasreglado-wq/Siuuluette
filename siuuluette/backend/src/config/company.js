// backend/src/config/company.js
//
// Datos fiscales del emisor de las facturas.
//
// =====================================================================
// ATENCIÓN — TODOS LOS VALORES SON PLACEHOLDERS HASTA QUE EL CLIENTE
// (Le Siuuluette) NOS DÉ SUS DATOS FISCALES REALES.
// =====================================================================
//
// Estos datos se imprimen literalmente en la cabecera de cada factura
// PDF y se guardan también en la columna issuer_snapshot de la tabla
// invoices en el momento de emisión.
//
// Cualquier factura emitida con los placeholders actuales NO TIENE
// VALIDEZ LEGAL. Solo sirven para validar técnicamente que la pipeline
// de facturación funciona.
//
// Cuando el cliente nos pase los datos reales, hay dos formas de
// inyectarlos sin tocar este código:
//
//   1. Recomendado — vía variables de entorno en el .env del backend:
//        COMPANY_LEGAL_NAME=...
//        COMPANY_TAX_ID=...
//        ...etc.
//
//   2. Editando los valores por defecto de abajo. Más rápido, pero los
//      datos quedan hardcodeados en el repositorio.
//
// Lo que necesitamos del cliente está documentado en el README o en el
// mensaje que le mandemos. Mínimo imprescindible:
//   - Razón social (legal name)
//   - NIF/CIF
//   - Domicilio fiscal completo
//   - Email de contacto
// =====================================================================

export const COMPANY = {
  // Nombre legal del emisor (sale en grande en la factura)
  legalName: process.env.COMPANY_LEGAL_NAME || 'Le Siuuluette Trademark, S.L.',

  // Nombre comercial / marca (puede coincidir con legalName)
  tradeName: process.env.COMPANY_TRADE_NAME || 'Le Siuuluette',

  // NIF / CIF
  taxId: process.env.COMPANY_TAX_ID || 'B22738512',

  // Domicilio fiscal completo
  addressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'C Ausias March 30 5 9',
  postalCode: process.env.COMPANY_POSTAL_CODE || '12540',
  city: process.env.COMPANY_CITY || 'Villarreal',
  province: process.env.COMPANY_PROVINCE || 'Castellón',
  country: process.env.COMPANY_COUNTRY || 'España',

  // Contacto fiscal / comercial
  email: process.env.COMPANY_EMAIL || 'lesiuuluette@gmail.com',
  phone: process.env.COMPANY_PHONE || '+34 123456789',

  // Tipo de IVA aplicado (régimen general España = 21)
  vatRate: Number(process.env.COMPANY_VAT_RATE || 21),

  // Serie de facturación (en España conviene numerar por serie + año)
  invoiceSeries: process.env.COMPANY_INVOICE_SERIES || 'SIU',

  // Inscripción en Registro Mercantil — solo aplicable a sociedades.
  // Cuando el cliente nos confirme su sociedad, rellenar (formato
  // habitual: "Inscrita en el Reg. Mercantil de Valencia, T.X F.Y H.Z").
  registryInfo: process.env.COMPANY_REGISTRY_INFO || '',
}

/**
 * Devuelve un snapshot serializable de los datos fiscales del emisor
 * en el momento de emisión de la factura. Se guarda en la columna
 * issuer_snapshot (JSONB) para preservar fielmente cómo se emitió la
 * factura aunque los datos cambien más adelante.
 */
export function getIssuerSnapshot() {
  return {
    legal_name: COMPANY.legalName,
    trade_name: COMPANY.tradeName,
    tax_id: COMPANY.taxId,
    address_line1: COMPANY.addressLine1,
    postal_code: COMPANY.postalCode,
    city: COMPANY.city,
    province: COMPANY.province,
    country: COMPANY.country,
    email: COMPANY.email,
    phone: COMPANY.phone,
    vat_rate: COMPANY.vatRate,
    registry_info: COMPANY.registryInfo,
    snapshot_at: new Date().toISOString(),
  }
}
