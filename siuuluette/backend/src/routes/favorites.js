// backend/src/routes/favorites.js
import { supabase } from '../db/supabase.js'

export default async function favoritesRoutes(fastify) {

  // GET /api/favorites — Lista de favoritos del usuario logueado (con datos del producto)
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        product_id,
        created_at,
        products (
          id, name, slug, price, image_url, image_secondary_url, collection, category, color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return reply.status(500).send({ error: error.message })
    }

    return { favorites: data || [] }
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
      // 23505 = unique_violation. El usuario ya tenía el producto en favoritos.
      // No es un error real, devolvemos OK con flag.
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
