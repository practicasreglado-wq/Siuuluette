import { supabase } from '../db/supabase.js'

export default async function cartRoutes(fastify) {
  // --- LISTAR CARRITO ---
  // Obtiene los productos guardados en el carrito del usuario logueado
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    // 1. Obtener los items del carrito básicos
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, quantity, size, product_id')
      .eq('user_id', userId)

    if (cartError) {
      return reply.status(500).send({ error: cartError.message })
    }

    if (!cartItems || cartItems.length === 0) {
      return { cart: [] }
    }

    // 2. Obtener los detalles de las variantes manualmente (bypass de falta de FK)
    const variantIds = cartItems.map(i => i.product_id)
    const { data: variants, error: varError } = await supabase
      .from('product_variants')
      .select(`
        id,
        color_name,
        price_gross_override,
        price_net_override,
        product:products (
          id, name, slug, price_gross, price_net, collection, discount_percent
        ),
        images:product_images (url)
      `)
      .in('id', variantIds)

    if (varError) {
      return reply.status(500).send({ error: varError.message })
    }

    // 3. Combinar los datos
    const enrichedCart = cartItems.map(item => {
      const v = variants.find(dv => dv.id === item.product_id)
      return {
        ...item,
        variant: v || null
      }
    })

    return { cart: enrichedCart }
  })

  // --- AÑADIR AL CARRITO ---
  // Si el usuario está logueado se guarda en la DB, si no, se maneja localmente
  fastify.post('/add', {
    onRequest: [fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['product_id'],
        properties: {
          product_id: { type: 'integer' },
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
    
    // Log de depuración: solo se imprime con nivel 'debug' (no en producción),
    // así no se filtra el user_id en los logs de producción.
    request.log.debug({ userId, product_id, size }, '[CART_ADD] item añadido al carrito')

    const { data: existing, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .eq('size', size)
      .maybeSingle()

    if (existingError) {
      console.error('[CART_ADD] Error buscando existente:', existingError)
      return reply.status(400).send({ error: existingError.message })
    }

    // [STOCK] Validar disponibilidad antes de añadir al carrito.
    //   Busca la variante+talla en variant_stock. En modo 'limited' no
    //   se permite tener en el carrito mas unidades de las que existen
    //   (se cuenta lo que ya hubiera + lo que se añade ahora).
    //   Esto es una validacion de UX; la definitiva se repite en
    //   /checkout/intent y la garantia dura esta en el trigger
    //   trg_decrement_variant_stock de la base de datos.
    const desiredQty = (existing?.quantity || 0) + quantity
    const { data: stockRow, error: stockErr } = await supabase
      .from('variant_stock')
      .select('stock, stock_mode')
      .eq('variant_id', product_id)
      .eq('size', size)
      .maybeSingle()

    if (stockErr) {
      return reply.status(400).send({ error: stockErr.message })
    }
    if (!stockRow) {
      return reply.status(400).send({
        error: 'Esta prenda no esta disponible en la talla seleccionada.'
      })
    }
    // on_demand y preorder se consideran siempre disponibles.
    if (stockRow.stock_mode === 'limited' && (stockRow.stock ?? 0) < desiredQty) {
      return reply.status(400).send({
        error: `Solo quedan ${stockRow.stock ?? 0} unidades de esta talla.`
      })
    }

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)

      if (error) {
        console.error('[CART_ADD] Error actualizando:', error)
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
        console.error('[CART_ADD] Error insertando:', error)
        return reply.status(400).send({ error: error.message })
      }
    }

    return { message: 'Carrito actualizado' }
  })

  // --- SINCRONIZAR CARRITO ---
  // Pasa los productos del carrito local (invitado) a la cuenta del usuario al loguearse
  fastify.post('/merge', {
    onRequest: [fastify.authenticate, fastify.csrfProtection],
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
                product_id: { type: 'integer' },
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
        .eq('size', item.size || 'M')
        .maybeSingle()

      if (existingError) {
        console.error('[CART_MERGE] Error buscando item existente:', existingError)
        return reply.status(400).send({ error: existingError.message })
      }

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)

        if (error) {
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
          console.error('[CART_MERGE] Error insertando nuevo item:', error)
          return reply.status(400).send({ error: error.message })
        }
      }
    }

    return { message: 'Carrito sincronizado' }
  })

  // --- ELIMINAR ÍTEM ---
  // Borra un producto específico del carrito basándose en su ID y talla
  fastify.post('/remove', {
    onRequest: [fastify.authenticate, fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['product_id'],
        properties: {
          product_id: { type: 'integer' },
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

  // --- ACTUALIZAR CANTIDAD ---
  // Cambia el número de unidades de un producto en el carrito
  fastify.post('/update', {
    onRequest: [fastify.authenticate, fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['product_id', 'quantity'],
        properties: {
          product_id: { type: 'integer' },
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
    onRequest: [fastify.authenticate, fastify.csrfProtection],
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
    onRequest: [fastify.authenticate, fastify.csrfProtection],
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

  // --- VACIAR CARRITO ---
  // Elimina todos los productos del carrito del usuario
  fastify.delete('/', {
    onRequest: [fastify.authenticate, fastify.csrfProtection]
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
