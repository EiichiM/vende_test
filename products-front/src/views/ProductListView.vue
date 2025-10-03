<template>
  <div class="app-container">

    <!-- Main Content -->
    <main class="main-content">
      <div class="page-header">
        <div>
          <h2 class="page-title">Gestión de Productos</h2>
          <p class="page-description">Administra el catálogo de productos de tu empresa</p>
        </div>
        <router-link to="/products/new" class="btn-primary">
          + Nuevo Producto
        </router-link>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" v-if="!isLoading">
        <div class="stat-card">
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-label">Total de Productos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalCompanies }}</div>
          <div class="stat-label">Compañías Registradas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${{ averagePrice }}</div>
          <div class="stat-label">Precio Promedio</div>
        </div>
      </div>

      <!-- Product Table -->
      <ProductTable />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useCompaniesStore } from '@/stores/companies'
import ProductTable from '@/components/ProductTable.vue'

// Stores
const productsStore = useProductsStore()
const companiesStore = useCompaniesStore()

// Computed properties para estadísticas
const isLoading = computed(() => productsStore.isLoading)

const totalProducts = computed(() => Array.isArray(productsStore.products) ? productsStore.products.length : 0)

const totalCompanies = computed(() => companiesStore.companies.length)

const averagePrice = computed(() => {
  const products = productsStore.products
  if (!Array.isArray(products) || products.length === 0) return '0.00'
  
  const sum = products.reduce((acc, product) => acc + product.unitPrice, 0)
  const average = sum / products.length
  return average.toFixed(2)
})

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      companiesStore.fetchCompanies()
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
})
</script>

<style scoped>
@import '@/styles/views/ProductListView.css';
</style>