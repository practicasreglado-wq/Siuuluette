import { supabase } from '../db/supabase.js'

export default async function authRoutes(fastify) {

  // --- REGISTRO DE USUARIOS ---
  // Crea una nueva cuenta en Supabase Auth y genera el perfil inicial
  fastify.post('/register', {
    config: { 
      rateLimit: { max: 5, timeWindow: '1 minute' } 
    },
    onRequest: [fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'username'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
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

    // 2. Set Cookie if token generated
    if (token) {
      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: true, // Requerido para SameSite=None
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 // 30 días
      })
    }
    
    return { 
      message: 'Usuario registrado.',
      user: { ...authData.user, username, phone: phone || '', shipping_address: null }
    }
  })

  // --- INICIO DE SESIÓN ---
  // Verifica credenciales y devuelve una cookie HttpOnly con el token JWT
  fastify.post('/login', {
    config: { 
      rateLimit: { max: 5, timeWindow: '1 minute' } 
    },
    onRequest: [fastify.csrfProtection],
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
        role: 'user'
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
      role: profile?.role || 'user'
    })

    // 4. Set Cookie
    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })

    return { 
      user: { ...data.user, ...profile, username: userUsername }
    }
  })

  // --- SESIÓN ACTUAL (ME) ---
  // Devuelve los datos del usuario logueado basándose en el token de la sesión
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

  // --- ACTUALIZAR PERFIL ---
  // Permite al usuario cambiar su nombre, teléfono o dirección
  fastify.patch('/profile', {
    onRequest: [fastify.authenticate, fastify.csrfProtection]
  }, async (request, reply) => {
    const userId = request.user.id
    const { username, phone, shipping_address } = request.body
    
    // Construir objeto de actualización dinámicamente (solo campos permitidos)
    const updates = { id: userId }
    if (username !== undefined) updates.username = username
    if (phone !== undefined) updates.phone = phone
    if (shipping_address !== undefined) updates.shipping_address = shipping_address
    // NOTA: El campo 'role' NO se permite actualizar desde aquí por seguridad.

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

  // --- RECUPERACIÓN DE CONTRASEÑA ---
  // Envía un email con un enlace para restablecer la contraseña
  fastify.post('/recover', {
    config: { 
      rateLimit: { max: 3, timeWindow: '1 minute' } 
    },
    onRequest: [fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } }
      }
    }
  }, async (request, reply) => {
    const { email } = request.body
    const redirectTo = `${request.headers.origin}/reset-password`
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    
    if (error) return reply.status(400).send({ error: error.message })
    return { message: 'Correo de recuperación enviado' }
  })

  // --- ESTABLECER NUEVA CONTRASEÑA ---
  // Actualiza la contraseña usando el token recibido por email o la sesión activa
  fastify.post('/update-password', {
    onRequest: [fastify.csrfProtection, async (request, reply) => {
      // 1. Intentar verificar con el JWT interno del backend
      try {
        await request.jwtVerify()
      } catch (err) {
        // 2. Si falla, podría ser un token de recuperación de Supabase
        const authHeader = request.headers.authorization
        const token = authHeader ? authHeader.split(' ')[1] : request.cookies.token
        
        if (!token) {
          return reply.status(401).send({ error: 'No autorizado' })
        }

        // Validar el token directamente con Supabase (vía Service Role Key)
        const { data, error } = await supabase.auth.getUser(token)
        
        if (error || !data.user) {
          console.error('Error validando token de Supabase:', error)
          return reply.status(401).send({ error: 'No autorizado o token de recuperación expirado' })
        }

        // Inyectar el usuario en el request para que el handler lo use
        request.user = data.user
      }
    }],
    schema: {
      body: {
        type: 'object',
        required: ['password'],
        properties: { password: { type: 'string', minLength: 8 } }
      }
    }
  }, async (request, reply) => {
    const { password } = request.body
    const userId = request.user.id
    
    // Al usar la Service Role Key, debemos usar la API de admin para actualizar por ID
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: password
    })
    
    if (error) return reply.status(400).send({ error: error.message })
    return { message: 'Contraseña actualizada con éxito' }
  })

  // --- CERRAR SESIÓN ---
  // Borra la cookie del token para finalizar la sesión
  fastify.post('/logout', {
    onRequest: [fastify.csrfProtection]
  }, async (request, reply) => {
    reply.clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    return { message: 'Sesión cerrada' }
  })

  // --- PROTECCIÓN CSRF ---
  // Genera un token de seguridad para validar peticiones desde el frontend
  fastify.get('/csrf', async (request, reply) => {
    const token = await reply.generateCsrf()
    return { csrfToken: token }
  })
}
