// backend/src/server.js
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import csrf from '@fastify/csrf-protection'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    }
  }
})

const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].filter(Boolean))

// 1. Plugins Globales
await fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.has(origin)) {
      cb(null, true)
      return
    }

    cb(new Error(`Origin ${origin} not allowed by CORS`), false)
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false
  }
})

await fastify.register(cookie)
await fastify.register(csrf, {
  cookieOpts: { 
    path: '/',
    httpOnly: false, // Permitimos lectura por JS para enviarlo en cabecera
    secure: true,
    sameSite: 'none'
  }
})

// 1.5 Security: Helmet & Rate Limit
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://*.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
})

await fastify.register(rateLimit, {
  max: 1000,
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => ({
    error: 'Demasiadas peticiones',
    message: `Has superado el límite de ${context.max} peticiones por minuto. Inténtalo más tarde.`
  })
})

// 2. Swagger Specification 
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

// 4. Decorators
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'No autorizado' })
  }
})

fastify.decorate('authenticateAdmin', async (request, reply) => {
  try {
    const user = await request.jwtVerify()
    if (user.role !== 'admin') {
      reply.status(403).send({ error: 'Acceso restringido: Se requiere rol de administrador' })
    }
  } catch (err) {
    reply.status(401).send({ error: 'No autorizado' })
  }
})

// 5. Routes
await fastify.register(import('./routes/products.js'),    { prefix: '/api/products' })
await fastify.register(import('./routes/collections.js'), { prefix: '/api/collections' })
await fastify.register(import('./routes/drops.js'),    { prefix: '/api/drops' })
await fastify.register(import('./routes/auth.js'),     { prefix: '/api/auth' })
await fastify.register(import('./routes/cart.js'),      { prefix: '/api/cart' })
await fastify.register(import('./routes/favorites.js'), { prefix: '/api/favorites' })
await fastify.register(import('./routes/checkout.js'),  { prefix: '/api/checkout' })
await fastify.register(import('./routes/admin.js'),     { prefix: '/api/admin' })

fastify.get('/', async (request, reply) => {
  reply.type('text/html').send('<h1>Siuuluette API is running</h1><p>Documentation at <a href="/documentation/">/documentation/</a></p>')
})

// 6. Start
const start = async () => {
  try {
    await fastify.ready()
    await fastify.listen({ port: process.env.PORT || 3000, host: '::' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start();
