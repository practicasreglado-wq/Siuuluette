import { supabase } from '../db/supabase.js'

export default async function productsRoutes(fastify) {

  // GET /api/products — listar todos
  fastify.get('/', async (request, reply) => {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
    
    if (error) {
      reply.status(500).send({ error: error.message })
      return
    }

    return { products: products || [] }
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
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ error: 'Producto no encontrado' })

    return product
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
