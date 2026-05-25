// backend/src/server.js
import './env.js'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import csrf from '@fastify/csrf-protection'
import fastifyStatic from '@fastify/static' // Servir el build del frontend en producción
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { supabase } from './db/supabase.js' // Para verificar el rol admin contra la DB

// --- CONFIGURACIÓN INICIAL DEL SERVIDOR ---

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Detección del entorno: cambia el comportamiento de CORS, logger y
// servido de estáticos. NODE_ENV debe estar a 'production' en el servidor
// real y a 'development' (o sin definir) en local.
const isProd = process.env.NODE_ENV === 'production'

// Inicialización de Fastify con logger integrado.
//   - En desarrollo usamos pino-pretty (logs coloreados, legibles a ojo).
//   - En producción usamos el logger por defecto (JSON plano), que es más
//     rápido y compatible con cualquier agregador externo (Hostinger logs,
//     Datadog, etc.).
const fastify = Fastify({
  logger: isProd
    ? true
    : { transport: { target: 'pino-pretty' } }
})

// Middleware especial para manejar Webhooks de Stripe (evita que el parseo JSON rompa la firma)
fastify.addContentTypeParser(
  'application/json',
  { parseAs: 'buffer' },
  (req, body, done) => {
    try {
      // Para el webhook de Stripe queremos el buffer crudo
      if (req.routeOptions?.url === '/api/checkout/webhook' || req.url === '/api/checkout/webhook') {
        req.rawBody = body
        done(null, body) // pasamos el buffer tal cual; el handler lo interpreta
        return
      }
      // Resto de rutas: parseo JSON normal
      const json = body.length ? JSON.parse(body.toString('utf8')) : {}
      done(null, json)
    } catch (err) {
      err.statusCode = 400
      done(err, undefined)
    }
  }
)

// Whitelist de orígenes permitidos por CORS.
//   - En producción solo aceptamos el dominio definido en FRONTEND_URL
//     (típicamente https://lesiuuluette.com).
//   - En desarrollo añadimos los puertos de Vite (5173/5174 = dev server,
//     4173 = preview) para que el frontend local pueda llamar al backend
//     sin que CORS lo bloquee.
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  ...(!isProd ? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ] : [])
].filter(Boolean))

// --- REGISTRO DE PLUGINS Y SEGURIDAD ---

// Configuración de CORS (Control de Acceso entre Orígenes).
//
// IMPORTANTE: aceptamos también peticiones SIN header Origin. Esto es
// necesario porque en producción el frontend y el backend están en el
// mismo dominio (same-origin) y los navegadores no siempre envían Origin
// para peticiones same-origin. Si bloqueáramos las no-origin, la app
// dejaría de funcionar entera en producción.
//
// La protección real contra ataques cross-site no la da CORS sino los
// tokens CSRF (registrados más abajo), que un sitio malicioso no puede
// obtener al estar en otro origen.
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Permite same-origin (sin Origin) o cualquier origen en la whitelist
    if (!origin || allowedOrigins.has(origin)) {
      cb(null, true)
      return
    }
    cb(new Error(`Origin ${origin} not allowed by CORS`), false)
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

// Autenticación basada en JSON Web Tokens (JWT)
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false
  }
})

// Manejo de Cookies y protección CSRF (evita ataques de suplantación)
await fastify.register(cookie)
await fastify.register(csrf, {
  cookieOpts: { 
    path: '/',
    httpOnly: false, // Permitimos lectura por JS para enviarlo en cabecera
    secure: true,
    sameSite: 'none'
  }
})

// Helmet (cabeceras de seguridad) y Rate Limit (evita saturación por exceso de peticiones)
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"], // [SEGURIDAD] Eliminado 'unsafe-inline'
      frameSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://*.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
})

await fastify.register(rateLimit, {
  max: 1000, // Restaurado temporalmente para evitar bloqueos de OPTIONS preflight en el panel admin
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => ({
    error: 'Demasiadas peticiones',
    message: `Has superado el límite de ${context.max} peticiones por minuto. Inténtalo más tarde.`
  })
})

// --- DOCUMENTACIÓN API (SWAGGER) ---
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Siuuluette API',
      description: 'API Documentation for Siuuluette Boutique',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

// 3. Swagger UI (Configurado para evitar 404s en Fastify v5)
await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  staticCSP: false,
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  exposeRoute: true
})

// --- DECORADORES (MIDDLEWARES DE AUTENTICACIÓN) ---

// Verifica que el usuario esté logueado.
//
// IMPORTANTE: cuando la verificación falla hay que hacer `return reply...`.
// En un hook `async` de Fastify, enviar la respuesta SIN retornarla NO
// detiene la petición: el handler de la ruta se ejecutaría igualmente.
// Sin el `return`, una petición sin token válido seguiría adelante.
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ error: 'No autorizado' })
  }
})

// Verifica que el usuario sea administrador.
//
// El rol se comprueba SIEMPRE contra la base de datos (tabla `profiles`),
// nunca contra el rol que viaja dentro del JWT. Motivo: si se revoca el
// rol admin de una cuenta en la base de datos, debe perder el acceso al
// panel de inmediato, aunque conserve un token antiguo que aún diga
// "admin". Es una verificación en cada petición de admin (volumen bajo,
// coste asumible) a cambio de seguridad real y sincronizada con la DB.
//
// Igual que arriba: cada rechazo lleva `return` para cortar la petición.
fastify.decorate('authenticateAdmin', async (request, reply) => {
  // 1. El token debe ser válido (usuario autenticado).
  let payload
  try {
    payload = await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ error: 'No autorizado' })
  }

  // 2. El rol real se lee de la tabla profiles, no del JWT.
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', payload.id)
      .single()

    if (error || !profile || profile.role !== 'admin') {
      return reply.status(403).send({
        error: 'Acceso restringido: se requiere rol de administrador'
      })
    }
  } catch (err) {
    request.log.error({ err }, '[authenticateAdmin] Error verificando el rol')
    return reply.status(500).send({ error: 'Error verificando permisos' })
  }
})

// --- REGISTRO DE RUTAS DEL SISTEMA ---
//
// Todas las rutas de la API cuelgan del prefijo /api/* para que no
// colisionen con las rutas del frontend SPA, que viven en la raíz /.
await fastify.register(import('./routes/products.js'),    { prefix: '/api/products' })
await fastify.register(import('./routes/collections.js'), { prefix: '/api/collections' })
await fastify.register(import('./routes/drops.js'),    { prefix: '/api/drops' })
await fastify.register(import('./routes/auth.js'),     { prefix: '/api/auth' })
await fastify.register(import('./routes/cart.js'),      { prefix: '/api/cart' })
await fastify.register(import('./routes/favorites.js'), { prefix: '/api/favorites' })
await fastify.register(import('./routes/checkout.js'),  { prefix: '/api/checkout' })
await fastify.register(import('./routes/admin.js'),     { prefix: '/api/admin' })

// --- SERVIR EL FRONTEND VUE (BUILD ESTÁTICO) ---
//
// En producción, este mismo servidor Fastify sirve también los archivos
// estáticos del frontend (el resultado de `npm run build` del proyecto Vue).
// Así no hace falta desplegar el frontend aparte: una sola URL, un solo
// proceso Node, mucho más simple de mantener.
//
// El path por defecto asume la estructura del repo: si server.js está en
// siuuluette/backend/src/, entonces "../../frontend/dist" resuelve a
// siuuluette/frontend/dist (donde Vite deja el build).
//
// Para hostings que cambien la estructura de carpetas en el despliegue,
// se puede sobreescribir con la variable de entorno FRONTEND_DIST_PATH
// (ruta absoluta al dist) sin tocar este código.
const FRONTEND_DIST = process.env.FRONTEND_DIST_PATH
  || path.join(__dirname, '../../frontend/dist')

if (fs.existsSync(FRONTEND_DIST)) {
  await fastify.register(fastifyStatic, {
    root: FRONTEND_DIST,
    prefix: '/',
    // wildcard: false evita que el plugin intercepte rutas que no son
    // archivos (las dejamos pasar al notFoundHandler de abajo para que
    // gestione el fallback SPA correctamente).
    wildcard: false,
  })

  // Fallback para rutas no encontradas:
  //   - Si la ruta empieza por /api/*, es una llamada a la API que no
  //     existe → devolvemos 404 JSON estándar.
  //   - Cualquier otra ruta (/producto/:slug, /admin, /carrito, etc.) es
  //     una ruta gestionada por Vue Router en cliente → devolvemos el
  //     index.html del build y dejamos que Vue resuelva la ruta en el
  //     navegador. Esto es lo que hace que un refresh en una página
  //     profunda no devuelva 404.
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.status(404).send({ error: 'Endpoint no encontrado' })
    } else {
      reply.sendFile('index.html')
    }
  })
} else {
  fastify.log.warn(`[Static] Carpeta de frontend no encontrada en ${FRONTEND_DIST}. Se servirá sólo la API. Asegúrate de ejecutar 'npm run build:all'.`)
}

// --- ARRANQUE DEL SERVIDOR ---
//
// host: '0.0.0.0' = escucha en todas las interfaces IPv4. Necesario
// para que funcione correctamente detrás de un proxy
// inverso en producción (Hostinger, Nginx, etc.).
const start = async () => {
  try {
    await fastify.ready()
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start();
