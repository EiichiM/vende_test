<template>
  <div class="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 font-medium">Cargando datos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data || data.length === 0" class="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
      <EmptyState 
        title="No hay datos disponibles" 
        message="No se encontraron elementos para mostrar" 
      />
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Enhanced Header -->
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr class="divide-x divide-gray-200">
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="[
                'px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors duration-200' : '',
                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
              ]"
              @click="column.sortable && handleSort(column.key)"
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold">{{ column.label }}</span>
                <div v-if="column.sortable" class="ml-2 flex flex-col">
                  <svg class="w-3 h-3 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 7l5-5 5 5H5z"/>
                  </svg>
                  <svg class="w-3 h-3 text-gray-400 hover:text-gray-600 -mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 13l-5 5-5-5h10z"/>
                  </svg>
                </div>
              </div>
            </th>
            <th v-if="actions && actions.length > 0" class="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
                Acciones
              </div>
            </th>
          </tr>
        </thead>

        <!-- Enhanced Body -->
        <tbody class="bg-white divide-y divide-gray-100">
          <tr 
            v-for="(item, index) in data" 
            :key="getItemKey(item, index)"
            class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              :class="[
                'px-6 py-6 border-r border-gray-100 last:border-r-0',
                column.align === 'center' ? 'text-center' : 
                column.align === 'right' ? 'text-right' : 'text-left'
              ]"
            >
              <!-- Product Name with enhanced styling -->
              <div v-if="column.key === 'name'" class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span class="text-sm font-bold text-white">
                      {{ getInitials(getColumnValue(item, column)) }}
                    </span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ getColumnValue(item, column) }}</p>
                  <p v-if="item.sku" class="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    {{ item.sku }}
                  </p>
                </div>
              </div>

              <!-- Description with truncation -->
              <div v-else-if="column.key === 'description'" class="max-w-xs">
                <p class="text-sm text-gray-700 leading-5" :title="getColumnValue(item, column)">
                  {{ truncateText(getColumnValue(item, column), 60) }}
                </p>
              </div>

              <!-- Enhanced Price display -->
              <div v-else-if="column.key === 'price'" class="text-right">
                <div class="inline-flex flex-col items-end">
                  <span class="text-lg font-bold text-gray-900">{{ formatPrice(getColumnValue(item, column)) }}</span>
                  <span class="text-xs text-gray-500 uppercase tracking-wide">{{ item.currency || 'USD' }}</span>
                </div>
              </div>

              <!-- Enhanced Category badges -->
              <div v-else-if="column.key === 'category'">
                <span :class="getCategoryClass(getColumnValue(item, column))">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                  </svg>
                  {{ formatCategory(getColumnValue(item, column)) }}
                </span>
              </div>

              <!-- Enhanced Stock display -->
              <div v-else-if="column.key === 'stockQuantity'" class="text-center">
                <div class="flex flex-col items-center space-y-1">
                  <div class="flex items-center space-x-2">
                    <div :class="getStockIndicatorClass(getColumnValue(item, column))" class="w-3 h-3 rounded-full"></div>
                    <span :class="getStockClass(getColumnValue(item, column))">
                      {{ getColumnValue(item, column) || 0 }} unidades
                    </span>
                  </div>
                  <div v-if="item.isLowStock" class="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                    <svg class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-xs font-medium text-red-600">Stock bajo</span>
                  </div>
                </div>
              </div>

              <!-- Enhanced Status badges -->
              <div v-else-if="column.key === 'status'">
                <span :class="getStatusClass(getColumnValue(item, column))">
                  <span class="flex items-center">
                    <span :class="getStatusDotClass(getColumnValue(item, column))" class="w-2 h-2 rounded-full mr-2"></span>
                    {{ formatStatus(getColumnValue(item, column)) }}
                  </span>
                </span>
              </div>

              <!-- Default column display -->
              <div v-else class="text-sm text-gray-700 font-medium">
                {{ getColumnValue(item, column) }}
              </div>
            </td>

            <!-- Enhanced Actions Column -->
            <td v-if="actions && actions.length > 0" class="px-6 py-6 text-center">
              <div class="flex justify-center space-x-1">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  :class="getActionClass(action)"
                  :disabled="action.disabled?.(item) || loading"
                  :title="action.label"
                  @click="handleAction(action.key, item)"
                >
                  <!-- Edit Icon -->
                  <svg v-if="action.key === 'edit'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  <!-- Delete Icon -->
                  <svg v-else-if="action.key === 'delete'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  <!-- View Icon -->
                  <svg v-else-if="action.key === 'view'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <!-- Default Icon -->
                  <component 
                    v-else-if="typeof action.icon === 'object'" 
                    :is="action.icon" 
                    class="w-4 h-4" 
                  />
                  <span v-else class="text-xs">{{ action.icon }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Enhanced Table Footer -->
    <div v-if="data && data.length > 0" class="bg-gray-50 px-6 py-3 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-medium">{{ data.length }} elemento{{ data.length !== 1 ? 's' : '' }} mostrado{{ data.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-gray-500">Última actualización: {{ new Date().toLocaleTimeString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LoadingSpinner, EmptyState } from './index'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  formatter?: (value: any) => string
}

export interface TableAction {
  key: string
  label: string
  icon: string | object
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: (item: any) => boolean
}

export interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  actions?: TableAction[]
  keyField?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  actions: () => [],
  keyField: 'id'
})

const emit = defineEmits<{
  sort: [field: string, direction: 'asc' | 'desc']
  action: [actionKey: string, item: any]
}>()

// Methods
const getItemKey = (item: any, index: number): string => {
  return item[props.keyField] || `item-${index}`
}

const getColumnValue = (item: any, column: TableColumn): any => {
  const value = item[column.key]
  return column.formatter ? column.formatter(value) : value
}

const handleSort = (field: string) => {
  emit('sort', field, 'asc') // Simple implementation, could be enhanced
}

const handleAction = (actionKey: string, item: any) => {
  emit('action', actionKey, item)
}

const getActionClass = (action: TableAction): string => {
  const baseClasses = 'p-2 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  switch (action.variant) {
    case 'primary':
      return `${baseClasses} text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 focus:ring-indigo-500`
    case 'danger':
      return `${baseClasses} text-red-600 hover:text-red-800 hover:bg-red-100 focus:ring-red-500`
    default:
      return `${baseClasses} text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500`
  }
}

// New helper methods
const getInitials = (name: string): string => {
  if (!name) return '?'
  return name.split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getStockIndicatorClass = (quantity: number): string => {
  if (quantity === 0) return 'bg-red-500'
  if (quantity < 10) return 'bg-yellow-500'
  return 'bg-green-500'
}

// Formatting helpers
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price || 0)
}

const formatCategory = (category: string): string => {
  if (!category) return 'Otra'
  return category.replace('_', ' ')
}

const formatStatus = (status: string): string => {
  return status === 'DRAFT' ? 'Borrador' : 'Activo'
}

const getCategoryClass = (category: string): string => {
  const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 shadow-sm'
  
  switch (category) {
    case 'ELECTRONICS':
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`
    case 'HOME_GARDEN':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
    case 'CLOTHING':
      return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`
    case 'BOOKS':
      return `${baseClasses} bg-indigo-100 text-indigo-800 border border-indigo-200`
    case 'SPORTS':
      return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`
  }
}

const getStockClass = (quantity: number): string => {
  if (quantity === 0) return 'text-sm font-bold text-red-700'
  if (quantity < 10) return 'text-sm font-bold text-yellow-700'
  return 'text-sm font-bold text-green-700'
}

const getStatusClass = (status: string): string => {
  const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 shadow-sm'
  
  return status === 'DRAFT' 
    ? `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`
    : `${baseClasses} bg-green-100 text-green-800 border border-green-200`
}

const getStatusDotClass = (status: string): string => {
  return status === 'DRAFT' ? 'bg-yellow-500' : 'bg-green-500'
}
</script>

<script lang="ts">
import '@/styles/components/DataTable.css'
</script>