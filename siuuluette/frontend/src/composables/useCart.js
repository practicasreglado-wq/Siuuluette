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

import { ref, computed } from 'vue'
import { cartApi } from '../api/index.js'

// --- Estado compartido ---
const cartItems   = ref([])
const isCartOpen  = ref(false)
const toastMsg    = ref('')
const toastVisible = ref(false)

// --- Helpers ---
function formatCartFromBackend(cart) {
  return cart.map(i => ({
    cartItemId:   i.id, // PK del cart_items, usada para PATCH/DELETE
    id:           i.product_id,
    name:         i.products?.name,
    price:        i.products?.price,
    image:        i.products?.image_url,
    image_url:    i.products?.image_url,
    category:     i.products?.category,
    qty:          i.quantity,
    selectedSize: i.size || 'M'
  }))
}

function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2200)
}

// --- Acciones ---
async function fetchCart() {
  const token = localStorage.getItem('token')
  if (!token) return // invitado: el carrito vive solo en memoria
  try {
    const { cart } = await cartApi.get()
    cartItems.value = formatCartFromBackend(cart)
  } catch (err) {
    console.error('Error cargando carrito:', err)
  }
}

async function addToCart(product) {
  const existing = cartItems.value.find(
    i => i.id === product.id && i.selectedSize === product.selectedSize
  )

  // Optimista: sumamos local primero
  if (existing) {
    existing.qty += 1
  } else {
    cartItems.value.push({ ...product, qty: 1 })
  }

  // Si está logueado, sincroniza con backend
  const token = localStorage.getItem('token')
  if (token) {
    try {
      await cartApi.add({
        product_id: product.id,
        quantity:   1,
        size:       product.selectedSize
      })
      // Refetch para obtener el cartItemId real del nuevo registro
      const { cart } = await cartApi.get()
      cartItems.value = formatCartFromBackend(cart)
    } catch (err) {
      console.error('Error añadiendo al carrito:', err)
      showToast('No se pudo añadir. Reintenta.')
      // Rollback
      if (existing) existing.qty -= 1
      else cartItems.value = cartItems.value.filter(
        i => !(i.id === product.id && i.selectedSize === product.selectedSize)
      )
      return
    }
  }

  showToast(`${product.name} añadido`)
}

async function removeFromCart(productId, size) {
  const item = cartItems.value.find(
    i => i.id === productId && i.selectedSize === size
  )
  if (!item) return

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
    await removeFromCart(productId, size)
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
  // Cuando un invitado hace login, sincroniza su carrito local con el backend
  if (!cartItems.value.length) return
  try {
    await cartApi.merge(cartItems.value.map(i => ({
      product_id: i.id,
      quantity:   i.qty,
      size:       i.selectedSize
    })))
    await fetchCart()
  } catch (err) {
    console.error('Error fusionando carrito:', err)
  }
}

// --- Computeds ---
const cartCount = computed(() =>
  cartItems.value.reduce((sum, i) => sum + i.qty, 0)
)

const cartSubtotal = computed(() =>
  cartItems.value.reduce((sum, i) => sum + (i.price * i.qty), 0)
)

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

    // acciones
    fetchCart,
    addToCart,
    removeFromCart,
    updateQty,
    mergeGuestCart,
    showToast,
  }
}
