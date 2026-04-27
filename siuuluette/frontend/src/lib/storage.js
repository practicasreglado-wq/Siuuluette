/* ============================================
   SIUULUETTE — Supabase Storage Helper
   Genera URLs públicas para imágenes alojadas
   en Supabase Storage.
   ============================================ */

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL
const DEFAULT_BUCKET  = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'products'

/**
 * Devuelve la URL pública de un archivo en Supabase Storage.
 *
 * @param {string} path   - Ruta del archivo dentro del bucket (e.g. 'img/sud_negra1.png')
 * @param {string} bucket - Nombre del bucket (opcional, usa VITE_SUPABASE_STORAGE_BUCKET por defecto)
 * @returns {string}      - URL pública completa
 *
 * @example
 * storageUrl('img/sud_negra1.png')
 * // → https://yiuigqnbwhaahmmlhhls.supabase.co/storage/v1/object/public/products/img/sud_negra1.png
 */
export function storageUrl(path, bucket = DEFAULT_BUCKET) {
  if (!SUPABASE_URL) {
    console.warn('[storage] VITE_SUPABASE_URL no definida en .env')
    return `/${path}` // fallback a ruta local
  }
  // Limpiamos barras dobles por si acaso
  const cleanPath = path.replace(/^\/+/, '')
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`
}
