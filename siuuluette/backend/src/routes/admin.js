import { supabase } from '../db/supabase.js'

export default async function adminRoutes(fastify) {
  
  // Middleware para verificar que el usuario es admin
  fastify.addHook('onRequest', fastify.authenticateAdmin)

  // GET /api/admin/orders — Listar todos los pedidos de la tienda
  fastify.get('/orders', async (request, reply) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            variant:product_variants (
              id, color_name,
              product:products (name)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { orders }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Error al obtener los pedidos' })
    }
  })

  // PATCH /api/admin/orders/:id — Actualizar estado del pedido (paid, shipped, delivered, cancelled)
  fastify.patch('/orders/:id', async (request, reply) => {
    const { id } = request.params
    const { status } = request.body

    const validStatuses = ['paid', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ error: 'Estado no válido' })
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { message: 'Estado actualizado', order: data }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Error al actualizar el pedido' })
    }
  })
}
