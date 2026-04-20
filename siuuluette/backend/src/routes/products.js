// backend/src/routes/products.js
export default async function productsRoutes(fastify) {

  // GET /api/products — listar todos
  fastify.get('/', async (request, reply) => {
    // Aquí irá tu consulta a Supabase
    // Por ahora devuelve mock data
    return {
      products: [
        { id: 1, name: 'Hoodie Siuuluette OG', price: 185, stock: 47 },
        { id: 2, name: 'Camiseta Victory Core', price: 89, stock: 120 },
      ]
    }
  })

  // GET /api/products/:id — un producto específico
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }   // Fastify valida y convierte el tipo
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    // TODO: consulta real a Supabase
    return { id, name: 'Hoodie Siuuluette OG', price: 185 }
  })

  // POST /api/products — crear (solo admin, requiere JWT)
  fastify.post('/', {
    onRequest: [fastify.authenticate],   // protegido con JWT
    schema: {
      body: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name:  { type: 'string', minLength: 2 },
          price: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
        }
      }
    }
  }, async (request, reply) => {
    const { name, price, stock } = request.body
    // TODO: insertar en Supabase
    reply.status(201).send({ id: 99, name, price, stock })
  })
}
