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

      // Enriquecer con perfiles de usuario y EMAILS manualmente
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        // 1. Obtener perfiles (username, etc)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)
        
        // 2. Obtener emails desde Supabase Auth (Admin API)
        const { data: authData } = await supabase.auth.admin.listUsers()
        const authUsers = authData?.users || []

        orders.forEach(order => {
          const profile = profiles?.find(p => p.id === order.user_id) || null
          const authUser = authUsers.find(u => u.id === order.user_id)
          
          if (profile || authUser) {
            order.profile = {
              ...(profile || {}),
              email: authUser?.email || null
            }
          } else {
            order.profile = null
          }
        })
      }

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
