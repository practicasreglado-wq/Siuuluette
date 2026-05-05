import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Aseguramos que las variables de entorno se carguen antes de inicializar
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase URL o Key no encontradas!')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
