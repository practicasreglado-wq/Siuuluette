import { supabase } from '../db/supabase.js'

/* ============================================================
   SIUULUETTE — Collections Routes
   Devuelve las colecciones con su imagen y count real de productos.
   ============================================================ */

export default async function collectionsRoutes(fastify) {

  // GET /api/collections — todas las colecciones activas con count de productos
  fastify.get('/', async (request, reply) => {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        id,
        name,
        image_url,
        sort_order
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      request.log.error({ err: error }, 'Error listando colecciones')
      return reply.status(500).send({ error: error.message })
    }

    // Calculamos el count real de productos por colección
    const { data: counts, error: countError } = await supabase
      .from('products')
      .select('collection')
      .eq('is_active', true)

    if (countError) {
      request.log.error({ err: countError }, 'Error contando productos')
      return reply.status(500).send({ error: countError.message })
    }

    // Agrupamos los counts por colección
    const countMap = (counts || []).reduce((acc, p) => {
      acc[p.collection] = (acc[p.collection] || 0) + 1
      return acc
    }, {})

    const collections = (data || []).map(c => ({
      id:         c.id,
      name:       c.name,
      image_url:  c.image_url,
      sort_order: c.sort_order,
      count:      countMap[c.name] || 0,
    }))

    return { collections }
  })
}
