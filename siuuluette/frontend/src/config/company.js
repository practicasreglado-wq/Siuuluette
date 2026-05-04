// frontend/src/config/company.js
//
// Datos fiscales y de contacto del emisor.
//
// =====================================================================
// IMPORTANTE — TODOS LOS VALORES SON PLACEHOLDERS hasta que el cliente
// (Le Siuuluette) nos pase sus datos fiscales reales.
// =====================================================================
//
// Este archivo se importa desde TODAS las páginas legales:
//   - Aviso Legal
//   - Política de Privacidad
//   - Política de Cookies
//   - Condiciones Generales
//   - Marca Registrada
//   - Footer (datos de copyright)
//
// Cuando el cliente nos pase la información, se rellena AQUÍ en un único
// sitio y todas las páginas legales se actualizan automáticamente.
//
// Este archivo es paralelo a backend/src/config/company.js — los dos
// deben mantenerse sincronizados.
// =====================================================================

export const COMPANY = {
  // Nombre legal del emisor (razón social)
  legalName:    '[RAZÓN SOCIAL PENDIENTE]',

  // Nombre comercial / marca
  tradeName:    'Le Siuuluette',

  // Símbolo de marca registrada
  registeredMark: 'Le Siuuluette®',

  // NIF / CIF
  taxId:        '[NIF PENDIENTE]',

  // Domicilio fiscal completo
  addressLine1: '[DIRECCIÓN PENDIENTE]',
  postalCode:   '[CP]',
  city:         '[CIUDAD PENDIENTE]',
  province:     '[PROVINCIA PENDIENTE]',
  country:      'España',

  // Contacto
  email:        '[EMAIL PENDIENTE]',
  phone:        '',

  // URL del sitio (cuando esté en producción será p.ej. https://siuuluette.com)
  websiteUrl:   'https://www.siuuluette.com',

  // Inscripción Registro Mercantil (sólo si es sociedad)
  registryInfo: '',

  // Datos de protección de datos
  dpoEmail:     '[EMAIL DPO PENDIENTE]', // Email del responsable de protección de datos

  // Tipo de IVA
  vatRate:      21,

  // Año de fundación (para textos del tipo "Desde 2025")
  foundingYear: 2025,
}

/**
 * Devuelve la dirección postal formateada en una sola línea.
 * Útil para textos legales tipo "el responsable, con domicilio en..."
 */
export function getFormattedAddress() {
  return `${COMPANY.addressLine1}, ${COMPANY.postalCode} ${COMPANY.city}, ${COMPANY.province}, ${COMPANY.country}`
}
