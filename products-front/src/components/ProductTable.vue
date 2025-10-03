<template>
  <div class="product-table-container">
    <!-- Filters -->
    <div class="filters-card">
      <h3 class="filters-title">Filtros</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Buscar</label>
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Buscar productos..."
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Tipo</label>
          <select v-model="filters.category" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="PRODUCT">Productos</option>
            <option value="SERVICE">Servicios</option>
            <option value="DIGITAL_SERVICE">Servicios Digitales</option>
            <option value="CONSULTATION">Consultoría</option>
            <option value="RENTAL">Alquiler</option>
            <option value="OTHER">Otros</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="DISCONTINUED">Descontinuados</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Empresa</label>
          <select v-model="filters.companyId" class="filter-select">
            <option value="">Todas las empresas</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>
      </div>
      <button v-if="hasActiveFilters" @click="clearFilters" class="btn-clear">
        Limpiar filtros
      </button>
    </div>

      <!-- Loading State -->
      <LoadingState
        v-if="isLoading"
        variant="skeleton"
        title="Cargando productos..."
        description="Obteniendo la información más reciente de tu catálogo"
        skeleton-type="table"
        :skeleton-rows="5"
        :skeleton-columns="6"
      />

      <!-- Error State -->
      <ErrorState
        v-else-if="hasError"
        :type="getErrorType(error)"
        :title="getErrorTitle(error)"
        :description="getErrorDescription(error)"
        :details="typeof error === 'string' ? error : error ? (error as unknown as Error).stack : undefined"
        show-details
        :primary-action="{ label: 'Reintentar' }"
        :secondary-action="{ label: 'Reportar problema' }"
        @primary-action="loadProducts"
        @secondary-action="reportError"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="!hasProducts && !hasActiveFilters"
        title="No hay productos registrados"
        description="Comienza agregando tu primer producto al catálogo para empezar a gestionar tu inventario"
        :primary-action="{ label: 'Agregar primer producto' }"
        @primary-action="handleAddProduct"
      >
        <template #illustration>
          <div class="empty-products-illustration">
            <svg viewBox="0 0 120 120" class="empty-icon">
              <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.2" class="rotate-animation"/>
              <rect x="35" y="40" width="20" height="20" rx="3" fill="currentColor" opacity="0.3" class="float-animation-1"/>
              <rect x="65" y="35" width="20" height="20" rx="3" fill="currentColor" opacity="0.25" class="float-animation-2"/>
              <rect x="50" y="60" width="20" height="20" rx="3" fill="currentColor" opacity="0.2" class="float-animation-3"/>
              <circle cx="85" cy="25" r="8" fill="var(--primary-color)" opacity="0.8" class="pulse-animation"/>
              <path d="M85 21 L85 29 M81 25 L89 25" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </template>
      </EmptyState>

      <!-- No Results State (with filters) -->
      <EmptyState
        v-else-if="!hasProducts && hasActiveFilters"
        title="No se encontraron productos"
        description="No hay productos que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda."
        :primary-action="{ label: 'Limpiar filtros' }"
        @primary-action="clearAllFilters"
      >
        <template #illustration>
          <div class="no-results-illustration">
            <svg viewBox="0 0 120 120" class="empty-icon">
              <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <path d="M45 45 L75 75 M75 45 L45 75" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
              <circle cx="85" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <path d="M95 45 L105 55" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
            </svg>
          </div>
        </template>
      </EmptyState>

      <!-- Products Table -->
      <div v-else class="table-card">
        <div class="table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th>Producto/Servicio</th>
                <th>Código</th>
                <th>Precio Unitario</th>
                <th>Impuesto</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.id">
                <td>
                  <div class="product-cell">
                    <div class="product-avatar" :class="getTypeAvatarClass(product.category)">
                      {{ getTypeIcon(product.category) }}
                    </div>
                    <div>
                      <div class="product-name">{{ product.name || 'Sin nombre' }}</div>
                      <div class="product-company">{{ getCompanyName(product.companyId) }}</div>
                      <div class="product-unit">{{ formatUnitType(product.unitType) }}</div>
                    </div>
                  </div>
                </td>
                <td class="code-cell">
                  <code class="product-code">{{ product.code || 'N/A' }}</code>
                </td>
                <td class="price-cell">
                  ${{ Number(product.unitPrice || 0).toFixed(2) }}
                  <span class="price-tax-excluded">(sin IVA)</span>
                </td>
                <td class="tax-cell">
                  <div class="tax-info">
                    <span class="tax-rate">{{ product.taxRate || 0 }}%</span>
                    <span class="tax-type">{{ formatTaxType(product.taxType) }}</span>
                  </div>
                </td>
                <td>
                  <span class="category-badge" :class="getCategoryClass(product.category)">
                    {{ formatCategory(product.category) }}
                  </span>
                </td>
                <td>
                  <div class="status-container">
                    <span class="status-badge" :class="getStatusBadgeClass(product.status)">
                      {{ formatStatus(product.status) }}
                    </span>
                    <button 
                      @click="toggleStatus(product)" 
                      class="btn-status-toggle"
                      :title="getToggleStatusTitle(product.status)"
                    >
                      {{ getStatusToggleIcon(product.status) }}
                    </button>
                  </div>
                </td>
                <td>
                  <div class="actions-cell">
                    <button @click="handleEdit(product)" class="btn-icon btn-edit" title="Editar">
                      ✏️
                    </button>
                    <button @click="handleCopy(product)" class="btn-icon btn-copy" title="Duplicar">
                      📄
                    </button>
                    <button @click="handleDelete(product)" class="btn-icon btn-delete" title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <div class="pagination-info">
            Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} productos
          </div>
          <div class="pagination-controls">
            <button 
              @click="goToPage(1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              ⏮️
            </button>
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              ◀️
            </button>
            <span class="pagination-current">Página {{ currentPage }} de {{ totalPages }}</span>
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              ▶️
            </button>
            <button 
              @click="goToPage(totalPages)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              ⏭️
            </button>
          </div>
        </div>
      </div>

    <!-- Error Report Modal -->
    <ErrorReportModal
      :show="showErrorReportModal"
      :error="currentError"
      @close="showErrorReportModal = false"
      @success="handleReportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { useCompaniesStore } from '@/stores/companies'
import { LoadingState, ErrorState, EmptyState, ErrorReportModal } from '@/components/ui'
import { errorReportingService } from '@/services/errorReporting'
import { useNotifications } from '@/composables/useNotifications'
import { NotificationType } from '@/types'

// Stores
const productsStore = useProductsStore()
const companiesStore = useCompaniesStore()
const router = useRouter()
const { addNotification } = useNotifications()

const { products, isLoading, hasError, error } = storeToRefs(productsStore)
const { companies } = storeToRefs(companiesStore)

// Local state
const filters = reactive({
  search: '',
  companyId: '',
  category: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)

// Error reporting state
const showErrorReportModal = ref(false)
const currentError = ref<Error | null>(null)

// Computed
const filteredProducts = computed(() => {
  if (!products.value) return []
  
  return products.value.filter(product => {
    const matchesSearch = !filters.search || 
      product.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.code?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesCompany = !filters.companyId || product.companyId === filters.companyId
    const matchesCategory = !filters.category || product.category === filters.category
    const matchesStatus = !filters.status || product.status === filters.status
    
    return matchesSearch && matchesCompany && matchesCategory && matchesStatus
  })
})

const totalItems = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
const startItem = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endItem = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return filters.search || filters.category || filters.companyId || filters.status
})

const hasProducts = computed(() => {
  return filteredProducts.value.length > 0
})

// Methods
const loadProducts = async () => {
  try {
    await productsStore.fetchProducts()
  } catch (err) {
    console.error('Error loading products:', err)
  }
}

const handleEdit = (product: any) => {
  router.push(`/products/${product.id}/edit`)
}

const handleDelete = async (product: any) => {
  const productType = formatCategory(product.category).toLowerCase()
  if (confirm(`¿Eliminar ${productType} "${product.name}"?`)) {
    try {
      await productsStore.deleteProduct(product.id)
      addNotification(
        NotificationType.SUCCESS,
        'Eliminado exitosamente',
        `${formatCategory(product.category)} "${product.name}" eliminado correctamente`
      )
    } catch (err) {
      addNotification(
        NotificationType.ERROR,
        'Error al eliminar',
        `No se pudo eliminar ${productType} "${product.name}"`
      )
    }
  }
}

const handleCopy = async (product: any) => {
  try {
    const duplicatedProduct = {
      ...product,
      name: `${product.name} (Copia)`,
      code: `${product.code}-COPY-${Date.now()}`,
      id: undefined // Remove ID for new product
    }
    
    // Navigate to create form with pre-filled data
    router.push({
      name: 'ProductCreate',
      query: { duplicate: JSON.stringify(duplicatedProduct) }
    })
  } catch (err) {
    addNotification(
      NotificationType.ERROR,
      'Error al duplicar',
      'No se pudo duplicar el producto/servicio'
    )
  }
}

const toggleStatus = async (product: any) => {
  const currentStatus = product.status || 'ACTIVE'
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  
  try {
    await productsStore.updateProduct(product.id, { status: newStatus as any })
    
    const action = newStatus === 'ACTIVE' ? 'activado' : 'desactivado'
    addNotification(
      NotificationType.SUCCESS,
      'Estado actualizado',
      `${formatCategory(product.category)} "${product.name}" ${action} correctamente`
    )
  } catch (err) {
    addNotification(
      NotificationType.ERROR,
      'Error al cambiar estado',
      `No se pudo cambiar el estado de "${product.name}"`
    )
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Error handling methods
const getErrorType = (error: any) => {
  if (!error) return 'general'
  
  const message = error.message?.toLowerCase() || ''
  if (message.includes('network') || message.includes('fetch')) return 'network'
  if (message.includes('server') || message.includes('500')) return 'server'
  if (message.includes('forbidden') || message.includes('403')) return 'forbidden'
  if (message.includes('not found') || message.includes('404')) return 'notfound'
  
  return 'general'
}

const getErrorTitle = (error: any) => {
  const type = getErrorType(error)
  
  const titles = {
    network: 'Problemas de conexión',
    server: 'Error del servidor',
    forbidden: 'Acceso denegado',
    notfound: 'Recurso no encontrado',
    general: 'Error al cargar productos'
  }
  
  return titles[type as keyof typeof titles] || titles.general
}

const getErrorDescription = (error: any) => {
  const type = getErrorType(error)
  
  const descriptions = {
    network: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
    server: 'El servidor está experimentando problemas. Nuestro equipo ha sido notificado.',
    forbidden: 'No tienes permisos suficientes para acceder a esta información.',
    notfound: 'Los datos solicitados no se encuentran disponibles.',
    general: 'Ha ocurrido un error inesperado al cargar los productos. Por favor, intenta nuevamente.'
  }
  
  return descriptions[type as keyof typeof descriptions] || descriptions.general
}

const reportError = async () => {
  if (!error.value || typeof error.value === 'string') {
    addNotification(
      NotificationType.ERROR,
      'No hay error para reportar',
      'No se encontró información del error actual.'
    )
    return
  }

  try {
    // For critical errors, we can send a quick report immediately
    const errorType = getErrorType(error.value)
    
    if (errorType === 'server' || errorType === 'network') {
      // Auto-report critical infrastructure errors
      const reportId = await errorReportingService.reportError(error.value)
      
      if (reportId && reportId !== 'failed-to-send') {
        addNotification(
          NotificationType.SUCCESS,
          'Error reportado automáticamente',
          `Hemos reportado este ${getErrorTypeLabel(errorType).toLowerCase()} automáticamente (ID: ${reportId}).`
        )
        return
      }
    }
    
    // For other errors or if auto-report failed, open the modal
    openErrorReportModal()
    
  } catch (err) {
    console.error('Error in reportError:', err)
    // Fallback to modal
    openErrorReportModal()
  }
}

const openErrorReportModal = () => {
  if (error.value) {
    currentError.value = typeof error.value === 'string' ? new Error(error.value) : error.value
    showErrorReportModal.value = true
  }
}

const handleReportSuccess = (reportId: string) => {
  addNotification(
    NotificationType.SUCCESS,
    'Reporte enviado exitosamente',
    `Tu reporte detallado ha sido enviado (ID: ${reportId}). Te contactaremos si necesitamos más información.`
  )
}

const viewLocalReports = () => {
  const reports = errorReportingService.getLocalReports()
  
  addNotification(
    NotificationType.INFO,
    'Reportes locales',
    `Tienes ${reports.length} reporte(s) guardado(s) localmente. Revisa la consola del navegador para ver los detalles.`
  )
}

const getErrorTypeLabel = (type: string) => {
  const labels = {
    network: 'Error de Conexión',
    server: 'Error del Servidor',
    forbidden: 'Error de Acceso',
    notfound: 'Recurso No Encontrado',
    general: 'Error General'
  }
  
  return labels[type as keyof typeof labels] || 'Error'
}

// Action handlers
const handleAddProduct = () => {
  router.push('/products/new')
}

const clearAllFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.companyId = ''
  filters.status = ''
  currentPage.value = 1
}

// Helper methods for billing system
const formatCategory = (category: string) => {
  if (!category) return 'Otro'
  const categories: Record<string, string> = {
    'PRODUCT': 'Producto',
    'SERVICE': 'Servicio',
    'DIGITAL_SERVICE': 'Servicio Digital',
    'CONSULTATION': 'Consultoría',
    'RENTAL': 'Alquiler',
    'OTHER': 'Otro'
  }
  return categories[category] || 'Otro'
}

function getCategoryClass(category: string): string {
  if (!category) return 'category-other'
  const classes: Record<string, string> = {
    'PRODUCT': 'category-product',
    'SERVICE': 'category-service',
    'DIGITAL_SERVICE': 'category-digital',
    'CONSULTATION': 'category-consultation',
    'RENTAL': 'category-rental',
    'OTHER': 'category-other'
  }
  return classes[category] || 'category-other'
}

const getTypeIcon = (category: string) => {
  const icons: Record<string, string> = {
    'PRODUCT': '📦',
    'SERVICE': '🔧',
    'DIGITAL_SERVICE': '💻',
    'CONSULTATION': '👨‍💼',
    'RENTAL': '🏠',
    'OTHER': '📋'
  }
  return icons[category] || '📋'
}

const getTypeAvatarClass = (category: string) => {
  return `avatar-${category?.toLowerCase() || 'other'}`
}

const formatUnitType = (unitType: string) => {
  if (!unitType) return 'Unidad'
  const units: Record<string, string> = {
    'UNIT': 'Unidad',
    'HOUR': 'Hora',
    'DAY': 'Día',
    'MONTH': 'Mes',
    'METER': 'Metro',
    'KILOGRAM': 'Kg',
    'LITER': 'Litro',
    'PACKAGE': 'Paquete'
  }
  return units[unitType] || 'Unidad'
}

const formatTaxType = (taxType: string) => {
  if (!taxType) return 'IVA'
  const types: Record<string, string> = {
    'IVA_GENERAL': 'IVA General',
    'IVA_REDUCED': 'IVA Reducido',
    'IVA_SUPER_REDUCED': 'IVA Superreducido',
    'IVA_EXEMPT': 'Exento',
    'SPECIAL_TAX': 'Impuesto Especial'
  }
  return types[taxType] || 'IVA'
}

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'DISCONTINUED': 'Descontinuado'
  }
  return statuses[status] || 'Activo'
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'ACTIVE': 'status-active',
    'INACTIVE': 'status-inactive',
    'DISCONTINUED': 'status-discontinued'
  }
  return classes[status] || 'status-active'
}

const getStatusToggleIcon = (status: string) => {
  const currentStatus = status || 'ACTIVE'
  return currentStatus === 'ACTIVE' ? '⏸️' : '▶️'
}

const getToggleStatusTitle = (status: string) => {
  const currentStatus = status || 'ACTIVE'
  return currentStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'
}

const getCompanyName = (companyId: string) => {
  if (!companies.value || !companyId) return 'Sin empresa'
  const company = companies.value.find(c => c.id === companyId)
  return company?.name || 'Empresa no encontrada'
}

const clearFilters = () => {
  filters.search = ''
  filters.companyId = ''
  filters.category = ''
  filters.status = ''
  currentPage.value = 1
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    companiesStore.fetchCompanies(),
    loadProducts()
  ])
})

// Watch for filter changes
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
@import '@/styles/components/ProductTable.css';
</style>