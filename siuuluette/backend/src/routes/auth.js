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

    // Generar token si el usuario ya está activo (sin confirmar email)
    let token = null
    if (authData.session) {
      token = fastify.jwt.sign({ 
        id: authData.user.id, 
        email: authData.user.email,
        username: username,
        role: 'user' // Por defecto al registrarse
      })
    }

    return { 
      message: 'Usuario registrado.',
      user: { ...authData.user, username, phone: phone || '', shipping_address: null },
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

    // 2. Buscar el perfil. Si no existe, lo creamos (Lazy creation)
    let { data: profile } = await supabase
      .from('profiles')
      .select('username, role, phone, shipping_address')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile) {
      const newProfile = {
        id: data.user.id,
        username: data.user.user_metadata?.username || email.split('@')[0],
        role: 'admin'
      }
      const { data: created } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()
      
      profile = created
    }

    // 3. Generar Token JWT
    const userUsername = profile?.username || data.user.user_metadata?.username || data.user.email.split('@')[0]

    const token = fastify.jwt.sign({ 
      id: data.user.id, 
      email: data.user.email,
      username: userUsername,
      role: profile?.role || 'admin'
    })

    return { 
      user: { ...data.user, ...profile, username: userUsername }, 
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
      .select('username, phone, shipping_address, role')
      .eq('id', userId)
      .single()

    const userUsername = profile?.username || request.user.user_metadata?.username || request.user.email?.split('@')[0] || 'Usuario'

    return { 
      user: { ...request.user, username: userUsername },
      profile: profile || null
    }
  })

  // PATCH /api/auth/profile — Actualizar perfil (username, phone, address)
  fastify.patch('/profile', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { username, phone, shipping_address } = request.body
    
    // Construir objeto de actualización dinámicamente
    const updates = { id: userId }
    if (username !== undefined) updates.username = username
    if (phone !== undefined) updates.phone = phone
    if (shipping_address !== undefined) updates.shipping_address = shipping_address

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return reply.status(400).send({ error: error.message })
    }

    return { message: 'Perfil actualizado', profile: data }
  })
}
