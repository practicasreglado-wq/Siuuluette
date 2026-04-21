import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
// Usamos la Service Role Key en el backend para bypass de RLS y tareas administrativas
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase URL o Key no encontradas en el .env!')
} else {
  console.log('✅ Supabase Conectado')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
