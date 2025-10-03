import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { createMockProduct } from '@/test/setup'
import { ProductCategory, TaxType, UnitType, type CreateProductDto } from '@/types'

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    searchProducts: vi.fn(),
  },
}))

describe('useProductsStore', () => {
  let mockApiService: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Get the mocked API service
    const { apiService } = await import('@/services/api')
    mockApiService = apiService
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const store = useProductsStore()

      expect(store.products).toEqual([])
      expect(store.selectedProduct).toBe(null)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.filters).toEqual({})
    })
  })

  describe('Getters', () => {
    it('filteredProducts returns all products when no filters', () => {
      const store = useProductsStore()
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Product 1' }),
        createMockProduct({ id: '2', name: 'Product 2' }),
      ]
      
      store.$patch({ products: mockProducts as any })

      expect(store.filteredProducts).toHaveLength(2)
      expect(store.filteredProducts[0].name).toBe('Product 1')
    })

    it('filteredProducts filters by company', () => {
      const store = useProductsStore()
      const mockProducts = [
        createMockProduct({ id: '1', companyId: 'company-1' }),
        createMockProduct({ id: '2', companyId: 'company-2' }),
      ]
      
      store.products = mockProducts
      store.filters = { companyId: 'company-1' }

      expect(store.filteredProducts).toHaveLength(1)
      expect(store.filteredProducts[0].id).toBe('1')
    })

    it('filteredProducts filters by search term', () => {
      const store = useProductsStore()
      const mockProducts = [
        createMockProduct({ id: '1', name: 'iPhone 15', description: 'Apple smartphone' }),
        createMockProduct({ id: '2', name: 'Samsung Galaxy', description: 'Android phone' }),
      ]
      
      store.products = mockProducts
      store.filters = { searchTerm: 'iphone' }

      expect(store.filteredProducts).toHaveLength(1)
      expect(store.filteredProducts[0].name).toBe('iPhone 15')
    })

    it('filteredProducts searches in description', () => {
      const store = useProductsStore()
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Phone', description: 'Apple smartphone' }),
        createMockProduct({ id: '2', name: 'Phone', description: 'Android device' }),
      ]
      
      store.products = mockProducts
      store.filters = { searchTerm: 'apple' }

      expect(store.filteredProducts).toHaveLength(1)
      expect(store.filteredProducts[0].description).toContain('Apple')
    })

    it('hasProducts returns true when products exist', () => {
      const store = useProductsStore()
      store.products = [createMockProduct()]

      expect(store.hasProducts).toBe(true)
    })

    it('hasProducts returns false when no products', () => {
      const store = useProductsStore()
      store.products = []

      expect(store.hasProducts).toBe(false)
    })

    it('isLoading reflects loading state', () => {
      const store = useProductsStore()
      
      expect(store.isLoading).toBe(false)
      
      store.loading = true
      expect(store.isLoading).toBe(true)
    })

    it('hasError reflects error state', () => {
      const store = useProductsStore()
      
      expect(store.hasError).toBe(false)
      
      store.error = 'Some error'
      expect(store.hasError).toBe(true)
    })
  })

  describe('fetchProducts', () => {
    it('fetches products successfully', async () => {
      const store = useProductsStore()
      const mockProducts = [
        createMockProduct({ id: '1' }),
        createMockProduct({ id: '2' }),
      ]

      mockApiService.getProducts.mockResolvedValue(mockProducts)

      await store.fetchProducts()

      expect(mockApiService.getProducts).toHaveBeenCalledWith({})
      expect(store.products).toEqual(mockProducts)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('handles fetch products error', async () => {
      const store = useProductsStore()
      const mockError = new Error('Network error')

      mockApiService.getProducts.mockRejectedValue(mockError)

      await store.fetchProducts()

      expect(store.products).toEqual([])
      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })

    it('sets loading state during fetch', async () => {
      const store = useProductsStore()
      let loadingDuringFetch = false

      mockApiService.getProducts.mockImplementation(async () => {
        loadingDuringFetch = store.loading
        return []
      })

      await store.fetchProducts()

      expect(loadingDuringFetch).toBe(true)
    })

    it('passes query parameters to API', async () => {
      const store = useProductsStore()
      const query = { page: 1, limit: 10 }

      mockApiService.getProducts.mockResolvedValue([])

      await store.fetchProducts(query)

      expect(mockApiService.getProducts).toHaveBeenCalledWith(query)
    })
  })

  describe('fetchProduct', () => {
    it('fetches single product successfully', async () => {
      const store = useProductsStore()
      const mockProduct = createMockProduct({ id: '123' })

      mockApiService.getProduct.mockResolvedValue(mockProduct)

      const result = await store.fetchProduct('123')

      expect(mockApiService.getProduct).toHaveBeenCalledWith('123')
      expect(store.selectedProduct).toEqual(mockProduct)
      expect(result).toEqual(mockProduct)
    })

    it('handles fetch product error', async () => {
      const store = useProductsStore()
      const mockError = new Error('Product not found')

      mockApiService.getProduct.mockRejectedValue(mockError)

      await expect(store.fetchProduct('123')).rejects.toThrow('Product not found')
      expect(store.error).toBe('Product not found')
    })
  })

  describe('createProduct', () => {
    it('creates product successfully', async () => {
      const store = useProductsStore()
      const newProductData: CreateProductDto = {
        name: 'New Product',
        description: 'Description',
        unitPrice: 100,
        companyId: 'company-1',
        category: ProductCategory.PRODUCT,
        unitType: UnitType.UNIT,
        taxType: TaxType.IVA_GENERAL,
        taxRate: 21,
        code: 'PROD-001',
        trackStock: false,
      }
      const createdProduct = createMockProduct(newProductData)

      mockApiService.createProduct.mockResolvedValue(createdProduct)

      const result = await store.createProduct(newProductData)

      expect(mockApiService.createProduct).toHaveBeenCalledWith(newProductData)
      expect(store.products).toHaveLength(1)
      expect(store.products[0]).toEqual(createdProduct) // Should be first (unshift)
      expect(result).toEqual(createdProduct)
    })

    it('handles create product error', async () => {
      const store = useProductsStore()
      const newProductData: CreateProductDto = {
        name: 'New Product',
        description: 'Description',
        unitPrice: 100,
        companyId: 'company-1',
        category: ProductCategory.PRODUCT,
        unitType: UnitType.UNIT,
        taxType: TaxType.IVA_GENERAL,
        taxRate: 21,
        code: 'PROD-002',
        trackStock: false,
      }
      const mockError = new Error('Creation failed')

      mockApiService.createProduct.mockRejectedValue(mockError)

      await expect(store.createProduct(newProductData)).rejects.toThrow('Creation failed')
      expect(store.error).toBe('Creation failed')
    })

    it('creates product when products array is not initialized', async () => {
      const store = useProductsStore()
      // Simulate uninitialized state
      store.products = null as any
      
      const newProductData: CreateProductDto = {
        name: 'New Product',
        description: 'Description',
        unitPrice: 100,
        companyId: 'company-1',
        category: ProductCategory.PRODUCT,
        unitType: UnitType.UNIT,
        taxType: TaxType.IVA_GENERAL,
        taxRate: 21,
        code: 'PROD-003',
        trackStock: false,
      }
      const createdProduct = createMockProduct(newProductData)

      mockApiService.createProduct.mockResolvedValue(createdProduct)

      await store.createProduct(newProductData)

      expect(Array.isArray(store.products)).toBe(true)
      expect(store.products).toHaveLength(1)
      expect(store.products[0]).toEqual(createdProduct)
    })
  })

  describe('updateProduct', () => {
    it('updates product successfully', async () => {
      const store = useProductsStore()
      const originalProduct = createMockProduct({ id: '123', name: 'Original' })
      const updateData = { name: 'Updated Name' }
      const updatedProduct = createMockProduct({ id: '123', name: 'Updated Name' })

      store.products = [originalProduct]
      mockApiService.updateProduct.mockResolvedValue(updatedProduct)

      const result = await store.updateProduct('123', updateData)

      expect(mockApiService.updateProduct).toHaveBeenCalledWith('123', updateData)
      expect(store.products[0]).toEqual(updatedProduct)
      expect(result).toEqual(updatedProduct)
    })

    it('updates selected product if it matches', async () => {
      const store = useProductsStore()
      const originalProduct = createMockProduct({ id: '123', name: 'Original' })
      const updatedProduct = createMockProduct({ id: '123', name: 'Updated' })

      store.products = [originalProduct]
      store.selectedProduct = originalProduct
      mockApiService.updateProduct.mockResolvedValue(updatedProduct)

      await store.updateProduct('123', { name: 'Updated' })

      expect(store.selectedProduct).toEqual(updatedProduct)
    })

    it('handles update product error', async () => {
      const store = useProductsStore()
      const mockError = new Error('Update failed')

      mockApiService.updateProduct.mockRejectedValue(mockError)

      await expect(store.updateProduct('123', {})).rejects.toThrow('Update failed')
      expect(store.error).toBe('Update failed')
    })

    it('handles update when products array is not initialized', async () => {
      const store = useProductsStore()
      store.products = null as any
      
      const updatedProduct = createMockProduct({ id: '123' })
      mockApiService.updateProduct.mockResolvedValue(updatedProduct)

      await store.updateProduct('123', {})

      expect(Array.isArray(store.products)).toBe(true)
    })
  })

  describe('deleteProduct', () => {
    it('deletes product successfully', async () => {
      const store = useProductsStore()
      const productToDelete = createMockProduct({ id: '123' })
      const otherProduct = createMockProduct({ id: '456' })

      store.products = [productToDelete, otherProduct]
      mockApiService.deleteProduct.mockResolvedValue(undefined)

      await store.deleteProduct('123')

      expect(mockApiService.deleteProduct).toHaveBeenCalledWith('123')
      expect(store.products).toEqual([otherProduct])
    })

    it('clears selected product if it matches deleted product', async () => {
      const store = useProductsStore()
      const productToDelete = createMockProduct({ id: '123' })

      store.products = [productToDelete]
      store.selectedProduct = productToDelete
      mockApiService.deleteProduct.mockResolvedValue(undefined)

      await store.deleteProduct('123')

      expect(store.selectedProduct).toBe(null)
    })

    it('handles delete product error', async () => {
      const store = useProductsStore()
      const mockError = new Error('Delete failed')

      mockApiService.deleteProduct.mockRejectedValue(mockError)

      await expect(store.deleteProduct('123')).rejects.toThrow('Delete failed')
      expect(store.error).toBe('Delete failed')
    })

    it('handles delete when products array is not initialized', async () => {
      const store = useProductsStore()
      store.products = null as any
      
      mockApiService.deleteProduct.mockResolvedValue(undefined)

      await store.deleteProduct('123')

      expect(Array.isArray(store.products)).toBe(true)
      expect(store.products).toEqual([])
    })
  })

  describe('searchProducts', () => {
    it('searches products successfully', async () => {
      const store = useProductsStore()
      const searchResults = [createMockProduct({ name: 'iPhone' })]

      mockApiService.searchProducts.mockResolvedValue(searchResults)

      await store.searchProducts('iphone')

      expect(mockApiService.searchProducts).toHaveBeenCalledWith('iphone')
      expect(store.products).toEqual(searchResults)
    })

    it('handles search error', async () => {
      const store = useProductsStore()
      const mockError = new Error('Search failed')

      mockApiService.searchProducts.mockRejectedValue(mockError)

      await store.searchProducts('test')

      expect(store.products).toEqual([])
      expect(store.error).toBe('Search failed')
    })
  })

  describe('Filter Management', () => {
    it('sets filters correctly', () => {
      const store = useProductsStore()
      const newFilters = { companyId: 'company-1', searchTerm: 'test' }

      store.setFilters(newFilters)

      expect(store.filters).toEqual(newFilters)
    })

    it('merges filters with existing ones', () => {
      const store = useProductsStore()
      store.filters = { companyId: 'company-1' }

      store.setFilters({ searchTerm: 'test' })

      expect(store.filters).toEqual({
        companyId: 'company-1',
        searchTerm: 'test',
      })
    })

    it('clears filters correctly', () => {
      const store = useProductsStore()
      store.filters = { companyId: 'company-1', searchTerm: 'test' }

      store.clearFilters()

      expect(store.filters).toEqual({})
    })
  })

  describe('Utility Methods', () => {
    it('clears error', () => {
      const store = useProductsStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBe(null)
    })

    it('selects product', () => {
      const store = useProductsStore()
      const product = createMockProduct()

      store.selectProduct(product)

      expect(store.selectedProduct).toEqual(product)
    })

    it('clears selected product', () => {
      const store = useProductsStore()
      store.selectedProduct = createMockProduct()

      store.clearSelectedProduct()

      expect(store.selectedProduct).toBe(null)
    })

    it('resets store state', () => {
      const store = useProductsStore()
      
      // Set some state
      store.products = [createMockProduct()]
      store.selectedProduct = createMockProduct()
      store.loading = true
      store.error = 'error'
      store.filters = { companyId: 'test' }

      store.$reset()

      expect(store.products).toEqual([])
      expect(store.selectedProduct).toBe(null)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.filters).toEqual({})
    })
  })
})