// backend/src/routes/favorites.js
import { supabase } from '../db/supabase.js'

export default async function favoritesRoutes(fastify) {

  // GET /api/favorites — Lista de favoritos (ahora basados en variantes/colores)
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    // 1. Obtener IDs de favoritos (que ahora son variant_ids)
    const { data: favs, error: favError } = await supabase
      .from('favorites')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (favError) return reply.status(500).send({ error: favError.message })
    if (!favs || favs.length === 0) return { favorites: [] }

    // 2. Obtener datos de las variantes específicas (incluyendo precios)
    const variantIds = favs.map(f => f.product_id)
    const { data: variantData, error: varError } = await supabase
      .from('product_variants')
      .select(`
        id, color_name, color_hex,
        price_net_override, price_gross_override,
        product:products (
          id, name, slug, collection, category, 
          price_net, price_gross, discount_percent
        ),
        images:product_images (url)
      `)
      .in('id', variantIds)

    if (varError) return reply.status(500).send({ error: varError.message })

    // 3. Reconstruir para el frontend (calculando precios reales)
    const enrichedFavs = favs.map(f => {
      const v = variantData.find(vd => vd.id === f.product_id)
      if (!v) return null
      
      const p = v.product || {}
      // Lógica de precio: prioridad a la variante, luego al padre
      const priceGross = v.price_gross_override ?? p.price_gross ?? 0

      return {
        ...f,
        variant: v,
        products: {
          ...p,
          price_gross: priceGross,
          variants: [v]
        }
      }
    }).filter(Boolean)

    return { favorites: enrichedFavs }
  })

  // POST /api/favorites/:productId — Añadir un producto a favoritos
  fastify.post('/:productId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'integer' }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { productId } = request.params

    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }])

    if (error) {
      if (error.code === '23505') {
        return { message: 'El producto ya estaba en favoritos', alreadyExists: true }
      }
      return reply.status(400).send({ error: error.message })
    }

    return { message: 'Añadido a favoritos' }
  })

  // DELETE /api/favorites/:productId — Quitar un producto de favoritos
  fastify.delete('/:productId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'integer' }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id
    const { productId } = request.params

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      return reply.status(400).send({ error: error.message })
    }

    return { message: 'Quitado de favoritos' }
  })
}
