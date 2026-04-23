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

      // 2. Calcular el total real
      const totalAmount = items.reduce((sum, item) => {
        const product = dbProducts.find(p => p.id === Number(item.id))
        const itemQty = item.quantity || 0
        const itemPrice = product ? Number(product.price) : 0
        return sum + (itemPrice * itemQty)
      }, 0)

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
        message: err.message
      })
    }
  })

  // POST /api/checkout/confirm — Finalizar pedido y guardar en DB
  fastify.post('/confirm', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id
    const { paymentIntentId, shippingAddress, items, totalAmount } = request.body

    try {
      // 1. Crear el Pedido (Order)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          total_amount: totalAmount,
          status: 'paid',
          shipping_address: JSON.stringify(shippingAddress),
          stripe_payment_intent_id: paymentIntentId
        }])
        .select()
        .single()

      if (orderError) {
        console.error('--- ERROR AL CREAR ORDER ---')
        console.error('Código:', orderError.code)
        console.error('Mensaje:', orderError.message)
        console.error('Detalles:', orderError.details)
        console.error('Hint:', orderError.hint)
        throw orderError
      }

      // 2. Crear los Detalles del Pedido (Order Items)
      const productIds = items.map(i => i.id)
      const { data: products } = await supabase
        .from('products')
        .select('id, price')
        .in('id', productIds)

      const orderItems = items.map(item => {
        const product = products.find(p => p.id === item.id)
        return {
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: product ? product.price : 0,
          size: item.selectedSize || 'M'
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error al crear ORDER_ITEMS:', itemsError)
        throw itemsError
      }

      // 3. Vaciar el Carrito del Usuario (Solo si está logueado)
      if (userId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
      }

      return { message: 'Pedido guardado con éxito', orderId: order.id }

    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Error al guardar el pedido', message: err.message })
    }
  })

  // GET /api/orders — Obtener historial de pedidos del usuario
  fastify.get('/orders', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = request.user.id

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, image_url, price)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return reply.status(400).send({ error: error.message })
    }

    return { orders: data }
  })
}

