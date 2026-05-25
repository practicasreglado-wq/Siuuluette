// --- CONFIGURACIÓN DE SUPABASE ---
// Inicializa la conexión con la base de datos y los servicios de autenticación
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Aseguramos que las variables de entorno se carguen antes de inicializar
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

// Fail-fast: sin credenciales el backend no puede funcionar. Abortamos el
// arranque de inmediato en vez de continuar con un cliente roto que
// fallaria de forma confusa en cada peticion.
if (!supabaseUrl || !supabaseKey) {
  console.error('[supabase] CRITICAL: faltan SUPABASE_URL o la clave de Supabase. El backend no puede arrancar.')
  process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseKey)
