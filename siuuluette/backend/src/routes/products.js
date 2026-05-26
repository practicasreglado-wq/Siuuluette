import { supabase } from '../db/supabase.js'

/* ============================================================
   SIUULUETTE — Rutas de Productos (Modelo de Datos)
   ============================================================
   - products: Producto base (ej: Sudadera)
   - product_variants: Variantes por color del producto
   - product_images: Galería de fotos por variante
   - variant_stock: Inventario por talla y SKU
   ============================================================ */

// Consulta base para traer toda la información relacionada de un producto
const PRODUCT_SELECT = `
  id, name, slug, description, collection, category, style,
  price_net, price_gross, discount_percent, materials, size_guide, is_active,
  variants:product_variants(
    id, color_name, color_hex, sort_order,
    price_net_override, price_gross_override, discount_percent, is_active,
    images:product_images(id, url, alt, sort_order),
    stock:variant_stock(id, size, stock, stock_mode, restock_date, sku_code)
  )
`

// Orden lógico de tallas
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

/* -----------------------------------------------------------
   HELPERS DE TRANSFORMACIÓN Y CÁLCULO
   ----------------------------------------------------------- */

// Calcula los precios finales aplicando descuentos y posibles variaciones por color
function computePrices(parent, variant) {
  const baseNet   = variant.price_net_override   ?? parent.price_net
  const baseGross = variant.price_gross_override ?? parent.price_gross
  // El descuento de la variante (color) manda sobre el del producto.
  // Si la variante no tiene descuento propio (NULL), hereda el del
  // producto; si el producto tampoco tiene, no hay descuento.
  const discount  = variant.discount_percent ?? parent.discount_percent ?? 0

  const finalNet   = +(baseNet   * (1 - discount / 100)).toFixed(2)
  const finalGross = +(baseGross * (1 - discount / 100)).toFixed(2)

  return {
    price_net: finalNet,
    price_gross: finalGross,
    original_price_gross: discount > 0 ? +baseGross : null
  }
}

// Indica si una talla está disponible (según modo de stock)
function isSizeAvailable(s) {
  if (s.stock_mode === 'on_demand') return true
  if (s.stock_mode === 'preorder')  return true
  return s.stock > 0   // 'limited'
}

// Limpia y organiza los datos de la DB para que el Frontend los entienda fácilmente.
// Gestiona el orden de fotos, tallas disponibles y compatibilidad con versiones anteriores.
function normalizeProduct(p) {
  if (!p) return null

  // 1. Mapeamos variantes (con seguridad)
  const variants = (p.variants || [])
    .filter(v => v.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(v => {
      const vPrices = computePrices(p, v)
      const images = (v.images || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      const imageUrls = images.map(i => i.url)
      const sizes = (v.stock || [])
        .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
        .map(s => ({
          size: s.size,
          stock: s.stock,
          stock_mode: s.stock_mode,
          restock_date: s.restock_date,
          sku_code: s.sku_code,
          available: isSizeAvailable(s)
        }))

      return {
        id: v.id,
        color_name: v.color_name,
        color_hex: v.color_hex,
        price_net_override: v.price_net_override,
        price_gross_override: v.price_gross_override,
        discount_percent: v.discount_percent,
        ...vPrices,
        primary_image: imageUrls[0] || null,
        secondary_image: imageUrls[1] || null,
        gallery: imageUrls,
        sizes,
        size_names: sizes.map(s => s.size),
        in_stock: sizes.some(s => s.available),
        image_url: imageUrls[0] || null,
        color: v.color_name
      }
    })

  // 2. Extraemos defaults de la primera variante o del padre
  const firstVariant = variants[0] || {}
  const prices = computePrices(p, firstVariant)

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    collection: p.collection,
    category: p.category,
    style: p.style,
    materials: p.materials,
    size_guide: p.size_guide,
    discount_percent: p.discount_percent || 0,

    // Precios base
    price_net: p.price_net,
    price_gross: p.price_gross,

    variants,
    in_stock: variants.some(v => v.in_stock),

    // Defaults para catálogo
    default_image: firstVariant.primary_image,
    default_color: firstVariant.color_name,
    default_price_gross: prices.price_gross,

    // Compatibilidad frontend
    price: prices.price_gross,
    price_net: prices.price_net,
    originalPrice: prices.original_price_gross,
    color: firstVariant.color_name ?? null,
    image_url: firstVariant.primary_image ?? null,
    image_secondary_url: firstVariant.secondary_image ?? null,
    gallery: firstVariant.gallery ?? [],
    sizes: firstVariant.size_names ?? []
  }
}

/* -----------------------------------------------------------
   Rutas
   ----------------------------------------------------------- */

export default async function productsRoutes(fastify) {

  // --- LISTAR PRODUCTOS (CATÁLOGO) ---
  // Obtiene todos los productos que están marcados como activos
  fastify.get('/', async (request, reply) => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (error) {
      request.log.error({ err: error }, 'Error listando productos')
      return reply.status(500).send({ error: 'No se han podido cargar los productos' })
    }

    const products = (data || []).map(normalizeProduct)
    return { products }
  })

  // --- LISTAR PRODUCTOS (ADMIN) ---
  // Obtiene todos los productos del sistema (activos e inactivos)
  fastify.get('/admin', {
    onRequest: [fastify.authenticateAdmin]
  }, async (request, reply) => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('id', { ascending: true })

    if (error) {
      request.log.error({ err: error }, 'Error listando productos admin')
      return reply.status(500).send({ error: 'No se han podido cargar los productos' })
    }

    const products = (data || []).map(normalizeProduct)
    return { products }
  })

  // --- OBTENER POR ID ---
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      request.log.error({ err: error }, 'Error obteniendo producto')
      return reply.status(500).send({ error: 'No se ha podido cargar el producto' })
    }
    if (!data)  return reply.status(404).send({ error: 'Producto no encontrado' })

    return { product: normalizeProduct(data) }
  })

  // --- OBTENER POR SLUG (URL AMIGABLE) ---
  fastify.get('/slug/:slug', {
    schema: {
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string', minLength: 1 } }
      }
    }
  }, async (request, reply) => {
    const { slug } = request.params

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      request.log.error({ err: error }, 'Error obteniendo producto')
      return reply.status(500).send({ error: 'No se ha podido cargar el producto' })
    }
    if (!data)  return reply.status(404).send({ error: 'Producto no encontrado' })

    return { product: normalizeProduct(data) }
  })

  // --- PRODUCTOS RELACIONADOS ---
  // Sugiere productos de la misma colección
  fastify.get('/:id/related', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    // 1) Colección del producto base
    const { data: base, error: baseErr } = await supabase
      .from('products')
      .select('collection')
      .eq('id', id)
      .maybeSingle()

    if (baseErr) {
      request.log.error({ err: baseErr }, 'Error obteniendo producto base')
      return reply.status(500).send({ error: 'No se han podido cargar productos relacionados' })
    }
    if (!base)   return reply.status(404).send({ error: 'Producto no encontrado' })

    // 2) Hasta 4 productos de la misma colección, excluyendo el actual
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('collection', base.collection)
      .eq('is_active', true)
      .neq('id', id)
      .limit(4)

    if (error) {
      request.log.error({ err: error }, 'Error en consulta de productos')
      return reply.status(500).send({ error: 'No se ha podido completar la operación' })
    }

    const products = (data || []).map(normalizeProduct)
    return { products }
  })

  // --- COLORES DISPONIBLES ---
  // Devuelve las variantes de color para cambiar de modelo en la página de producto
  fastify.get('/:id/variants', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      request.log.error({ err: error }, 'Error en consulta de productos')
      return reply.status(500).send({ error: 'No se ha podido completar la operación' })
    }
    if (!data) return reply.status(404).send({ error: 'Producto no encontrado' })

    const product = normalizeProduct(data)

    // Aplanamos las variantes a un formato compatible con el PDP antiguo
    const variants = product.variants.map(v => ({
      id: v.id,                      // variant_id
      product_id: product.id,
      name: product.name,
      slug: product.slug,            // mismo slug (no hay PDP por color todavía)
      color: v.color_name,
      color_hex: v.color_hex,
      image_url: v.primary_image,
      price: v.price_gross
    }))

    return { variants }
  })

  // --- CREAR PRODUCTO (ADMIN) ---
  fastify.post('/', {
    onRequest: [fastify.authenticateAdmin, fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'slug', 'price_gross'],
        properties: {
          name:             { type: 'string', minLength: 2 },
          slug:             { type: 'string', minLength: 2 },
          description:      { type: 'string' },
          collection:       { type: 'string' },
          category:         { type: 'string' },
          style:            { type: 'string' },
          price_net:        { type: 'number', minimum: 0 },
          price_gross:      { type: 'number', minimum: 0 },
          discount_percent: { type: 'integer', minimum: 0, maximum: 100 },
          materials:        { type: 'string' },
          size_guide:       { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    const body = request.body

    // Si solo nos dan price_gross, calculamos price_net con IVA 21%
    if (body.price_gross != null && body.price_net == null) {
      body.price_net = +(body.price_gross / 1.21).toFixed(2)
    }

    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single()

    if (error) {
      request.log.error({ err: error }, 'Error en consulta de productos')
      return reply.status(500).send({ error: 'No se ha podido completar la operación' })
    }
    return reply.status(201).send({ product: data })
  })

  // --- ACTUALIZAR PRODUCTO (ADMIN) ---
  // Whitelist de columnas EN CÓDIGO: solo se copian al UPDATE los campos
  // listados en PRODUCT_UPDATABLE. Cualquier otro campo del body se ignora
  // silenciosamente, así que NUNCA llega a la tabla. Es más robusto que un
  // schema con additionalProperties:false porque si mañana el frontend
  // manda un campo nuevo no rompe la API: simplemente no se guarda hasta
  // que se añada a la lista de aquí abajo.
  fastify.patch('/:id', {
    onRequest: [fastify.authenticateAdmin, fastify.csrfProtection],
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const body = request.body || {}

    const PRODUCT_UPDATABLE = [
      'name', 'slug', 'description', 'collection', 'category', 'style',
      'price_net', 'price_gross', 'discount_percent', 'materials',
      'size_guide', 'is_active'
    ]
    const updates = {}
    for (const k of PRODUCT_UPDATABLE) {
      if (body[k] !== undefined) updates[k] = body[k]
    }

    if (Object.keys(updates).length === 0) {
      return reply.status(400).send({ error: 'No se han enviado cambios' })
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      request.log.error({ err: error }, 'Error guardando cambios de producto')
      return reply.status(400).send({ error: 'No se han podido guardar los cambios' })
    }
    return { product: data }
  })

  // --- ACTUALIZAR VARIANTE (ADMIN) ---
  // Misma lógica que el PATCH de producto: la lista de columnas
  // permitidas vive en código (VARIANT_UPDATABLE). Cualquier campo no
  // listado del body se descarta antes de tocar la tabla.
  fastify.patch('/variants/:id', {
    onRequest: [fastify.authenticateAdmin, fastify.csrfProtection],
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const body = request.body || {}

    const VARIANT_UPDATABLE = [
      'color_name', 'color_hex', 'sort_order',
      'price_net_override', 'price_gross_override',
      'discount_percent', 'is_active'
    ]
    const updates = {}
    for (const k of VARIANT_UPDATABLE) {
      if (body[k] !== undefined) updates[k] = body[k]
    }

    if (Object.keys(updates).length === 0) {
      return reply.status(400).send({ error: 'No se han enviado cambios' })
    }

    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      request.log.error({ err: error }, 'Error guardando cambios de variante')
      return reply.status(400).send({ error: 'No se han podido guardar los cambios' })
    }
    return { variant: data }
  })

  // --- ACTUALIZAR STOCK DE UNA TALLA (ADMIN) ---
  // Modifica las unidades o el modo de stock de UNA talla concreta de una
  // variante. La pareja (variant_id, size) identifica la fila exacta de
  // variant_stock. Lo usa el panel /admin/stock.
  //
  // El descuento real de stock al vender lo hace el trigger
  // trg_decrement_variant_stock de la base de datos; aqui solo se permite
  // al administrador fijar/corregir las unidades disponibles.
  fastify.patch('/variants/:id/stock', {
    onRequest: [fastify.authenticateAdmin, fastify.csrfProtection],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'integer' } }
      },
      body: {
        type: 'object',
        required: ['size'],
        properties: {
          size:         { type: 'string', minLength: 1 },
          stock:        { type: 'integer', minimum: 0 },
          stock_mode:   { type: 'string', enum: ['limited', 'on_demand', 'preorder'] },
          restock_date: { type: ['string', 'null'] }
        }
      }
    }
  }, async (request, reply) => {
    const { id }   = request.params   // id = variant_id
    const { size } = request.body

    // Solo se actualizan los campos que llegan realmente en el body.
    const updates = {}
    if (request.body.stock        !== undefined) updates.stock        = request.body.stock
    if (request.body.stock_mode   !== undefined) updates.stock_mode   = request.body.stock_mode
    if (request.body.restock_date !== undefined) updates.restock_date = request.body.restock_date || null

    if (Object.keys(updates).length === 0) {
      return reply.status(400).send({ error: 'No se ha enviado ningun campo a actualizar' })
    }

    const { data, error } = await supabase
      .from('variant_stock')
      .update(updates)
      .eq('variant_id', id)
      .eq('size', size)
      .select()
      .maybeSingle()

    if (error) {
      request.log.error({ err: error }, 'Error guardando cambios de producto')
      return reply.status(400).send({ error: 'No se han podido guardar los cambios' })
    }
    if (!data) return reply.status(404).send({ error: 'No existe registro de stock para esa variante y talla' })

    return { stock: data }
  })

  // --- DESCUENTO POR COLECCION (ADMIN) ---
  // Aplica un mismo descuento a TODOS los productos de una coleccion de
  // golpe (p.ej. rebajar toda la coleccion "Essentials"). Es una accion
  // en bloque: escribe products.discount_percent de cada producto de esa
  // coleccion. Ojo: si despues se anade un producto nuevo a la coleccion,
  // NO hereda el descuento automaticamente (habria que volver a aplicar).
  fastify.patch('/collection-discount', {
    onRequest: [fastify.authenticateAdmin, fastify.csrfProtection],
    schema: {
      body: {
        type: 'object',
        required: ['collection', 'discount_percent'],
        properties: {
          collection:       { type: 'string', minLength: 1 },
          discount_percent: { type: 'integer', minimum: 0, maximum: 100 }
        }
      }
    }
  }, async (request, reply) => {
    const { collection, discount_percent } = request.body

    const { data, error } = await supabase
      .from('products')
      .update({ discount_percent })
      .eq('collection', collection)
      .select('id')

    if (error) {
      request.log.error({ err: error }, 'Error guardando cambios de producto')
      return reply.status(400).send({ error: 'No se han podido guardar los cambios' })
    }

    return {
      message: `Descuento del ${discount_percent}% aplicado a la coleccion "${collection}"`,
      updated: (data || []).length
    }
  })
}
