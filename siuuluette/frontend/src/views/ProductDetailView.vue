<template>
  <!-- ==========================================
       SIUULUETTE — Product Detail View
       Ficha de producto estilo Jordan: galería izquierda,
       info derecha, acordeones de detalle y relacionados.
       ========================================== -->
  <div class="pdp">

    <!-- Loading state -->
    <div v-if="loading" class="pdp__loading">
      <div class="spinner" />
      <p>Cargando producto…</p>
    </div>

    <!-- Error / 404 state -->
    <div v-else-if="error" class="pdp__error">
      <h2>{{ error }}</h2>
      <router-link :to="{ name: 'home' }" class="btn btn-primary">Volver a la tienda</router-link>
    </div>

    <!-- Product loaded -->
    <template v-else-if="product">

      <!-- Breadcrumb -->
      <nav class="pdp__breadcrumb">
        <router-link :to="{ name: 'home' }">Inicio</router-link>
        <span class="sep">/</span>
        <span class="muted">{{ product.collection }}</span>
        <span class="sep">/</span>
        <span>{{ product.name }}</span>
      </nav>

      <!-- Main 2-col layout -->
      <div class="pdp__main">

        <!-- LEFT: Gallery -->
        <section class="pdp__gallery">
          <div v-if="gallery.length > 1" class="pdp__thumbs">
            <button
              v-for="(img, idx) in gallery"
              :key="idx"
              class="pdp__thumb"
              :class="{ 'is-active': activeImageIdx === idx }"
              @click="activeImageIdx = idx"
              :aria-label="`Imagen ${idx + 1} de ${gallery.length}`"
            >
              <img :src="img" :alt="`${product.name} ${idx + 1}`" />
            </button>
          </div>

          <div
            class="pdp__main-img"
            :class="{ 'is-zooming': zoomActive }"
            @click="toggleZoom"
            @mousemove="onZoomMove"
          >
            <img
              :src="activeImage"
              :alt="product.name"
              :style="zoomStyle"
              class="pdp__main-img-el"
              draggable="false"
            />
            <button
              v-if="gallery.length > 1 && !zoomActive"
              class="pdp__nav pdp__nav--prev"
              @click.stop="prevImg"
              aria-label="Imagen anterior"
            >‹</button>
            <button
              v-if="gallery.length > 1 && !zoomActive"
              class="pdp__nav pdp__nav--next"
              @click.stop="nextImg"
              aria-label="Imagen siguiente"
            >›</button>
          </div>
        </section>

        <!-- RIGHT: Info -->
        <section class="pdp__info">
          <span class="pdp__collection">{{ product.collection }}</span>
          <h1 class="pdp__name">{{ product.name }}</h1>
          <div class="pdp__price-row">
            <div class="pdp__price-wrap">
              <span class="pdp__price">€{{ displayPrice }}</span>
              <span v-if="displayOriginalPrice && Math.round(displayOriginalPrice) > Math.round(displayPrice)" class="pdp__original">
                €{{ Math.round(displayOriginalPrice) }}
              </span>
            </div>
            <span class="pdp__category">{{ product.category }}</span>
          </div>

          <!-- Color -->
          <div v-if="displayColor" class="pdp__field">
            <span class="pdp__label">Color: <strong>{{ displayColor }}</strong></span>
            <div v-if="variants.length > 1" class="pdp__colors">
              <button
                v-for="(v, idx) in variants"
                :key="v.id"
                class="pdp__color"
                :class="{ 'is-selected': idx === currentVariantIdx }"
                :title="v.color_name"
                :aria-label="`Color ${v.color_name}`"
                @click="selectVariant(idx)"
              >
                <img :src="v.primary_image" :alt="v.color_name" />
                <span class="pdp__color-label">{{ v.color_name }}</span>
              </button>
            </div>
          </div>

          <!-- Size selector -->
          <div class="pdp__field">
            <div class="pdp__label-row">
              <span class="pdp__label">Talla</span>
              <button class="pdp__guide-btn" @click="openAccordion('tallaje')">Guía de tallas</button>
            </div>
            <div class="pdp__sizes">
              <button
                v-for="size in availableSizes"
                :key="size"
                class="pdp__size"
                :class="{ 'is-selected': selectedSize === size }"
                @click="selectedSize = size"
              >{{ size }}</button>
            </div>
            <p v-if="sizeError" class="pdp__size-error">Selecciona una talla antes de continuar</p>
          </div>

          <!-- CTA buttons -->
          <div class="pdp__actions">
            <button
              class="btn btn-primary pdp__add"
              :class="{ 'btn-disabled': !selectedSize }"
              @click="handleAdd"
            >
              {{ justAdded ? '✓ Añadido al carrito' : 'Añadir al carrito' }}
            </button>
            <button
              class="pdp__fav"
              :class="{ 'is-active': isFav }"
              @click="handleToggleFav"
              :aria-label="isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'"
              :title="isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <!-- Short description -->
          <p class="pdp__short-desc">{{ product.description }}</p>

          <!-- Trust badges -->
          <ul class="pdp__trust">
            <li>Pago seguro encriptado SSL</li>
            <li>Pieza autenticada por Siuuluette</li>
            <li>Diseñado en España · Confeccionado en Portugal</li>
          </ul>
        </section>
      </div>

      <!-- Accordions -->
      <section class="pdp__accordions">

        <details :open="openSection === 'descripcion'" @toggle="onToggle('descripcion', $event)">
          <summary>Descripción</summary>
          <div class="acc__body">
            <p>{{ product.description }}</p>
          </div>
        </details>

        <details :open="openSection === 'materiales'" @toggle="onToggle('materiales', $event)">
          <summary>Materiales y cuidado</summary>
          <div class="acc__body">
            <p>{{ product.materials || 'Información disponible próximamente.' }}</p>
            <ul class="acc__list">
              <li>Lavar a máquina máx. 30°C</li>
              <li>No usar lejía</li>
              <li>Planchar a temperatura baja</li>
              <li>No secar en secadora</li>
            </ul>
          </div>
        </details>

        <details :open="openSection === 'tallaje'" @toggle="onToggle('tallaje', $event)" ref="accTallaje">
          <summary>Guía de tallas</summary>
          <div class="acc__body">
            <table v-if="hasSizeGuide" class="acc__table">
              <thead>
                <tr>
                  <th>Talla</th>
                  <th v-for="key in sizeGuideKeys" :key="key">{{ capitalize(key) }} (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="size in sizeGuideOrder" :key="size">
                  <td><strong>{{ size }}</strong></td>
                  <td v-for="key in sizeGuideKeys" :key="key">{{ product.size_guide[size]?.[key] ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else>Guía de tallas no disponible para este producto.</p>
          </div>
        </details>

        <details :open="openSection === 'envios'" @toggle="onToggle('envios', $event)">
          <summary>Envíos y devoluciones</summary>
          <div class="acc__body">
            <p><strong>Envío.</strong> 24-48h en península para pedidos antes de las 14:00. Envío gratis a partir de 100€.</p>
            <p><strong>Devoluciones.</strong> 30 días desde la recepción. La prenda debe llegar sin uso, con etiquetas y embalaje original.</p>
          </div>
        </details>
      </section>

      <!-- Related products -->
      <section v-if="related.length" class="pdp__related">
        <h2 class="pdp__related-title">También te puede interesar</h2>
        <div class="pdp__related-grid">
          <ProductCard
            v-for="p in related"
            :key="p.id"
            :product="p"
            @add-to-cart="addToCart"
          />
        </div>
      </section>

    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi } from '../api/index.js'
import { useCart } from '../composables/useCart.js'
import { useFavorites } from '../composables/useFavorites.js'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'ProductDetailView',
  components: { ProductCard },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { addToCart, showToast } = useCart()
    const { isFavorite, toggleFavorite, fetchFavorites } = useFavorites()

    // --- Estado ---
    const product            = ref(null)
    const related            = ref([])
    const loading            = ref(true)
    const error              = ref('')
    const selectedSize       = ref(null)
    const sizeError          = ref(false)
    const justAdded          = ref(false)
    const activeImageIdx     = ref(0)
    const openSection        = ref('descripcion')
    const currentVariantIdx  = ref(0)   // índice de la variante activa (color)

    // --- Zoom interactivo en la imagen principal ---
    const zoomActive = ref(false)
    const zoomOrigin = ref('center center')
    const ZOOM_LEVEL = 2.2

    const zoomStyle = computed(() => ({
      transform: zoomActive.value ? `scale(${ZOOM_LEVEL})` : 'scale(1)',
      transformOrigin: zoomOrigin.value,
    }))

    function onZoomMove(e) {
      // El cursor solo guía al zoom cuando este está activo
      if (!zoomActive.value) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      zoomOrigin.value = `${x}% ${y}%`
    }

    function toggleZoom(e) {
      // Si estoy activando el zoom, calculo la posición inicial donde se hizo click
      if (!zoomActive.value && e?.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        zoomOrigin.value = `${x}% ${y}%`
      }
      zoomActive.value = !zoomActive.value
    }

    // --- Variantes (colores del mismo producto padre) ---
    const variants = computed(() => product.value?.variants || [])

    const currentVariant = computed(() =>
      variants.value[currentVariantIdx.value] || null
    )

    // --- Cambio de variante de color (sin navegación) ---
    function selectVariant(variantOrIdx) {
      // Acepta el objeto variante o el índice directamente
      const idx = typeof variantOrIdx === 'number'
        ? variantOrIdx
        : variants.value.findIndex(v => v.id === variantOrIdx?.id)

      if (idx < 0 || idx === currentVariantIdx.value) return

      zoomActive.value = false
      currentVariantIdx.value = idx
      activeImageIdx.value = 0
      selectedSize.value = null
    }

    // --- Computeds derivados de la variante activa ---
    const gallery = computed(() => {
      if (currentVariant.value?.gallery?.length) return currentVariant.value.gallery
      if (!product.value) return []
      const g = product.value.gallery
      if (Array.isArray(g) && g.length) return g
      return [product.value.image_url, product.value.image_secondary_url].filter(Boolean)
    })

    const activeImage = computed(() => gallery.value[activeImageIdx.value] || '/placeholder.jpg')

    const availableSizes = computed(() => {
      // Tallas de la variante activa
      if (currentVariant.value?.size_names?.length) return currentVariant.value.size_names
      // Fallback al producto
      if (!product.value) return []
      const s = product.value.sizes
      if (!s) return ['S', 'M', 'L', 'XL']
      if (Array.isArray(s)) return s.map(item => String(item).replace(/['"]/g, '').trim()).filter(Boolean)
      if (typeof s === 'string') {
        return s.split(',').map(item => item.replace(/['"]/g, '').trim()).filter(Boolean)
      }
      return ['S', 'M', 'L', 'XL']
    })

    // Precio y color que se ven en el PDP (de la variante activa)
    const displayPrice = computed(() =>
      currentVariant.value?.price_gross ?? product.value?.price ?? null
    )

    const displayColor = computed(() =>
      currentVariant.value?.color_name ?? product.value?.color ?? null
    )

    const displayOriginalPrice = computed(() => {
      // Prioridad a la variante activa, luego al producto base
      return currentVariant.value?.original_price_gross ?? product.value?.originalPrice ?? null
    })

    const isFav = computed(() => {
      const targetId = currentVariant.value?.id || product.value?.id
      return targetId && isFavorite(targetId)
    })

    const hasSizeGuide = computed(() =>
      product.value?.size_guide && Object.keys(product.value.size_guide).length > 0
    )

    const sizeGuideOrder = computed(() => {
      if (!hasSizeGuide.value) return []
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      const present = Object.keys(product.value.size_guide)
      return order.filter(s => present.includes(s)).concat(present.filter(s => !order.includes(s)))
    })

    const sizeGuideKeys = computed(() => {
      if (!hasSizeGuide.value) return []
      const firstSize = sizeGuideOrder.value[0]
      const measures = product.value.size_guide[firstSize] || {}
      return Object.keys(measures)
    })

    // --- Helpers ---
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    function nextImg() {
      activeImageIdx.value = (activeImageIdx.value + 1) % gallery.value.length
    }

    function prevImg() {
      activeImageIdx.value = activeImageIdx.value === 0
        ? gallery.value.length - 1
        : activeImageIdx.value - 1
    }

    function openAccordion(section) {
      openSection.value = section
      // Scroll suave al acordeón
      setTimeout(() => {
        const el = document.querySelector('.pdp__accordions')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }

    function onToggle(section, event) {
      if (event.target.open) {
        openSection.value = section
      } else if (openSection.value === section) {
        openSection.value = ''
      }
    }

    // --- Acciones ---
    async function handleAdd() {
      if (!selectedSize.value) {
        sizeError.value = true
        setTimeout(() => { sizeError.value = false }, 2500)
        return
      }
      sizeError.value = false

      // Construimos el item del carrito con la variante activa
      const v = currentVariant.value
      await addToCart({
        ...product.value,
        // Sobrescribimos con datos de la variante activa
        price: v?.price_gross ?? product.value.price,
        priceNet: v?.price_net_override ?? product.value.price_net ?? 0,
        image_url: v?.primary_image ?? product.value.image_url,
        image: v?.primary_image ?? product.value.image_url,
        color: v?.color_name ?? product.value.color,
        variant_id: v?.id ?? null,
        selectedSize: selectedSize.value
      })
      justAdded.value = true
      setTimeout(() => { justAdded.value = false }, 1800)
    }

    async function handleToggleFav() {
      const targetId = currentVariant.value?.id || product.value?.id
      if (!targetId) return
      
      const wasFav = isFav.value
      await toggleFavorite(targetId)
      showToast(wasFav ? 'Quitado de favoritos' : 'Añadido a favoritos')
    }

    // --- Carga del producto ---
    async function loadProduct(slug) {
      loading.value = true
      error.value = ''
      product.value = null
      related.value = []
      selectedSize.value = null
      activeImageIdx.value = 0
      currentVariantIdx.value = 0
      zoomActive.value = false

      try {
        console.log('[PDP] Cargando slug:', slug)
        const data = await productsApi.getBySlug(slug)
        console.log('[PDP] Datos recibidos:', data)
        
        if (!data || !data.product) {
          throw new Error('El servidor no ha devuelto los datos del producto')
        }

        product.value = data.product
        document.title = `${product.value.name} | Le Siuuluette®`

        // Selección automática por color en URL (?color=...)
        const queryColor = route.query.color
        if (queryColor && product.value.variants) {
          const vIdx = product.value.variants.findIndex(
            v => v.color_name?.toLowerCase() === queryColor.toLowerCase()
          )
          if (vIdx !== -1) {
            currentVariantIdx.value = vIdx
          }
        }

        // Las variantes ya vienen embebidas en product.variants — no hace
        // falta una llamada extra. Solo cargamos los relacionados.
        try {
          const relatedRes = await productsApi.getRelated(product.value.id)
          related.value = relatedRes.products || []
        } catch (err) {
          console.warn('No se pudieron cargar relacionados:', err)
        }
      } catch (err) {
        console.error('Error cargando producto:', err)
        error.value = err.message?.includes('404') || err.message?.includes('no encontrado')
          ? 'Producto no encontrado'
          : 'No hemos podido cargar este producto. Inténtalo más tarde.'
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await fetchFavorites()
      await loadProduct(route.params.slug)
    })

    onUnmounted(() => {
      // Limpieza si es necesaria
    })

    // Si el usuario navega de una ficha a otra (por relacionados), recargar
    watch(() => route.params.slug, async (newSlug) => {
      if (newSlug && route.name === 'product-detail') {
        await loadProduct(newSlug)
      }
    })

    return {
      product, related, loading, error,
      selectedSize, sizeError, justAdded,
      activeImageIdx, openSection,
      zoomActive, zoomStyle, onZoomMove, toggleZoom,
      gallery, activeImage, availableSizes,
      isFav, hasSizeGuide, sizeGuideOrder, sizeGuideKeys,
      capitalize, nextImg, prevImg, openAccordion, onToggle,
      handleAdd, handleToggleFav, addToCart, selectVariant,
      // Variantes (colores)
      variants, currentVariant, currentVariantIdx,
      displayPrice, displayOriginalPrice, displayColor,
    }
  }
}
</script>

<style scoped>
.pdp {
  max-width: 1400px;
  margin: 0 auto;
  /* 85px = altura del navbar fijo + ~16px de respiro para el breadcrumb */
  padding: calc(85px + 1.5rem) 2rem 4rem;
  color: var(--c-white);
  min-height: 80vh;
}

/* Loading & error */
.pdp__loading,
.pdp__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 50vh;
  color: var(--c-grey);
}

.pdp__error h2 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-white);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(92, 82, 72, 0.2);
  border-top-color: var(--c-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Breadcrumb */
.pdp__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.75rem;
  color: var(--c-grey);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.pdp__breadcrumb a {
  color: var(--c-grey);
  text-decoration: none;
  transition: color var(--t-fast);
}

.pdp__breadcrumb a:hover { color: var(--c-gold); }
.pdp__breadcrumb .sep    { opacity: 0.4; }
.pdp__breadcrumb .muted  { color: var(--c-light); }

/* Main 2-col */
.pdp__main {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 4rem;
  align-items: start;
  max-width: 1300px;
  margin: 0 auto;
}

/* GALLERY */
.pdp__gallery {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  position: sticky;
  top: 140px;
  width: 100%;
}

.pdp__thumbs {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 110px;
  flex-shrink: 0;
}

.pdp__thumb {
  width: 100%;
  aspect-ratio: 1/1.2;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  background: var(--c-dark-2);
}

.pdp__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  transition: opacity var(--t-fast);
}

.pdp__thumb:hover img { opacity: 1; }
.pdp__thumb.is-active { border-color: var(--c-gold); }
.pdp__thumb.is-active img { opacity: 1; }

.pdp__main-img {
  flex: 1;
  position: relative;
  aspect-ratio: 1/1.15;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--c-dark-2);
  cursor: zoom-in;
  user-select: none;
}

.pdp__main-img.is-zooming { cursor: zoom-out; }

.pdp__main-img-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.18s ease-out;
  will-change: transform;
}

.pdp__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(28, 24, 20, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--c-white);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--t-fast), border-color var(--t-fast);
}

.pdp__nav:hover { background: rgba(28, 24, 20, 0.95); border-color: var(--c-gold); }
.pdp__nav--prev { left: 1rem; }
.pdp__nav--next { right: 1rem; }

.pdp__thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: 0.6rem;
}

.pdp__thumb {
  aspect-ratio: 1/1.15;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-dark-2);
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: border-color var(--t-fast);
}

.pdp__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pdp__thumb:hover { border-color: rgba(92, 82, 72, 0.4); }
.pdp__thumb.is-active { border-color: var(--c-gold); }

/* INFO RIGHT */
.pdp__info {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.pdp__collection {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-gold);
  font-weight: 600;
}

.pdp__name {
  font-family: var(--font-display);
  font-size: 2.2rem;
  line-height: 1.15;
  letter-spacing: 0.02em;
  color: var(--c-white);
  margin: -0.4rem 0 0;
}

.pdp__price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.pdp__price-wrap {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.pdp__price {
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--c-off-white);
}

.pdp__original {
  font-size: 1.1rem;
  color: var(--c-grey);
  text-decoration: line-through;
  opacity: 0.6;
}

.pdp__category {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-grey);
}

.pdp__field { display: flex; flex-direction: column; gap: 0.7rem; }

/* Color variants */
.pdp__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.2rem;
}

.pdp__color {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(92, 82, 72, 0.3);
  background: var(--c-dark-2);
  padding: 0;
  cursor: pointer;
  transition: border-color var(--t-fast), transform var(--t-fast);
}

.pdp__color img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pdp__color:hover {
  border-color: var(--c-gold);
  transform: scale(1.05);
}

.pdp__color.is-selected {
  border-color: var(--c-white);
  box-shadow: 0 0 0 2px var(--c-dark), 0 0 0 4px var(--c-gold);
  transform: scale(1.05);
  cursor: default;
}

.pdp__color-label {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--c-dark-2);
  border: 1px solid rgba(92, 82, 72, 0.3);
  color: var(--c-white);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--t-fast);
  z-index: 10;
}

.pdp__color:hover .pdp__color-label {
  opacity: 1;
}

.pdp__label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-light);
}

.pdp__label strong {
  font-weight: 600;
  color: var(--c-white);
  text-transform: none;
  letter-spacing: 0;
  margin-left: 0.4rem;
}

.pdp__label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pdp__guide-btn {
  background: transparent;
  border: none;
  color: var(--c-gold);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.pdp__sizes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
  gap: 0.5rem;
}

.pdp__size {
  height: 48px;
  background: transparent;
  color: var(--c-white);
  border: 1px solid rgba(92, 82, 72, 0.3);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all var(--t-fast);
}

.pdp__size:hover { border-color: var(--c-gold); color: var(--c-gold); }

.pdp__size.is-selected {
  background: var(--c-white);
  color: var(--c-black);
  border-color: var(--c-white);
}

.pdp__size-error {
  font-size: 0.78rem;
  color: #e57373;
  margin: 0;
}

.pdp__actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.4rem;
}

.pdp__add {
  flex: 1;
  height: 56px;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}

.pdp__fav {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(92, 82, 72, 0.3);
  background: transparent;
  color: var(--c-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--t-fast);
}

.pdp__fav:hover { border-color: var(--c-gold); color: var(--c-gold); }
.pdp__fav.is-active { color: #e57373; border-color: #e57373; }
.pdp__fav.is-active svg { animation: heart-pop 0.4s var(--ease-spring); }

@keyframes heart-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.pdp__short-desc {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--c-light);
  margin: 0.4rem 0 0;
}

.pdp__trust {
  list-style: none;
  padding: 1rem 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-top: 1px solid rgba(92, 82, 72, 0.15);
}

.pdp__trust li {
  font-size: 0.78rem;
  color: var(--c-grey);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pdp__trust li::before {
  content: '✓';
  color: var(--c-gold);
  font-weight: 700;
}

/* ACCORDIONS */
.pdp__accordions {
  margin-top: 4rem;
  border-top: 1px solid rgba(92, 82, 72, 0.15);
}

.pdp__accordions details {
  border-bottom: 1px solid rgba(92, 82, 72, 0.15);
}

.pdp__accordions summary {
  list-style: none;
  cursor: pointer;
  padding: 1.4rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color var(--t-fast);
}

.pdp__accordions summary::-webkit-details-marker { display: none; }
.pdp__accordions summary::after {
  content: '+';
  font-size: 1.2rem;
  font-weight: 300;
  transition: transform var(--t-medium);
}
.pdp__accordions details[open] summary::after { content: '−'; }
.pdp__accordions summary:hover { color: var(--c-gold); }

.acc__body {
  padding: 0 0 1.6rem;
  color: var(--c-light);
  font-size: 0.92rem;
  line-height: 1.6;
}

.acc__body p { margin: 0 0 0.8rem; }
.acc__body p:last-child { margin-bottom: 0; }

.acc__list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.acc__list li::before {
  content: '·  ';
  color: var(--c-gold);
}

.acc__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.6rem;
  font-size: 0.85rem;
}

.acc__table th,
.acc__table td {
  padding: 0.7rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(92, 82, 72, 0.15);
}

.acc__table th {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-grey);
  font-weight: 600;
}

/* RELATED */
.pdp__related { margin-top: 4rem; }

.pdp__related-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-white);
  margin-bottom: 1.5rem;
  text-align: center;
}

.pdp__related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .pdp { padding: calc(85px + 1rem) 1rem 3rem; }

  .pdp__main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .pdp__gallery { position: static; }
  .pdp__name { font-size: 1.7rem; }
  .pdp__price { font-size: 1.4rem; }

  .pdp__related-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .pdp__related-grid { grid-template-columns: 1fr; }
}
</style>
