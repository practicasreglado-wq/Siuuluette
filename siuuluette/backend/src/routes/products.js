import { supabase } from '../db/supabase.js'

/* ============================================================
   SIUULUETTE — Products Routes (modelo con variantes)
   ============================================================
   - products: producto padre (Sudadera Sport, Camiseta Urban...)
   - product_variants: cada color del producto
   - product_images: imágenes por variante
   - variant_stock: stock por SKU (variante + talla)
   ============================================================ */

// Selector reutilizable: producto padre + variantes anidadas + imágenes + stock
const PRODUCT_SELECT = `
  id, name, slug, description, collection, category, style,
  price_net, price_gross, discount_percent, materials, size_guide, is_active,
  variants:product_variants(
    id, color_name, color_hex, sort_order,
    price_net_override, price_gross_override, is_active,
    images:product_images(id, url, alt, sort_order),
    stock:variant_stock(id, size, stock, stock_mode, restock_date, sku_code)
  )
`

// Orden lógico de tallas
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

/* -----------------------------------------------------------
   Helpers de transformación
   ----------------------------------------------------------- */

// Calcula precio final aplicando override + descuento
function computePrices(parent, variant) {
  const baseNet   = variant.price_net_override   ?? parent.price_net
  const baseGross = variant.price_gross_override ?? parent.price_gross
  const discount  = parent.discount_percent || 0

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

// Normaliza el producto: ordena variantes, imágenes y tallas; aplica precios.
// Devuelve además campos "legacy" (price, image_url, sizes, color, gallery)
// tomados de la primera variante para que el frontend actual siga funcionando.
function normalizeProduct(p) {
  if (!p) return null

  // Filtrar variantes activas y ordenar
  const variants = (p.variants || [])
    .filter(v => v.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(v => {
      const prices = computePrices(p, v)

      // Ordenar imágenes
      const images = (v.images || [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      const imageUrls = images.map(i => i.url)

      // Ordenar tallas y marcar disponibilidad
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
      const sizeNames = sizes.map(s => s.size)

      return {
        id: v.id,
        color_name: v.color_name,
        color_hex: v.color_hex,
        ...prices,
        primary_image: imageUrls[0] || null,
        secondary_image: imageUrls[1] || null,
        images,
        gallery: imageUrls,            // alias legacy
        sizes,
        size_names: sizeNames,         // array de strings ['S','M','L','XL']
        in_stock: sizes.some(s => s.available),

        // Alias legacy a nivel variante (por si algún componente lo usa así)
        image_url: imageUrls[0] || null,
        image_secondary_url: imageUrls[1] || null,
        price: prices.price_gross,
        color: v.color_name
      }
    })

  // Defaults a nivel padre (lo que se ve en catálogo): primera variante
  const firstVariant = variants[0] || {}

  return {
    // === Modelo nuevo ===
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

    // Precios base del padre
    price_net: p.price_net,
    price_gross: p.price_gross,

    // Defaults para catálogo
    default_image: firstVariant.primary_image,
    default_color: firstVariant.color_name,
    default_price_gross: firstVariant.price_gross ?? p.price_gross,

    variants,
    in_stock: variants.some(v => v.in_stock),

    // === Compatibilidad con frontend actual (lee de la 1ª variante) ===
    price: firstVariant.price_gross ?? p.price_gross,
    price_net: firstVariant.price_net ?? p.price_net,
    originalPrice: firstVariant.original_price_gross ?? null,
    originalPriceNet: firstVariant.original_price_net ?? null,
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

  // GET /api/products — listar todos los productos activos
  fastify.get('/', async (request, reply) => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (error) {
      request.log.error({ err: error }, 'Error listando productos')
      return reply.status(500).send({ error: error.message })
    }

    const products = (data || []).map(normalizeProduct)
    return { products }
  })

  // GET /api/products/:id — un producto por id
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

    if (error)  return reply.status(500).send({ error: error.message })
    if (!data)  return reply.status(404).send({ error: 'Producto no encontrado' })

    return { product: normalizeProduct(data) }
  })

  // GET /api/products/slug/:slug — un producto por slug (URL pública)
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

    if (error)  return reply.status(500).send({ error: error.message })
    if (!data)  return reply.status(404).send({ error: 'Producto no encontrado' })

    return { product: normalizeProduct(data) }
  })

  // GET /api/products/:id/related — productos relacionados (misma colección)
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

    if (baseErr) return reply.status(500).send({ error: baseErr.message })
    if (!base)   return reply.status(404).send({ error: 'Producto no encontrado' })

    // 2) Hasta 4 productos de la misma colección, excluyendo el actual
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('collection', base.collection)
      .eq('is_active', true)
      .neq('id', id)
      .limit(4)

    if (error) return reply.status(500).send({ error: error.message })

    const products = (data || []).map(normalizeProduct)
    return { products }
  })

  // GET /api/products/:id/variants — colores del mismo producto padre
  // Devuelve cada color como un mini-producto compatible con el PDP actual:
  // { id (variant_id), name, slug, color, image_url, color_hex }
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

    if (error) return reply.status(500).send({ error: error.message })
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

  // POST /api/products — crear producto (admin, JWT)
  // Por ahora solo crea el padre. La creación de variantes/imágenes/stock
  // se hará en endpoints separados o en un panel de admin.
  fastify.post('/', {
    onRequest: [fastify.authenticate],
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

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send({ product: data })
  })
}
