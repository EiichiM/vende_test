<template>
  <div class="product-form-view">
    <!-- Header de la página -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          {{ isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto' }}
        </h1>
        <p class="page-subtitle">
          {{ 
            isEditMode 
              ? 'Modifica la información del producto existente' 
              : 'Completa los campos para agregar un nuevo producto al catálogo'
          }}
        </p>
      </div>

      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/products" class="breadcrumb-link">
          ← Volver a Productos
        </router-link>
      </nav>
    </header>

    <!-- Formulario principal -->
    <main class="main-content">
      <div class="form-container">
        <!-- Indicador de carga -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ isEditMode ? 'Cargando producto...' : 'Preparando formulario...' }}</p>
          <p class="loading-detail">
            <span v-if="isEditMode">Obteniendo datos del producto ID: {{ productId }}</span>
            <span v-else>Cargando compañías disponibles...</span>
          </p>
        </div>

        <!-- Mensaje de error -->
        <div v-else-if="error" class="error-state">
          <div class="error-container">
            <div class="error-icon-container">
              <div class="error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" stroke-width="2"/>
                </svg>
              </div>
            </div>
            
            <div class="error-content">
              <h2 class="error-title">Error al cargar</h2>
              <p class="error-message">{{ error }}</p>
              
              <div class="error-details">
                <h4 class="details-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#64748b" stroke-width="2"/>
                    <path d="m9 12 2 2 4-4" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Verificaciones
                </h4>
                <ul class="details-list">
                  <li>
                    <span class="check-icon">🔍</span>
                    ¿El servidor backend está ejecutándose en 
                    <code>http://localhost:3000</code>?
                  </li>
                  <li v-if="isEditMode">
                    <span class="check-icon">📄</span>
                    ¿El producto con ID <code>{{ productId }}</code> existe?
                  </li>
                  <li>
                    <span class="check-icon">🌐</span>
                    ¿Hay conexión a internet?
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="error-actions">
            <button @click="retry" class="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Intentar de nuevo
            </button>
            
            <router-link to="/products" class="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Volver a productos
            </router-link>
          </div>
        </div>

        <!-- Formulario -->
        <div v-else class="form-wrapper">
          <!-- Información adicional para modo edición -->
          <div v-if="isEditMode && selectedProduct" class="product-info">
            <h3>Información actual del producto</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">{{ selectedProduct.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Creado:</span>
                <span class="info-value">{{ formatDate(selectedProduct.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Actualizado:</span>
                <span class="info-value">{{ formatDate(selectedProduct.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Componente del formulario -->
          <ProductForm :productId="productId" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCompaniesStore } from '@/stores/companies'
import ProductForm from '@/components/ProductForm.vue'

// Router
const route = useRoute()

// Stores
const productsStore = useProductsStore()
const companiesStore = useCompaniesStore()

// Computed
const isEditMode = computed(() => !!route.params.id)
const productId = computed(() => route.params.id as string)
const isLoading = computed(() => productsStore.isLoading || companiesStore.isLoading)
const error = computed(() => productsStore.error)
const selectedProduct = computed(() => productsStore.selectedProduct)

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function retry() {
  productsStore.clearError()
  if (isEditMode.value) {
    await productsStore.fetchProduct(productId.value)
  }
  if (!companiesStore.hasCompanies) {
    await companiesStore.fetchCompanies()
  }
}

// Lifecycle
onMounted(async () => {
  try {
    productsStore.clearError()
    companiesStore.clearError()

    // Cargar compañías si no están disponibles
    if (!companiesStore.hasCompanies) {
      await companiesStore.fetchCompanies()
    }

    // Si estamos en modo edición, cargar el producto
    if (isEditMode.value) {
      await productsStore.fetchProduct(productId.value)
    }
  } catch (error) {
    console.error('Error loading form data:', error)
  }
})

onUnmounted(() => {
  productsStore.clearSelectedProduct()
})
</script>

<style scoped>
@import '@/styles/views/ProductFormView.css';
</style>