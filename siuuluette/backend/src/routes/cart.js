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
        size,
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
          quantity: { type: 'number' },
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
      return { message: 'Invitado', isGuest: true }
    }

    const { product_id, quantity, size } = request.body

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size)
      .maybeSingle()

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
          quantity,
          size,
          created_at: new Date()
        }])

      if (error) return reply.status(400).send({ error: error.message })
    }

    return { message: 'Carrito actualizado' }
  })

  // POST /api/cart/merge — Sincronizar carrito de invitado
  fastify.post('/merge', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { items } = request.body // Array de { product_id, quantity, size }

    for (const item of items) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.product_id)
        .eq('size', item.size || 'M')
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
            quantity: item.quantity,
            size: item.size || 'M',
            created_at: new Date()
          }])
      }
    }

    return { message: 'Carrito sincronizado' }
  })

  // POST /api/cart/remove — Eliminar un ítem del carrito
  fastify.post('/remove', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { product_id, size } = request.body

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size || 'M')

    if (error) {
      return reply.status(400).send({ error: error.message })
    }

    return { message: 'Producto eliminado del carrito' }
  })
}
