// frontend/src/composables/useCart.js
//
// Estado del carrito centralizado (Composition API).
// Reemplaza la lógica que vivía en App.vue, para que cualquier vista
// (Home, ProductDetail, etc.) pueda leer/modificar el mismo carrito
// sin pasar props ni emits.
//
// Patrón "module-scoped state": las variables están fuera de la función,
// así todos los componentes que importen useCart() comparten el mismo
// estado reactivo.

import { ref, computed, watch } from 'vue'
import { cartApi } from '../api/index.js'

// --- Estado compartido ---
// Intentamos cargar del localStorage al inicio para invitados
const savedCart = localStorage.getItem('cart')
const cartItems = ref(savedCart ? JSON.parse(savedCart) : [])

// Vigilante para persistir cambios locales (solo si NO hay token de sesión)
watch(cartItems, (newItems) => {
  const token = localStorage.getItem('token')
  if (!token) {
    localStorage.setItem('cart', JSON.stringify(newItems))
  }
}, { deep: true })
const isCartOpen = ref(false)
const toastMsg = ref('')
const toastVisible = ref(false)

// --- Helpers ---
function formatCartFromBackend(cart) {
  return cart.map(i => {
    const v = i.variant || {}
    const p = v.product || {}
    
    // Cálculo de precio final (Bruto)
    const basePrice = v.price_gross_override ?? p.price_gross ?? 0
    const discount  = p.discount_percent || 0
    const finalPrice = +(basePrice * (1 - discount / 100)).toFixed(2)

    // Cálculo de precio final (Neto)
    const baseNetPrice = v.price_net_override ?? p.price_net ?? 0
    const finalNetPrice = +(baseNetPrice * (1 - discount / 100)).toFixed(2)


    return {
      cartItemId:   i.id,
      id:           i.product_id, 
      parentId:     p.id,
      name:         p.name,
      price:        finalPrice,
      priceNet:     finalNetPrice,
      image:        v.images?.[0]?.url || null,
      image_url:    v.images?.[0]?.url || null,
      color:        v.color_name,
      qty:          i.quantity,
      selectedSize: i.size || 'M'
    }
  })
}

function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2200)
}

// --- Acciones ---
async function fetchCart() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const { cart } = await cartApi.get()
    cartItems.value = formatCartFromBackend(cart)
  } catch (err) {
    console.error('Error cargando carrito:', err)
  }
}

async function addToCart(product) {
  // Siempre usamos el ID de la variante como identificador principal en el carrito
  const targetId = product.variant_id || product.id
  
  const existing = cartItems.value.find(
    i => i.id === targetId && i.selectedSize === product.selectedSize
  )

  if (existing) {
    existing.qty += 1
  } else {
    // Aseguramos que el item en memoria tenga la estructura correcta
    cartItems.value.push({
      ...product,
      id: targetId, // Forzamos que 'id' sea el de la variante
      qty: 1
    })
  }

  const token = localStorage.getItem('token')
  if (token) {
    try {
      await cartApi.add({
        product_id: targetId,
        quantity:   1,
        size:       product.selectedSize
      })
      // Refetch para sincronizar IDs de base de datos
      await fetchCart()
    } catch (err) {
      console.error('Error añadiendo al carrito:', err)
      showToast('Error al guardar en el servidor')
    }
  }
  showToast(`${product.name} añadido`)
}

async function removeFromCart(item) {
  if (!item) return
  const { id: productId, selectedSize: size } = item

  // Optimista
  cartItems.value = cartItems.value.filter(
    i => !(i.id === productId && i.selectedSize === size)
  )

  const token = localStorage.getItem('token')
  if (token && item.cartItemId) {
    try {
      await cartApi.remove(item.cartItemId)
    } catch (err) {
      console.error('Error eliminando del carrito:', err)
      showToast('No se pudo eliminar. Reintenta.')
      cartItems.value.push(item)
    }
  }
}

async function updateQty(productId, size, delta) {
  const item = cartItems.value.find(
    i => i.id === productId && i.selectedSize === size
  )
  if (!item) return

  const newQty = item.qty + delta

  if (newQty <= 0) {
    await removeFromCart(item)
    return
  }

  const previousQty = item.qty
  item.qty = newQty

  const token = localStorage.getItem('token')
  if (token && item.cartItemId) {
    try {
      await cartApi.updateQty(item.cartItemId, newQty)
    } catch (err) {
      console.error('Error actualizando cantidad:', err)
      showToast('No se pudo actualizar. Reintenta.')
      item.qty = previousQty
    }
  }
}

async function mergeGuestCart() {
  const saved = localStorage.getItem('cart')
  if (!saved) return
  
  const localItems = JSON.parse(saved)
  if (!localItems.length) return

  try {
    const mergeData = localItems.map(i => ({
      product_id: i.variant_id || i.id,
      quantity:   i.qty,
      size:       i.selectedSize
    }))

    await cartApi.merge(mergeData)
    localStorage.removeItem('cart')
    await fetchCart()
  } catch (err) {
    console.error('[useCart] Error al fusionar carrito:', err)
  }
}

async function clearCart() {
  cartItems.value = []
  localStorage.removeItem('cart')
  const token = localStorage.getItem('token')
  if (token) {
    try {
      await cartApi.clear()
    } catch (err) {
      console.error('Error vaciando carrito en backend:', err)
    }
  }
}

// --- Computeds ---
const cartCount = computed(() =>
  cartItems.value.reduce((sum, i) => sum + i.qty, 0)
)

const cartSubtotal = computed(() =>
  cartItems.value.reduce((sum, i) => {
    const price = Number(i.price) || 0
    const qty = Number(i.qty) || 0
    return sum + (price * qty)
  }, 0)
)

const cartNetTotal = computed(() => {
  const total = cartItems.value.reduce((sum, i) => {
    const pNet = Number(i.priceNet) || 0
    const qty = Number(i.qty) || 0
    return sum + (pNet * qty)
  }, 0)
  return total.toFixed(2)
})

// --- Composable público ---
export function useCart() {
  return {
    // estado
    cartItems,
    isCartOpen,
    toastMsg,
    toastVisible,
    cartCount,
    cartSubtotal,
    cartNetTotal,

    // acciones
    fetchCart,
    addToCart,
    removeFromCart,
    updateQty,
    mergeGuestCart,
    clearCart,
    showToast,
  }
}
