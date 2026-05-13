import { supabase } from '../db/supabase.js'

export default async function (fastify, opts) {
  // --- CREAR RESERVA / PRE-ORDER ---
  fastify.post('/preorder', {
    onRequest: [fastify.authenticate, fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['product_name'],
        properties: {
          product_name: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { product_name } = request.body
    const { id: user_id, email } = request.user

    const { data, error } = await supabase
      .from('preorders')
      .insert([
        { 
          product_name, 
          email, 
          user_id,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) {
      fastify.log.error({ err: error }, 'Error al crear reserva')
      return reply.status(500).send({ error: 'No se pudo procesar la reserva' })
    }

    return { ok: true, message: 'Reserva realizada con éxito', preorder: data }
  })

  fastify.get('/', async (request, reply) => {
    return { ok: true, module: 'drops' }
  })
}
