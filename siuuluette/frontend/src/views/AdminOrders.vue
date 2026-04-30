<template>
  <div class="admin-orders">
    <header class="admin-page-header">
      <div class="header-inner">
        <h1 class="page-title">Gestión de <span class="accent-text">Pedidos</span></h1>
        <div class="header-actions">
          <button @click="fetchOrders" class="premium-refresh-btn" :disabled="loading">
            <svg class="refresh-icon" :class="{ 'refresh-icon--spin': loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span class="refresh-text">{{ loading ? 'Cargando' : 'Refrescar Pedidos' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <!-- Tarjetas de Métricas -->
      <div v-if="!loading && orders.length > 0" class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Ingresos Totales</span>
          <span class="metric-value">{{ totalRevenue.toFixed(2) }}€</span>
          <div class="metric-footer">Suma de todos los pedidos</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Pedidos Totales</span>
          <span class="metric-value">{{ orders.length }}</span>
          <div class="metric-footer">Ventas cerradas con éxito</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Ticket Medio</span>
          <span class="metric-value">{{ averageTicket.toFixed(2) }}€</span>
          <div class="metric-footer">Gasto promedio por cliente</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Pendientes Envío</span>
          <span class="metric-value">{{ pendingOrders }}</span>
          <div class="metric-footer">Pedidos listos para mandar</div>
        </div>
      </div>

      <div v-if="loading" class="state-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <p>No hay pedidos registrados en la tienda todavía.</p>
      </div>

      <div v-else class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Artículos</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="order-row">
              <td class="td-id">#{{ order.id }}</td>
              <td class="td-date">{{ formatDate(order.created_at) }}</td>
              <td class="td-customer">
                <div class="customer-info" v-if="order.shipping_address">
                  <!-- Parseamos el JSON de shipping_address para sacar el nombre -->
                  <span class="customer-name">{{ parseShipping(order.shipping_address).name || 'Invitado' }}</span>
                  <span class="customer-email">{{ parseShipping(order.shipping_address).email || '-' }}</span>
                </div>
              </td>
              <td class="td-total">{{ order.total_amount.toFixed(2) }}€</td>
              <td class="td-status">
                <select 
                  :value="order.status" 
                  @change="updateStatus(order.id, $event.target.value)"
                  class="status-select"
                  :class="'status--' + order.status"
                >
                  <option value="paid">Pagado</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </td>
              <td class="td-items">
                <div class="items-summary">
                  <span v-for="(item, idx) in order.order_items" :key="idx" class="item-pill">
                    {{ item.quantity }}x {{ item.variant?.product?.name || 'Producto' }} ({{ item.size }})
                  </span>
                </div>
              </td>
              <td class="td-actions text-right">
                <button @click="downloadInvoice(order.id)" class="btn-action" title="Descargar Factura">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Factura
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { adminApi } from '../api/index.js'

export default {
  name: 'AdminOrders',
  setup() {
    const orders = ref([])
    const loading = ref(true)

    // Métricas Computadas
    const totalRevenue = computed(() => {
      return orders.value
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total_amount, 0)
    })

    const averageTicket = computed(() => {
      const paidOrders = orders.value.filter(o => o.status !== 'cancelled')
      return paidOrders.length > 0 ? totalRevenue.value / paidOrders.length : 0
    })

    const pendingOrders = computed(() => {
      return orders.value.filter(o => o.status === 'paid').length
    })

    const fetchOrders = async () => {
      loading.value = true
      try {
        const data = await adminApi.getOrders()
        orders.value = data.orders
      } catch (err) {
        console.error('Error fetching orders:', err)
        alert('No se pudieron cargar los pedidos')
      } finally {
        loading.value = false
      }
    }

    const updateStatus = async (orderId, newStatus) => {
      try {
        await adminApi.updateOrder(orderId, newStatus)
        const order = orders.value.find(o => o.id === orderId)
        if (order) order.status = newStatus
      } catch (err) {
        alert('Error al actualizar el estado')
      }
    }

    const downloadInvoice = (orderId) => {
      const url = adminApi.getInvoiceUrl(orderId)
      window.open(url, '_blank')
    }

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const parseShipping = (address) => {
      if (!address) return {}
      if (typeof address === 'string') {
        try {
          return JSON.parse(address)
        } catch (e) {
          return {}
        }
      }
      return address
    }

    onMounted(fetchOrders)

    return {
      orders,
      loading,
      fetchOrders,
      updateStatus,
      downloadInvoice,
      formatDate,
      parseShipping,
      totalRevenue,
      averageTicket,
      pendingOrders
    }
  }
}
</script>

<style scoped>
.admin-orders {
  background-color: var(--c-black);
  min-height: 100vh;
  color: #3d362f;
  font-family: 'Inter', system-ui, sans-serif;
}

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
  align-items: center;
}

.page-title {
  font-family: var(--font-display, serif);
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.accent-text { color: #d4af37; }

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

.admin-main {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 2rem 5rem;
}

/* --- Metrics Grid --- */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.metric-card {
  background: white;
  padding: 1.8rem;
  border-radius: 4px;
  border: 1px solid #d5cfc5;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #836e4e;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.metric-value {
  font-family: var(--font-display, serif);
  font-size: 2.2rem;
  color: #3d362f;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-footer {
  font-size: 0.75rem;
  color: #8a817c;
}

.table-container {
  background: #fbfaf9;
  border: 1px solid #d5cfc5;
  border-radius: 2px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background: var(--c-dark);
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #836e4e;
  border-bottom: 1px solid #d5cfc5;
}

.order-row:hover { background-color: #f4f1ec; }

.orders-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #e8e4de;
  vertical-align: middle;
}

.customer-info { display: flex; flex-direction: column; }
.customer-name { font-weight: 600; color: #3d362f; }
.customer-email { font-size: 0.75rem; color: #8a817c; }

.status-select {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid transparent;
  cursor: pointer;
}

.status--paid { background-color: #e6f4ea; color: #1e7e34; }
.status--shipped { background-color: #e8f0fe; color: #1a73e8; }
.status--delivered { background-color: #fce8e6; color: #d93025; background-color: #e6f4ea; color: #1e7e34; border: 1px solid #1e7e34; }
.status--cancelled { background-color: #f1f3f4; color: #5f6368; }

.items-summary { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.item-pill {
  background: #eae6d4;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #836e4e;
  border: 1px solid #d5cfc5;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d5cfc5;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3d362f;
  transition: all 0.2s;
}

.btn-action:hover {
  background: var(--c-dark);
  border-color: var(--c-gold);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #d5cfc5;
  border-top-color: #836e4e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 4rem auto;
}

@keyframes spin { to { transform: rotate(360deg); } }
.text-right { text-align: right; }
</style>
