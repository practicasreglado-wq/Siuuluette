import { supabase } from '../db/supabase.js'

export default async function cartRoutes(fastify) {
  // GET /api/cart — Listar productos del carrito (solo logueados)
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        size,
        product_id,
        products (
          name,
          price,
          image_url,
          collection
        )
      `)
      .eq('user_id', userId)

    if (error) {
      return reply.status(500).send({ error: error.message })
    }

    return { cart: cartItems }
  })

  // POST /api/cart/add — Añadir un producto al carrito
  fastify.post('/add', {
    schema: {
      body: {
        type: 'object',
        required: ['product_id'],
        properties: {
          product_id: { type: ['number', 'string'] },
          quantity: { type: 'number', minimum: 1, default: 1 },
          size: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    let userId = null

    try {
      const decoded = await request.jwtVerify()
      userId = decoded.id
    } catch (err) {
      return {
        message: 'Añadido como invitado (Local)',
        isGuest: true
      }
    }

    const { product_id, quantity = 1, size } = request.body

    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size)
      .maybeSingle()

    if (existingError) {
      return reply.status(400).send({ error: existingError.message })
    }

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)

      if (error) {
        return reply.status(400).send({ error: error.message })
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: userId,
          product_id,
          quantity,
          size
        }])

      if (error) {
        return reply.status(400).send({ error: error.message })
      }
    }

    return { message: 'Carrito actualizado' }
  })

  // POST /api/cart/merge — Sincronizar carrito de invitado
  fastify.post('/merge', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['product_id', 'quantity'],
              properties: {
                product_id: { type: ['number', 'string'] },
                quantity: { type: 'number', minimum: 1 },
                size: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { items } = request.body

    for (const item of items) {
      const { data: existing, error: existingError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.product_id)
        .eq('size', item.size || 'M') // Fallback a M si no hay talla
        .maybeSingle()

      if (existingError) {
        console.error('Error buscando item existente:', existingError)
        return reply.status(400).send({ error: existingError.message })
      }

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)

        if (error) {
          console.error('Error actualizando cantidad:', error)
          return reply.status(400).send({ error: error.message })
        }
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: userId,
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size || 'M'
          }])

        if (error) {
          console.error('Error insertando nuevo item:', error)
          return reply.status(400).send({ error: error.message })
        }
      }
    }

    return { message: 'Carrito sincronizado' }
  })

  // POST /api/cart/remove — Eliminar un ítem del carrito
  fastify.post('/remove', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['product_id'],
        properties: {
          product_id: { type: ['number', 'string'] },
          size: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { product_id, size } = request.body

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size)

    if (error) {
      return reply.status(400).send({ error: error.message })
    }

    return { message: 'Producto eliminado del carrito' }
  })

  // POST /api/cart/update — Actualizar cantidad exacta de un ítem
  fastify.post('/update', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['product_id', 'quantity'],
        properties: {
          product_id: { type: ['number', 'string'] },
          quantity: { type: 'number', minimum: 1 },
          size: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { product_id, quantity, size } = request.body

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size || 'M')

    if (error) {
      return reply.status(400).send({ error: error.message })
    }

    return { message: 'Cantidad actualizada' }
  })

  // DELETE /api/cart/:id — Eliminar por ID de fila (Más preciso)
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { id } = request.params

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) return reply.status(400).send({ error: error.message })
    return { message: 'Item eliminado' }
  })

  // PATCH /api/cart/:id — Actualizar cantidad por ID de fila
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'number', minimum: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { id } = request.params
    const { quantity } = request.body

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) return reply.status(400).send({ error: error.message })
    return { message: 'Cantidad actualizada' }
  })

  // DELETE /api/cart — Vaciar carrito completo
  fastify.delete('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) return reply.status(400).send({ error: error.message })
    return { message: 'Carrito vaciado' }
  })
}
