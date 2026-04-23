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

    return { products }
  })

  // GET /api/products/:id — un producto específico (consulta real)
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
      .maybeSingle()

    if (error) {
      return reply.status(500).send({ error: error.message })
    }

    if (!product) {
      return reply.status(404).send({ error: 'Producto no encontrado' })
    }

    return { product }
  })

  // GET /api/products/slug/:slug — un producto por su slug (URL pública)
  fastify.get('/slug/:slug', {
    schema: {
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string', minLength: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const { slug } = request.params

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return reply.status(500).send({ error: error.message })
    }

    if (!product) {
      return reply.status(404).send({ error: 'Producto no encontrado' })
    }

    return { product }
  })

  // GET /api/products/:id/variants — variantes de color (misma colección + misma categoría)
  fastify.get('/:id/variants', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    // 1) Buscar la colección y categoría del producto base
    const { data: base, error: baseErr } = await supabase
      .from('products')
      .select('collection, category')
      .eq('id', id)
      .maybeSingle()

    if (baseErr) return reply.status(500).send({ error: baseErr.message })
    if (!base)   return reply.status(404).send({ error: 'Producto no encontrado' })

    // 2) Devolver todos los productos con misma collection + category (incluyendo el actual)
    //    para que el frontend pueda marcar cuál está seleccionado.
    const { data: variants, error } = await supabase
      .from('products')
      .select('id, name, slug, color, image_url')
      .eq('collection', base.collection)
      .eq('category', base.category)
      .order('id')

    if (error) return reply.status(500).send({ error: error.message })

    return { variants: variants || [] }
  })

  // GET /api/products/:id/related — productos relacionados (misma colección)
  fastify.get('/:id/related', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    // 1) Buscar la colección del producto base
    const { data: base, error: baseErr } = await supabase
      .from('products')
      .select('collection')
      .eq('id', id)
      .maybeSingle()

    if (baseErr) return reply.status(500).send({ error: baseErr.message })
    if (!base)   return reply.status(404).send({ error: 'Producto no encontrado' })

    // 2) Devolver hasta 4 productos de la misma colección, excluyendo el actual
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('collection', base.collection)
      .neq('id', id)
      .limit(4)

    if (error) return reply.status(500).send({ error: error.message })

    return { products: products || [] }
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
