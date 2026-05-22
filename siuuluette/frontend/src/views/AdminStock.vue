<template>
  <div class="admin-stock">
    <header class="admin-page-header">
      <div class="header-inner">
        <div>
          <h1 class="page-title">Gestión de <span class="accent-text">Stock</span></h1>
          <p class="page-subtitle">
            Cada fila es una talla concreta de una prenda. Escribe las unidades disponibles
            y se guarda automáticamente. Una prenda única es, simplemente, stock 1.
          </p>
        </div>
        <div class="header-actions">
          <div v-if="saving" class="saving-indicator">
            <div class="mini-spinner"></div>
            Guardando...
          </div>
          <button @click="fetchProducts" class="premium-refresh-btn" :disabled="loading">
            <svg class="refresh-icon" :class="{ 'refresh-icon--spin': loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span class="refresh-text">{{ loading ? 'Actualizando' : 'Refrescar' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div v-if="loading" class="state-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="error" class="state-container">
        <p class="state-error">{{ error }}</p>
      </div>

      <div v-else class="table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th class="th-product">Prenda</th>
              <th class="th-color">Color</th>
              <th class="th-size">Talla</th>
              <th class="text-center th-units">Unidades</th>
              <th class="th-mode">Modo</th>
              <th class="text-right th-status">Estado</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="product in products" :key="product.id">
              <template v-for="(variant, vIdx) in product.variants" :key="variant.id">
                <tr
                  v-for="(sz, sIdx) in variant.sizes"
                  :key="variant.id + '-' + sz.size"
                  class="stock-row"
                  :class="{ 'row-product-start': vIdx === 0 && sIdx === 0 }"
                >
                  <!-- Prenda (padre): ocupa todas las filas talla del producto -->
                  <td
                    v-if="vIdx === 0 && sIdx === 0"
                    :rowspan="countRows(product)"
                    class="td-product"
                  >
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-collection">{{ product.collection || '—' }}</span>
                  </td>

                  <!-- Color (variante): ocupa todas las tallas de esa variante -->
                  <td
                    v-if="sIdx === 0"
                    :rowspan="variant.sizes.length"
                    class="td-variant"
                  >
                    <div class="color-pill" :style="{ '--variant-color': getColorHex(variant.color_name) }">
                      <span class="color-swatch"></span>
                      <span class="color-name">{{ variant.color_name }}</span>
                    </div>
                  </td>

                  <!-- Talla -->
                  <td class="td-size">
                    <span class="size-badge">{{ sz.size }}</span>
                  </td>

                  <!-- Unidades editables -->
                  <td class="td-stock text-center">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      class="stock-input"
                      :class="{ 'stock-input--zero': isOut(sz) }"
                      :value="sz.stock"
                      :disabled="sz.stock_mode !== 'limited'"
                      :title="sz.stock_mode !== 'limited' ? 'Solo se editan unidades en modo Stock limitado' : ''"
                      @change="onStockChange($event, variant, sz)"
                    />
                  </td>

                  <!-- Modo de stock -->
                  <td class="td-mode">
                    <select
                      class="mode-select"
                      :value="sz.stock_mode"
                      @change="onModeChange($event, variant, sz)"
                    >
                      <option value="limited">Stock limitado</option>
                      <option value="on_demand">Ilimitado</option>
                      <option value="preorder">Preventa</option>
                    </select>
                  </td>

                  <!-- Estado -->
                  <td class="td-status text-right">
                    <span class="status-tag" :class="statusClass(sz)">
                      <span class="status-dot"></span>
                      {{ statusLabel(sz) }}
                    </span>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>

        <p v-if="products.length === 0" class="empty-note">
          No hay productos cargados.
        </p>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { productsApi } from '../api/index.js'

export default {
  name: 'AdminStock',
  setup() {
    const products = ref([])
    const loading  = ref(true)
    const saving   = ref(false)
    const error    = ref(null)

    // Carga todos los productos (admin): cada producto trae sus variantes
    // de color y, dentro, sus tallas con stock. Es el mismo endpoint que
    // usa la pantalla de precios.
    async function fetchProducts() {
      loading.value = true
      error.value = null
      try {
        const { products: data } = await productsApi.getAdminAll()
        products.value = data || []
      } catch (err) {
        error.value = 'Error al cargar el inventario.'
      } finally {
        loading.value = false
      }
    }

    // Nº total de filas (tallas) de un producto, para el rowspan de la
    // celda "Prenda".
    function countRows(product) {
      return (product.variants || []).reduce(
        (n, v) => n + (v.sizes ? v.sizes.length : 0),
        0
      )
    }

    // ¿Esta talla está agotada? (solo tiene sentido en modo 'limited')
    function isOut(sz) {
      return sz.stock_mode === 'limited' && (sz.stock || 0) === 0
    }

    // Guardar las unidades de una talla concreta.
    async function onStockChange(event, variant, sz) {
      const newStock = parseInt(event.target.value, 10)
      if (isNaN(newStock) || newStock < 0) {
        event.target.value = sz.stock   // revertir un valor inválido
        return
      }
      saving.value = true
      try {
        await productsApi.updateStock(variant.id, { size: sz.size, stock: newStock })
        sz.stock = newStock
      } catch (err) {
        alert('No se pudo guardar el stock: ' + err.message)
        event.target.value = sz.stock   // revertir si falla
      } finally {
        saving.value = false
      }
    }

    // Cambiar el modo de stock de una talla (limitado / ilimitado / preventa).
    async function onModeChange(event, variant, sz) {
      const newMode = event.target.value
      saving.value = true
      try {
        await productsApi.updateStock(variant.id, { size: sz.size, stock_mode: newMode })
        sz.stock_mode = newMode
      } catch (err) {
        alert('No se pudo guardar el modo: ' + err.message)
        event.target.value = sz.stock_mode
      } finally {
        saving.value = false
      }
    }

    function statusLabel(sz) {
      if (sz.stock_mode === 'on_demand') return 'Ilimitado'
      if (sz.stock_mode === 'preorder')  return 'Preventa'
      return (sz.stock || 0) > 0 ? `${sz.stock} disponibles` : 'AGOTADO'
    }

    function statusClass(sz) {
      if (sz.stock_mode === 'on_demand') return 'status-tag--unlimited'
      if (sz.stock_mode === 'preorder')  return 'status-tag--preorder'
      return (sz.stock || 0) > 0 ? 'status-tag--ok' : 'status-tag--out'
    }

    // Color aproximado para el círculo de la variante (mismo criterio que
    // la pantalla de precios).
    function getColorHex(name) {
      const n = (name || '').toLowerCase()
      if (n.includes('negra') || n.includes('negro'))   return '#1a1a1a'
      if (n.includes('blanca') || n.includes('blanco')) return '#ffffff'
      if (n.includes('azul'))                           return '#2d4a8a'
      if (n.includes('roja') || n.includes('rojo'))     return '#a32a2a'
      if (n.includes('gris'))                           return '#808080'
      if (n.includes('crema'))                          return '#f5f5dc'
      if (n.includes('beige'))                          return '#d1bc8a'
      if (n.includes('verde'))                          return '#2d5a27'
      if (n.includes('/'))                              return 'linear-gradient(to right, #fff 50%, #000 50%)'
      return '#dddddd'
    }

    onMounted(fetchProducts)

    return {
      products, loading, saving, error,
      fetchProducts, countRows, isOut,
      onStockChange, onModeChange,
      statusLabel, statusClass, getColorHex
    }
  }
}
</script>

<style scoped>
.admin-stock {
  background-color: var(--c-black);
  min-height: 100vh;
  color: #3d362f;
  font-family: 'Inter', system-ui, sans-serif;
}

/* --- Header --- */
.admin-page-header {
  background-color: var(--c-dark);
  border-bottom: 1px solid var(--c-dark-2);
  padding: 2.5rem 0;
  margin-bottom: 2rem;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-title {
  font-family: var(--font-display, serif);
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #3d362f;
}

.accent-text { color: #d4af37; }

.page-subtitle {
  margin-top: 0.6rem;
  max-width: 540px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #8c8276;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-shrink: 0;
}

.premium-refresh-btn {
  background: var(--c-gold);
  color: var(--c-black);
  border: 1px solid var(--c-gold);
  padding: 0.7rem 1.4rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.premium-refresh-btn:disabled { opacity: 0.6; cursor: default; }
.refresh-icon--spin { animation: spin 1s infinite linear; }

.saving-indicator {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #d4af37;
  font-size: 0.8rem;
  font-weight: 600;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #5a5040;
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* --- Main / tabla --- */
.admin-main {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 2rem 5rem;
}

.state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6rem 0;
}

.loading-spinner {
  width: 38px;
  height: 38px;
  border: 3px solid #5a5040;
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.state-error { color: #e88; font-size: 0.9rem; }

.table-container {
  background: #fbfaf9;
  border: 1px solid #d5cfc5;
  border-radius: 2px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th {
  background: var(--c-dark);
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #836e4e;
  border-bottom: 1px solid #d5cfc5;
  white-space: nowrap;
}

.inventory-table td {
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #e8e4de;
  vertical-align: middle;
}

.stock-row:hover { background-color: #f4f1ec; }
.stock-row.row-product-start td { border-top: 2px solid #c9c2b5; }

/* --- Celda Prenda --- */
.td-product {
  background: #f5f3f0;
  border-right: 1px solid #e8e4de;
  width: 240px;
}

.product-name {
  display: block;
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  font-weight: 600;
  color: #3d362f;
}

.product-collection {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #a59c8e;
}

/* --- Celda Color --- */
.td-variant {
  border-right: 1px solid #e8e4de;
  background: #fdfcfb;
}

.color-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.4rem 0.85rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 30px;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--variant-color);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.color-name { font-size: 0.85rem; font-weight: 600; }

/* --- Talla --- */
.size-badge {
  display: inline-block;
  min-width: 42px;
  text-align: center;
  padding: 0.3rem 0.6rem;
  background: #ece8e1;
  border: 1px solid #d5cfc5;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #3d362f;
}

/* --- Input de unidades --- */
.stock-input {
  width: 90px;
  background: white;
  border: 1px solid #d5cfc5;
  padding: 0.5rem;
  border-radius: 2px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  color: #3d362f;
}

.stock-input:focus { outline: none; border-color: var(--c-gold); }
.stock-input:disabled { background: #f1efea; color: #b3aa9c; cursor: not-allowed; }

.stock-input--zero {
  border-color: #e0a9a9;
  background: #fdf2f2;
  color: #c81e1e;
}

/* --- Selector de modo --- */
.mode-select {
  background: white;
  border: 1px solid #d5cfc5;
  padding: 0.5rem 0.6rem;
  border-radius: 2px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #3d362f;
  cursor: pointer;
}

.mode-select:focus { outline: none; border-color: var(--c-gold); }

/* --- Estado --- */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-tag--ok        { background: #e7efe5; color: #3a7d36; }
.status-tag--out       { background: #fdf2f2; color: #c81e1e; }
.status-tag--unlimited { background: #eef0f5; color: #4a5a8a; }
.status-tag--preorder  { background: #f6efe2; color: #9a7b2e; }

.empty-note {
  padding: 3rem;
  text-align: center;
  color: #a59c8e;
  font-size: 0.9rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
.text-right  { text-align: right; }
.text-center { text-align: center; }

@media (max-width: 768px) {
  .header-inner { flex-direction: column; }
  .td-product { width: auto; }
}
</style>
