// backend/src/routes/favorites.js
import { supabase } from '../db/supabase.js'

export default async function favoritesRoutes(fastify) {

  // GET /api/favorites — Lista de favoritos del usuario logueado
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    // 1. Obtener IDs de favoritos
    const { data: favs, error: favError } = await supabase
      .from('favorites')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (favError) return reply.status(500).send({ error: favError.message })
    if (!favs || favs.length === 0) return { favorites: [] }

    // 2. Obtener datos de productos (manual join)
    const productIds = favs.map(f => f.product_id)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select(`
        id, name, slug, price_gross, collection, category,
        variants:product_variants (
          id,
          images:product_images (url)
        )
      `)
      .in('id', productIds)

    if (prodError) return reply.status(500).send({ error: prodError.message })

    // 3. Enriquecer
    const enrichedFavs = favs.map(f => ({
      ...f,
      products: products.find(p => p.id === f.product_id) || null
    }))

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
