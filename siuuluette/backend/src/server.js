// backend/src/server.js
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    }
  }
})

// 1. Plugins Globales
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL,
  credentials: true,
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
})

// 2. Swagger Specification (Internal)
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Siuuluette API',
      description: 'API Documentation for Siuuluette Boutique',
      version: '1.0.0'
    }
  }
})

// 3. Decorators
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'No autorizado' })
  }
})

// 4. Routes
await fastify.register(import('./routes/products.js'), { prefix: '/api/products' })
await fastify.register(import('./routes/drops.js'),    { prefix: '/api/drops' })
await fastify.register(import('./routes/auth.js'),     { prefix: '/api/auth' })
await fastify.register(import('./routes/checkout.js'), { prefix: '/api/checkout' })

fastify.get('/', async () => {
  return { status: 'ok', message: 'Siuuluette API is running' }
})

// 5. Swagger UI (Should be registered AFTER routes for some reason in certain setups)
await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  staticCSP: false, // Probemos desactivando esto
})

// 6. Start
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
