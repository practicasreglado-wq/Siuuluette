import { supabase } from '../db/supabase.js'

export default async function authRoutes(fastify) {

  // POST /api/auth/register — Registro de nuevo usuario
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'username'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          username: { type: 'string', minLength: 3 },
          phone: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, username, phone } = request.body

    // 1. Registrar en Supabase Auth con METADATOS
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          phone: phone || ''
        }
      }
    })

    if (authError) {
      console.error('Error en SignUp:', authError)
      return reply.status(400).send({ error: authError.message })
    }

    // Ya no hacemos el insert manual aquí, lo hará Supabase solo.
    console.log('Usuario creado en Auth con metadatos')

    // Generar token si el usuario ya está activo (sin confirmar email)
    let token = null
    if (authData.session) {
      token = fastify.jwt.sign({ 
        id: authData.user.id, 
        email: authData.user.email,
        username: username 
      })
    }

    return { 
      message: 'Usuario registrado.',
      user: { ...authData.user, username },
      token: token
    }

    return { 
      message: 'Usuario registrado correctamente.',
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

    // 2. Buscar el nombre de usuario en profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single()

    // 3. Generar Token JWT
    const token = fastify.jwt.sign({ 
      id: data.user.id, 
      email: data.user.email,
      username: profile?.username 
    })

    return { 
      user: { ...data.user, username: profile?.username }, 
      token 
    }
  })

  // GET /api/auth/me — Obtener mi perfil (Protegida)
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, phone')
      .eq('id', userId)
      .single()

    return { 
      user: { ...request.user, username: profile?.username },
      profile: profile || null
    }
  })
}
