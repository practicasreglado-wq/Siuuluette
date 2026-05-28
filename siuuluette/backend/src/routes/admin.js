/**
 * ARCHIVO: routes/admin.js
 * DESCRIPCIÓN: Define las rutas y controladores para el panel de administración.
 * Permite listar pedidos paginados, modificar sus estados fiscales y logísticos (shipped, delivered, etc.) y consultar las reservas/pre-orders activas del sistema. Todas las rutas requieren rol 'admin' verificado contra base de datos.
 */
import { supabase } from '../db/supabase.js'

export default async function adminRoutes(fastify) {
  
  // Middleware para verificar que el usuario es admin (protege todas las rutas de este archivo)
  fastify.addHook('onRequest', fastify.authenticateAdmin)

  // --- LISTAR PEDIDOS ---
  // Obtiene todos los pedidos de la tienda, incluyendo detalles de productos y perfiles de usuario
  fastify.get('/orders', async (request, reply) => {
    const { page = 1, limit = 20 } = request.query
    const start = (page - 1) * limit
    const end = start + Number(limit) - 1

    try {
      const { data: orders, error, count } = await supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error

      // Enriquecer con perfiles de usuario y EMAILS manualmente
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        // 1. Obtener perfiles (username, etc)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)
        
        // 2. Obtener emails desde Supabase Auth, pero buscando POR ID
        //    concreto. NO usar listUsers(), que sin paginar devuelve solo
        //    los primeros 50 usuarios -> los pedidos de los clientes que
        //    queden mas alla del 50 saldrian sin email en el panel.
        //    Con getUserById buscamos uno a uno los user_id que tenemos
        //    en este lote de pedidos: rápido (lote ya paginado), exacto.
        const authUserPairs = await Promise.all(
          userIds.map(async (uid) => {
            try {
              const { data } = await supabase.auth.admin.getUserById(uid)
              return [uid, data?.user || null]
            } catch {
              return [uid, null]
            }
          })
        )
        const authUsersById = new Map(authUserPairs)

        orders.forEach(order => {
          const profile = profiles?.find(p => p.id === order.user_id) || null
          const authUser = authUsersById.get(order.user_id) || null

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

      return { 
        orders,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / (limit || 20))
        }
      }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Error al obtener los pedidos' })
    }
  })

  // --- ACTUALIZAR ESTADO ---
  // Permite al administrador cambiar el estado del pedido (ej: enviado, entregado)
  fastify.patch('/orders/:id', {
    onRequest: [fastify.csrfProtection]
  }, async (request, reply) => {
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

  // --- LISTAR RESERVAS (PRE-ORDERS) ---
  fastify.get('/preorders', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('preorders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { preorders: data }
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Error al obtener las reservas' })
    }
  })
}
