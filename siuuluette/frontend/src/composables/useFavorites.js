// frontend/src/composables/useFavorites.js
//
// Estado de favoritos compartido entre vistas.
// - Logueado: persiste en Supabase vía /api/favorites.
// - Invitado: persiste en localStorage para no perder la wishlist al recargar.

import { ref, computed } from 'vue'
import { favoritesApi } from '../api/index.js'

// --- Estado compartido (module-scoped) ---
const favoriteIds = ref(new Set()) // Set<number> de product_id

// --- Helpers ---
function loadGuestFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem('favorites') || '[]')
    favoriteIds.value = new Set(raw.map(Number))
  } catch {
    favoriteIds.value = new Set()
  }
}

function saveGuestFavorites() {
  localStorage.setItem('favorites', JSON.stringify([...favoriteIds.value]))
}

function isLogged() {
  return !!localStorage.getItem('token')
}

// --- Acciones ---
async function fetchFavorites() {
  if (!isLogged()) {
    loadGuestFavorites()
    return
  }
  try {
    const { favorites } = await favoritesApi.list()
    favoriteIds.value = new Set((favorites || []).map(f => f.product_id))
  } catch (err) {
    console.error('Error cargando favoritos:', err)
  }
}

function isFavorite(productId) {
  return favoriteIds.value.has(Number(productId))
}

async function toggleFavorite(productId) {
  const id = Number(productId)
  const wasFav = favoriteIds.value.has(id)

  // Optimista
  if (wasFav) favoriteIds.value.delete(id)
  else        favoriteIds.value.add(id)
  // Forzar reactividad sobre el Set
  favoriteIds.value = new Set(favoriteIds.value)

  if (isLogged()) {
    try {
      if (wasFav) await favoritesApi.remove(id)
      else        await favoritesApi.add(id)
    } catch (err) {
      console.error('Error sincronizando favorito:', err)
      // Rollback
      if (wasFav) favoriteIds.value.add(id)
      else        favoriteIds.value.delete(id)
      favoriteIds.value = new Set(favoriteIds.value)
    }
  } else {
    saveGuestFavorites()
  }
}

// --- Computeds ---
const favoritesCount = computed(() => favoriteIds.value.size)

// --- Composable público ---
export function useFavorites() {
  return {
    favoriteIds,
    favoritesCount,
    fetchFavorites,
    isFavorite,
    toggleFavorite,
  }
}
