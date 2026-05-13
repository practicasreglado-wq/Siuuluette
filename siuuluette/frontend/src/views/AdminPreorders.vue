<template>
  <div class="admin-preorders">
    <header class="admin-page-header">
      <div class="header-inner">
        <h1 class="page-title">Gestión de <span class="accent-text">Reservas</span></h1>
        <div class="header-actions">
          <button @click="fetchPreorders" class="premium-refresh-btn" :disabled="loading">
            <svg class="refresh-icon" :class="{ 'refresh-icon--spin': loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span class="refresh-text">{{ loading ? 'Cargando' : 'Refrescar Reservas' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div v-if="loading" class="state-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="preorders.length === 0" class="empty-state">
        <div class="empty-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <p>No hay reservas registradas todavía.</p>
        </div>
      </div>

      <div v-else class="table-container">
        <table class="preorders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Email de Contacto</th>
              <th>Usuario Registrado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="preorder in preorders" :key="preorder.id" class="preorder-row">
              <td class="td-id">#{{ preorder.id.slice(0, 8) }}</td>
              <td class="td-date">{{ formatDate(preorder.created_at) }}</td>
              <td class="td-product">
                <span class="product-badge">{{ preorder.product_name }}</span>
              </td>
              <td class="td-email">{{ preorder.email }}</td>
              <td class="td-user">
                <span v-if="preorder.user_id" class="user-link">ID: {{ preorder.user_id.slice(0, 8) }}</span>
                <span v-else class="guest-tag">Invitado</span>
              </td>
              <td class="td-status">
                <span class="status-pill" :class="'status--' + preorder.status">
                  {{ preorder.status === 'pending' ? 'Pendiente' : preorder.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { adminApi } from '../api/index.js'

export default {
  name: 'AdminPreorders',
  setup() {
    const preorders = ref([])
    const loading = ref(true)

    const fetchPreorders = async () => {
      loading.value = true
      try {
        const data = await adminApi.getPreorders()
        preorders.value = data.preorders
      } catch (err) {
        console.error('Error fetching preorders:', err)
      } finally {
        loading.value = false
      }
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

    onMounted(fetchPreorders)

    return {
      preorders,
      loading,
      fetchPreorders,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-preorders {
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

.refresh-icon--spin {
  animation: spin 1s linear infinite;
}

.admin-main {
  max-width: 1400px;
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

.preorders-table {
  width: 100%;
  border-collapse: collapse;
}

.preorders-table th {
  background: var(--c-dark);
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #836e4e;
  border-bottom: 1px solid #d5cfc5;
}

.preorder-row:hover { background-color: #f4f1ec; }

.preorders-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #e8e4de;
  vertical-align: middle;
}

.product-badge {
  background: #eae6d4;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #836e4e;
  border: 1px solid #d5cfc5;
}

.status-pill {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status--pending {
  background: #fff8e1;
  color: #f57f17;
  border: 1px solid #ffe082;
}

.user-link {
  font-family: monospace;
  font-size: 0.8rem;
  color: #1a73e8;
}

.guest-tag {
  font-size: 0.75rem;
  color: #8a817c;
  font-style: italic;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.empty-card {
  text-align: center;
  padding: 4rem;
  background: #fbfaf9;
  border: 2px dashed #d5cfc5;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.empty-card p {
  margin-top: 1.5rem;
  color: #8a817c;
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
</style>
