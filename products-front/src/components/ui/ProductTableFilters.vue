<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Filtrar Productos</h3>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
    
    <!-- Filters Content -->
    <div class="px-6 py-6">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Search Field -->
        <InputField
          v-model="searchValue"
          type="text"
          label="Buscar productos"
          placeholder="Buscar por nombre o SKU..."
          @update:modelValue="updateSearch"
        />
        
        <!-- Category Filter -->
        <SelectField
          v-model="categoryValue"
          label="Categoría"
          :options="categoryOptions"
          @update:modelValue="updateCategory"
        />
        
        <!-- Company Filter -->
        <SelectField
          v-model="companyValue"
          label="Empresa"
          :options="companyOptions"
          @update:modelValue="updateCompany"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InputField, SelectField } from './index'

export interface Company {
  id: string
  name: string
}

export interface Props {
  search?: string
  company?: string
  companies?: Company[]
  category?: string
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  company: '',
  companies: () => [],
  category: ''
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:company': [value: string]  
  'update:category': [value: string]
  'clear': []
}>()

// Local reactive values
const searchValue = ref(props.search)
const categoryValue = ref(props.category)
const companyValue = ref(props.company)

// Category options
const categoryOptions = [
  { value: '', label: 'Todas las categorías' },
  { value: 'ELECTRONICS', label: 'Electrónicos' },
  { value: 'HOME_GARDEN', label: 'Hogar y Jardín' },
  { value: 'CLOTHING', label: 'Ropa' },
  { value: 'BOOKS', label: 'Libros' },
  { value: 'SPORTS', label: 'Deportes' }
]

// Company options computed from props
const companyOptions = computed(() => [
  { value: '', label: 'Todas las empresas' },
  ...(props.companies || []).map((company: Company) => ({
    value: company.id,
    label: company.name
  }))
])

const hasActiveFilters = computed(() => {
  return searchValue.value || categoryValue.value || companyValue.value
})

// Methods
const updateSearch = (value: string) => {
  searchValue.value = value
  emit('update:search', value)
}

const updateCategory = (value: string) => {
  categoryValue.value = value
  emit('update:category', value)
}

const updateCompany = (value: string) => {
  companyValue.value = value
  emit('update:company', value)
}

const clearFilters = () => {
  searchValue.value = ''
  categoryValue.value = ''
  companyValue.value = ''
  
  emit('update:search', '')
  emit('update:category', '')
  emit('update:company', '')
  emit('clear')
}

// Watch for external prop changes
watch(() => props.search, (newValue) => {
  searchValue.value = newValue
})

watch(() => props.category, (newValue) => {
  categoryValue.value = newValue
})

watch(() => props.company, (newValue) => {
  companyValue.value = newValue
})
</script>

<style scoped>

</style>