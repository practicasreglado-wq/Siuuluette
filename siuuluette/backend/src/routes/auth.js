import { supabase } from '../db/supabase.js'

export default async function authRoutes(fastify) {

  // POST /api/auth/register — Registro de nuevo usuario
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          phone: { type: 'string' } // Opcional
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, phone } = request.body

    // 1. Registrar en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return reply.status(400).send({ error: authError.message })
    }

    // 2. Si hay teléfono, creamos el perfil en nuestra tabla public.profiles
    // Nota: El id de la tabla profiles debe coincidir con authData.user.id
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, phone: phone || null }])

      if (profileError) {
        // Logueamos el error pero el usuario ya está creado en Auth
        fastify.log.error('Error creando perfil:', profileError)
      }
    }

    return { 
      message: 'Usuario registrado. Revisa tu email para confirmar la cuenta si la confirmación está activada.',
      user: authData.user 
    }
  })

  // POST /api/auth/login — Inicio de sesión
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body

    // 1. Verificar credenciales con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return reply.status(401).send({ error: 'Credenciales inválidas o email no confirmado' })
    }

    // 2. Generar nuestro propio Token JWT para la sesión en el frontend
    const token = fastify.jwt.sign({ 
      id: data.user.id, 
      email: data.user.email 
    })

    return { 
      user: data.user, 
      token 
    }
  })

  // GET /api/auth/me — Obtener mi perfil (Protegida)
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    // El decorador authenticate añade los datos del token a request.user
    const userId = request.user.id

    // Buscamos datos extra en la tabla profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .single()

    return { 
      user: request.user,
      profile: profile || null
    }
  })
}
