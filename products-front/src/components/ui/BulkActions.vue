<template>
  <div 
    v-if="selectedCount > 0" 
    class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-lg transform transition-all duration-300 ease-in-out"
  >
    <div class="flex items-center justify-between">
      <!-- Selection Info -->
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-bold text-blue-900">
            {{ selectedCount }} elemento{{ selectedCount !== 1 ? 's' : '' }} seleccionado{{ selectedCount !== 1 ? 's' : '' }}
          </h3>
          <p class="text-sm text-blue-700 mt-1">
            Realiza acciones en masa con los elementos seleccionados
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-3">
        <!-- Clear Selection -->
        <button
          @click="$emit('clear-selection')"
          class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Limpiar
        </button>

        <!-- Export Action -->
        <button
          v-if="showExport"
          @click="$emit('action', 'export-selected')"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Exportar
        </button>

        <!-- Delete Action -->
        <button
          @click="$emit('action', 'delete-selected')"
          class="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Eliminar {{ selectedCount > 1 ? 'todos' : '' }}
        </button>
      </div>
    </div>

    <!-- Progress Bar (optional) -->
    <div v-if="isProcessing" class="mt-4">
      <div class="bg-blue-200 rounded-full h-2 overflow-hidden">
        <div 
          class="bg-blue-600 h-full transition-all duration-300 ease-out"
          :style="{ width: `${processingProgress}%` }"
        ></div>
      </div>
      <p class="text-xs text-blue-600 mt-1">{{ processingMessage }}</p>
    </div>

    <!-- Custom Actions -->
    <div v-if="customActions && customActions.length > 0" class="mt-4 pt-4 border-t border-blue-200">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="action in customActions"
          :key="action.key"
          @click="$emit('action', action.key)"
          :class="getCustomActionClass(action)"
        >
          <component v-if="action.icon" :is="action.icon" class="w-4 h-4 mr-2" />
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface CustomAction {
  key: string
  label: string
  icon?: any
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export interface Props {
  selectedCount: number
  showExport?: boolean
  isProcessing?: boolean
  processingProgress?: number
  processingMessage?: string
  customActions?: CustomAction[]
}

const props = withDefaults(defineProps<Props>(), {
  showExport: true,
  isProcessing: false,
  processingProgress: 0,
  processingMessage: '',
  customActions: () => []
})

const emit = defineEmits<{
  'action': [actionKey: string]
  'clear-selection': []
}>()

const getCustomActionClass = (action: CustomAction): string => {
  const baseClasses = 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  switch (action.variant) {
    case 'primary':
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
    case 'success':
      return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`
    case 'warning':
      return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`
    case 'danger':
      return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
    default:
      return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`
  }
}
</script>

<script lang="ts">
import '@/styles/components/BulkActions.css'
</script>