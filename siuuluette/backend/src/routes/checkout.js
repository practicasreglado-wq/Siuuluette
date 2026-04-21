import Stripe from 'stripe'
import { supabase } from '../db/supabase.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function checkoutRoutes(fastify) {
  
  // POST /api/checkout/intent — Crear intención de pago
  fastify.post('/intent', async (request, reply) => {
    const { items } = request.body // Array de { id, qty }

    if (!items || !items.length) {
      return reply.status(400).send({ error: 'El carrito está vacío' })
    }

    try {
      // 1. Obtener info de productos de la DB (seguridad: no fiarse del precio del frontend)
      const productIds = items.map(i => i.id)
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, price')
        .in('id', productIds)

      if (error) throw error

      console.log('Items recibidos:', items)
      console.log('Productos en DB:', dbProducts)

      // 2. Calcular el total real
      const totalAmount = items.reduce((sum, item) => {
        const product = dbProducts.find(p => p.id === item.id)
        return sum + (product ? Number(product.price) * (item.quantity || 0) : 0)
      }, 0)

      console.log('Total calculado:', totalAmount)

      // Stripe usa céntimos (monto * 100)
      const amountInCents = Math.round(totalAmount * 100)

      if (amountInCents < 50) { // Stripe requiere mínimo 0.50€
        return reply.status(400).send({ error: `Importe bajo: ${totalAmount}€` })
      }

      // 3. Crear el PaymentIntent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          products: JSON.stringify(items.map(i => i.id))
        }
      })

      return {
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount
      }

    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ 
        error: 'Error al procesar el pago',
        message: err.message,
        detail: err.raw ? err.raw.message : null 
      })
    }
  })
}

