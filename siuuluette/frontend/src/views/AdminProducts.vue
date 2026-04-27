<template>
  <div class="admin-products">
    <header class="admin-page-header">
      <div class="header-inner">
        <h1 class="page-title">Gestión de <span class="accent-text">Precios y Descuentos</span></h1>
        <div class="header-actions">
          <div v-if="saving" class="saving-indicator">
            <div class="mini-spinner"></div>
            Sincronizando...
          </div>
          <button @click="fetchProducts" class="premium-refresh-btn" :disabled="loading">
            <svg class="refresh-icon" :class="{ 'refresh-icon--spin': loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span class="refresh-text">{{ loading ? 'Actualizando' : 'Refrescar Datos' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div v-if="loading" class="state-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else class="table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th class="th-product">Producto (Precio Base)</th>
              <th class="th-collection">Colección</th>
              <th>Variante (Override)</th>
              <th class="text-right">Neto (€)</th>
              <th class="text-right">Bruto (IVA)</th>
              <th class="text-center">Dte. (%)</th>
              <th class="text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="product in products" :key="product.id">
              <tr v-for="(variant, vIdx) in product.variants" :key="variant.id" 
                class="inventory-row" 
                :class="{ 'first-variant': vIdx === 0 }"
              >
                <!-- Celda de Producto (Control del Padre) -->
                <td v-if="vIdx === 0" :rowspan="product.variants.length" class="td-product">
                  <div class="product-header-cell">
                    <span class="product-name">{{ product.name }}</span>
                    <div class="base-price-control">
                      <span class="label">P. Base Neto</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        class="base-price-input" 
                        :value="product.price_net"
                        @change="onBasePriceChange($event, product)"
                      />
                    </div>
                  </div>
                </td>

                <td v-if="vIdx === 0" :rowspan="product.variants.length" class="td-collection">
                  <span class="collection-name">{{ product.collection }}</span>
                </td>
                
                <td class="td-variant">
                  <div class="color-pill" :style="{ '--variant-color': getColorHex(variant.color_name) }">
                    <span class="color-swatch-large"></span>
                    <span class="color-name-label">{{ variant.color_name }}</span>
                  </div>
                </td>
                
                <td class="td-price text-right">
                  <div class="price-input-wrapper">
                    <input 
                      type="number" 
                      step="0.01"
                      class="price-input"
                      :class="{ 'price-input--inherited': !variant.price_net_override }"
                      :placeholder="product.price_net"
                      :value="variant.price_net_override || ''"
                      @change="onVariantPriceChange($event, product, variant)"
                    />
                    <span v-if="!variant.price_net_override" class="inheritance-tag">Heredado</span>
                  </div>
                </td>

                <td class="td-price text-right">
                  <span class="price-val price-val--gross">
                    {{ formatPrice((variant.price_net_override || product.price_net) * 1.21) }}€
                  </span>
                </td>
                
                <td v-if="vIdx === 0" :rowspan="product.variants.length" class="td-discount text-center">
                  <div class="discount-edit">
                    <span class="symbol">%</span>
                    <input 
                      type="number"
                      class="discount-input"
                      :value="product.discount_percent"
                      @change="onDiscountChange($event, product)"
                    />
                  </div>
                </td>

                <td v-if="vIdx === 0" :rowspan="product.variants.length" class="td-status text-right">
                   <div class="status-box" :class="{ 'status-box--sale': product.discount_percent > 0 }">
                     <span class="status-dot"></span>
                     <span class="status-text">{{ product.discount_percent > 0 ? 'Oferta' : 'Venta' }}</span>
                   </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { productsApi } from '../api/index.js'

export default {
  name: 'AdminProducts',
  setup() {
    const products = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const error = ref(null)

    async function fetchProducts() {
      loading.value = true
      try {
        const { products: data } = await productsApi.getAdminAll()
        products.value = data
      } catch (err) {
        error.value = 'Error al cargar los productos.'
      } finally {
        loading.value = false
      }
    }

    async function onBasePriceChange(event, product) {
      const newNet = parseFloat(event.target.value)
      if (isNaN(newNet)) return

      saving.value = true
      try {
        const newGross = +(newNet * 1.21).toFixed(2)
        await productsApi.update(product.id, {
          price_net: newNet,
          price_gross: newGross
        })
        product.price_net = newNet
        product.price_gross = newGross
      } catch (err) {
        alert('Error al guardar el precio base')
      } finally {
        saving.value = false
      }
    }

    async function onVariantPriceChange(event, product, variant) {
      const val = event.target.value
      const newNet = val === '' ? null : parseFloat(val)

      saving.value = true
      try {
        let newGross = null
        if (newNet !== null) {
          newGross = +(newNet * 1.21).toFixed(2)
        }

        await productsApi.updateVariant(variant.id, {
          price_net_override: newNet,
          price_gross_override: newGross
        })
        
        variant.price_net_override = newNet
        variant.price_gross_override = newGross
      } catch (err) {
        alert('Error al guardar el precio de variante')
      } finally {
        saving.value = false
      }
    }

    async function onDiscountChange(event, product) {
      const newDisc = parseInt(event.target.value)
      if (isNaN(newDisc)) return

      saving.value = true
      try {
        await productsApi.update(product.id, { discount_percent: newDisc })
        product.discount_percent = newDisc
      } catch (err) {
        alert('Error al guardar el descuento')
      } finally {
        saving.value = false
      }
    }

    function formatPrice(val) {
      return parseFloat(val || 0).toFixed(2)
    }

    function getColorHex(name) {
      const n = name.toLowerCase();
      if (n.includes('negra') || n.includes('negro')) return '#1a1a1a';
      if (n.includes('blanca') || n.includes('blanco')) return '#ffffff';
      if (n.includes('azul')) return '#2d4a8a';
      if (n.includes('roja') || n.includes('rojo')) return '#a32a2a';
      if (n.includes('gris')) return '#808080';
      if (n.includes('crema')) return '#f5f5dc';
      if (n.includes('beige')) return '#d1bc8a';
      if (n.includes('verde')) return '#2d5a27';
      if (n.includes('/')) return 'linear-gradient(to right, #fff 50%, #000 50%)';
      return '#dddddd';
    }

    onMounted(fetchProducts)

    return { products, loading, saving, error, fetchProducts, formatPrice, getColorHex, onBasePriceChange, onVariantPriceChange, onDiscountChange }
  }
}
</script>

<style scoped>
.admin-products {
  background-color: #f0ede8;
  min-height: 100vh;
  padding-top: 100px;
  color: #3d362f;
  font-family: 'Inter', system-ui, sans-serif;
}

/* --- Header Section --- */
.admin-page-header {
  background-color: #eae6d4;
  border-bottom: 1px solid #d5cfc5;
  padding: 2.5rem 0;
  margin-bottom: 2rem;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-family: var(--font-display, serif);
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #3d362f;
}

.accent-text { color: #d4af37; }

/* --- Premium Refresh Button --- */
.premium-refresh-btn {
  background: #3d362f;
  color: #f0ede8;
  border: 1px solid #3d362f;
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

.refresh-icon--spin { animation: spin 1s infinite linear; }

/* --- Table & Cells --- */
.admin-main {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 2rem 5rem;
}

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
  background: #eae6d4;
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #836e4e;
  border-bottom: 1px solid #d5cfc5;
}

.inventory-row { transition: background 0.2s; }
.inventory-row.first-variant { border-top: 2px solid #d5cfc5; }
.inventory-row:hover { background-color: #f4f1ec; }

.inventory-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e8e4de;
  vertical-align: middle;
}

/* --- Control de Producto Padre --- */
.td-product {
  background: #f5f3f0;
  border-right: 1px solid #e8e4de;
  width: 280px;
}

.product-header-cell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-name {
  font-family: var(--font-display, serif);
  font-size: 1.15rem;
  font-weight: 600;
  color: #3d362f;
}

.base-price-control {
  background: #eae6d4;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #d5cfc5;
}

.base-price-control .label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #836e4e;
  margin-bottom: 0.3rem;
}

.base-price-input {
  width: 100%;
  background: white;
  border: 1px solid #d5cfc5;
  padding: 0.4rem;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #3d362f;
  border-radius: 2px;
}

/* --- Variantes & Precios --- */
.price-input-wrapper {
  position: relative;
  display: inline-block;
}

.price-input {
  background: white;
  border: 1px solid #d5cfc5;
  padding: 0.5rem;
  border-radius: 2px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3d362f;
  width: 85px;
  text-align: right;
}

.price-input--inherited {
  background: #f9f8f6;
  border-style: dashed;
  color: #8c8276;
}

.inheritance-tag {
  position: absolute;
  top: -15px;
  right: 0;
  font-size: 0.55rem;
  text-transform: uppercase;
  color: #c0b9af;
  letter-spacing: 0.05em;
}

.price-val--gross {
  color: #8c8276;
  font-size: 0.9rem;
  font-weight: 600;
}

/* --- Color Pill --- */
.color-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.4rem 0.8rem;
  background: rgba(0,0,0,0.03);
  border-radius: 30px;
}

.color-swatch-large {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--variant-color);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.color-name-label { font-size: 0.85rem; font-weight: 600; }

/* --- Otros --- */
.discount-edit { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.discount-input { width: 55px; text-align: center; background: #fdf2f2; border: 1px solid #f0ddd8; color: #c81e1e; padding: 0.4rem; font-weight: 700; }

.status-box { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.8rem; background: #e5e0d8; border-radius: 20px; }
.status-box--sale { background: #fdf2f2; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #8c8276; }
.status-box--sale .status-dot { background: #d4af37; box-shadow: 0 0 8px #d4af37; }
.status-text { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: #836e4e; }

.saving-indicator { display: flex; align-items: center; gap: 0.6rem; color: #836e4e; font-size: 0.8rem; font-weight: 600; }
.mini-spinner { width: 14px; height: 14px; border: 2px solid #d5cfc5; border-top-color: #836e4e; border-radius: 50%; animation: spin 0.8s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>
