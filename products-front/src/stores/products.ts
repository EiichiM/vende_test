import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters, ProductsQuery } from '@/types'

// Store con Composition API porque me gusta más que Options API
export const useProductsStore = defineStore('products', () => {
  // Estado
  const products = ref<Product[]>([])
  const selectedProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ProductFilters>({})

  // Filtrado en el cliente para no saturar la API
  const filteredProducts = computed(() => {
    if (!Array.isArray(products.value)) return []
    let filtered = products.value

    if (filters.value.companyId) {
      filtered = filtered.filter(product => product.companyId === filters.value.companyId)
    }

    if (filters.value.searchTerm) {
      const searchLower = filters.value.searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  })

  const hasProducts = computed(() => Array.isArray(products.value) && products.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Actions
  async function fetchProducts(query: ProductsQuery = {}) {
    try {
      loading.value = true
      error.value = null
      const productsResponse = await apiService.getProducts(query)
      products.value = Array.isArray(productsResponse) ? productsResponse : []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar productos'
      console.error('Error fetching products:', err)
      products.value = [] // Ensure it's always an array
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id: string) {
    try {
      loading.value = true
      error.value = null
      selectedProduct.value = await apiService.getProduct(id)
      return selectedProduct.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar producto'
      console.error('Error fetching product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProduct(productData: CreateProductDto) {
    try {
      loading.value = true
      error.value = null
      const newProduct = await apiService.createProduct(productData)
      
      // Ensure products is an array before calling unshift
      if (!Array.isArray(products.value)) {
        products.value = []
      }
      products.value.unshift(newProduct)
      return newProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear producto'
      console.error('Error creating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id: string, productData: UpdateProductDto) {
    try {
      loading.value = true
      error.value = null
      const updatedProduct = await apiService.updateProduct(id, productData)
      
      // Ensure products is an array before calling findIndex
      if (!Array.isArray(products.value)) {
        products.value = []
      }
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = updatedProduct
      }
      
      return updatedProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar producto'
      console.error('Error updating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id: string) {
    try {
      loading.value = true
      error.value = null
      await apiService.deleteProduct(id)
      
      // Ensure products is an array before calling filter
      if (!Array.isArray(products.value)) {
        products.value = []
      }
      products.value = products.value.filter(p => p.id !== id)
      
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar producto'
      console.error('Error deleting product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchProducts(searchTerm: string) {
    try {
      loading.value = true
      error.value = null
      const searchResults = await apiService.searchProducts(searchTerm)
      products.value = Array.isArray(searchResults) ? searchResults : []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error en la búsqueda'
      console.error('Error searching products:', err)
      products.value = [] // Ensure it's always an array
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<ProductFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {}
  }

  function clearError() {
    error.value = null
  }

  function selectProduct(product: Product | null) {
    selectedProduct.value = product
  }

  function clearSelectedProduct() {
    selectedProduct.value = null
  }

  // Reset store
  function $reset() {
    products.value = []
    selectedProduct.value = null
    loading.value = false
    error.value = null
    filters.value = {}
  }

  return {
    // State
    products,
    selectedProduct,
    loading,
    error,
    filters,
    
    // Getters
    filteredProducts,
    hasProducts,
    isLoading,
    hasError,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    setFilters,
    clearFilters,
    clearError,
    selectProduct,
    clearSelectedProduct,
    $reset,
  }
})