<template>
  <Dialog :show="show" @close="$emit('close')" size="lg">
    <template #header>
      <h3 class="modal-title">Seleccionar Producto/Servicio</h3>
    </template>

    <div class="product-selector-content">
      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Buscar productos y servicios..."
            class="search-input"
          />
        </div>
        
        <div class="filters">
          <select v-model="categoryFilter" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="PRODUCT">Productos</option>
            <option value="SERVICE">Servicios</option>
            <option value="DIGITAL_SERVICE">Servicios Digitales</option>
            <option value="CONSULTATION">Consultoría</option>
            <option value="RENTAL">Alquiler</option>
          </select>
          
          <select v-model="statusFilter" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" v-if="filteredProducts.length > 0">
        <div 
          v-for="product in paginatedProducts" 
          :key="product.id"
          class="product-card"
          :class="{ 
            'selected': selectedProducts.includes(product.id),
            'inactive': product.status !== 'ACTIVE'
          }"
          @click="selectProduct(product)"
        >
          <div class="product-header">
            <div class="product-avatar" :class="`type-${product.category.toLowerCase()}`">
              {{ getTypeIcon(product.category) }}
            </div>
            <div class="product-status" :class="`status-${product.status.toLowerCase()}`">
              {{ formatStatus(product.status) }}
            </div>
          </div>
          
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-code">Código: {{ product.code }}</div>
          </div>
          
          <div class="product-pricing">
            <div class="price-info">
              <span class="price">{{ formatCurrency(product.unitPrice) }}</span>
              <span class="price-unit">/ {{ formatUnitType(product.unitType) }}</span>
            </div>
            <div class="tax-info">
              <span class="tax-rate">{{ product.taxRate }}% {{ formatTaxType(product.taxType) }}</span>
            </div>
          </div>
          
          <div class="product-actions">
            <button 
              class="btn-select"
              :class="{ 'selected': selectedProducts.includes(product.id) }"
            >
              {{ selectedProducts.includes(product.id) ? 'Seleccionado' : 'Seleccionar' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-products">
        <div class="empty-icon">📦</div>
        <p class="empty-message">
          {{ searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles' }}
        </p>
        <p class="empty-description">
          {{ searchTerm ? 'Intenta ajustar tu búsqueda' : 'Crea tu primer producto para comenzar' }}
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Anterior
        </button>
        
        <span class="pagination-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Siguiente
        </button>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <button @click="$emit('close')" class="btn-secondary">
          Cancelar
        </button>
        <button 
          @click="confirmSelection" 
          class="btn-primary"
          :disabled="selectedProducts.length === 0"
        >
          Agregar {{ selectedProducts.length }} producto{{ selectedProducts.length !== 1 ? 's' : '' }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { Dialog } from '@/components/ui'
import type { Product } from '@/types'

// Props
export interface Props {
  show: boolean
  selectedProducts?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedProducts: () => []
})

// Emits
const emit = defineEmits<{
  close: []
  select: [product: Product]
}>()

// Store
const productsStore = useProductsStore()
const { products } = storeToRefs(productsStore)

// Local state
const searchTerm = ref('')
const categoryFilter = ref('')
const statusFilter = ref('ACTIVE') // Default to active products
const selectedProducts = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(12)

// Computed
const filteredProducts = computed(() => {
  if (!products.value) return []
  
  return products.value.filter(product => {
    const matchesSearch = !searchTerm.value || 
      product.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value
    const matchesStatus = !statusFilter.value || product.status === statusFilter.value
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize.value))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

// Methods
const selectProduct = (product: Product) => {
  if (product.status !== 'ACTIVE') return // Don't allow selection of inactive products
  
  const index = selectedProducts.value.indexOf(product.id)
  if (index === -1) {
    selectedProducts.value.push(product.id)
  } else {
    selectedProducts.value.splice(index, 1)
  }
}

const confirmSelection = () => {
  selectedProducts.value.forEach(productId => {
    const product = products.value?.find(p => p.id === productId)
    if (product) {
      emit('select', product)
    }
  })
  
  // Reset and close
  selectedProducts.value = []
  emit('close')
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

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'DISCONTINUED': 'Descontinuado'
  }
  return statuses[status] || 'Activo'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatUnitType = (unitType: string) => {
  const units: Record<string, string> = {
    'UNIT': 'unidad',
    'HOUR': 'hora',
    'DAY': 'día',
    'MONTH': 'mes',
    'METER': 'metro',
    'KILOGRAM': 'kg',
    'LITER': 'litro',
    'PACKAGE': 'paquete'
  }
  return units[unitType] || 'unidad'
}

const formatTaxType = (taxType: string) => {
  const types: Record<string, string> = {
    'IVA_GENERAL': 'IVA',
    'IVA_REDUCED': 'IVA Red.',
    'IVA_SUPER_REDUCED': 'IVA S.Red.',
    'IVA_EXEMPT': 'Exento',
    'SPECIAL_TAX': 'Esp.'
  }
  return types[taxType] || 'IVA'
}

// Load products when modal opens
watch(() => props.show, (show) => {
  if (show && !products.value?.length) {
    productsStore.fetchProducts()
  }
  
  // Reset state when modal opens
  if (show) {
    selectedProducts.value = [...props.selectedProducts]
    searchTerm.value = ''
    categoryFilter.value = ''
    statusFilter.value = 'ACTIVE'
    currentPage.value = 1
  }
})

// Reset page when filters change
watch([searchTerm, categoryFilter, statusFilter], () => {
  currentPage.value = 1
})
</script>

<script lang="ts">
import '@/styles/components/ProductSelectorModal.css'
</script>
