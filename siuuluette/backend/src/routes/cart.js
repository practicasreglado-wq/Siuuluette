import { supabase } from '../db/supabase.js'

export default async function cartRoutes(fastify) {

  // GET /api/cart — Listar productos del carrito (Solo para logueados)
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
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

  // POST /api/cart/add — Añadir un producto al carrito (Híbrido: Invitado y Logueado)
  fastify.post('/add', {
    schema: {
      body: {
        type: 'object',
        required: ['product_id'],
        properties: {
          product_id: { type: 'number' },
          quantity: { type: 'number', minimum: 1, default: 1 }
        }
      }
    }
  }, async (request, reply) => {
    // Intentamos verificar el token pero NO bloqueamos si falla
    let userId = null
    try {
      const decoded = await request.jwtVerify()
      userId = decoded.id
    } catch (err) {
      // Usuario no logueado (Invitado)
      // No hacemos nada en la DB, el Frontend se encargará de guardar en LocalStorage
      return { 
        message: 'Añadido como invitado (Local)', 
        isGuest: true 
      }
    }

    // Si llegamos aquí, el usuario está logueado
    const { product_id, quantity } = request.body

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)

      if (error) return reply.status(400).send({ error: error.message })
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: userId,
          product_id,
          quantity
        }])

      if (error) return reply.status(400).send({ error: error.message })
    }

    return { message: 'Producto añadido al carrito en base de datos', isGuest: false }
  })

  // POST /api/cart/merge — Sincronizar carrito de invitado a usuario logueado
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
                product_id: { type: 'number' },
                quantity: { type: 'number' }
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
      // Upsert: Si existe suma, si no inserta
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.product_id)
        .single()

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('cart_items')
          .insert([{
            user_id: userId,
            product_id: item.product_id,
            quantity: item.quantity
          }])
      }
    }

    return { message: 'Carrito sincronizado con éxito' }
  })

  // DELETE /api/cart/:id — Eliminar un ítem del carrito
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
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

    return { message: 'Producto eliminado del carrito' }
  })
}
