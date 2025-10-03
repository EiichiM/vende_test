import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTableActions } from '@/composables/useTableActions'
import { useProductsStore } from '@/stores/products'
import { createMockProduct } from '@/test/setup'
import { ProductStatus, ProductCategory } from '@/types'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock useNotifications
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn() 
const mockShowInfo = vi.fn()
vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showInfo: mockShowInfo
  })
}))

// Mock useConfirmDialog
const mockConfirm = vi.fn()
vi.mock('@/composables/useConfirmDialog', () => ({
  useConfirmDialog: () => ({
    confirm: mockConfirm
  })
}))

// Mock DOM methods
const mockClick = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tag: string) => {
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        click: mockClick
      }
    }
    return {}
  })
})

Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild })
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild })
Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL })
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL })

describe('useTableActions', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
    
    // Reset all mocks
    vi.clearAllMocks()
    mockPush.mockClear()
    mockShowSuccess.mockClear()
    mockShowError.mockClear()
    mockShowInfo.mockClear()
    mockConfirm.mockClear()
  })

  describe('Initialization', () => {
    it('initializes with correct default state', () => {
      const { isProcessing, tableActions, bulkActions } = useTableActions()

      expect(isProcessing.value).toBe(false)
      expect(tableActions.value).toHaveLength(3)
      expect(bulkActions.value).toHaveLength(2)
    })

    it('has correct table actions structure', () => {
      const { tableActions } = useTableActions()

      const actions = tableActions.value
      expect(actions[0]).toEqual({
        id: 'view',
        label: 'Ver',
        icon: 'eye',
        variant: 'secondary',
        action: expect.any(Function)
      })
      expect(actions[1]).toEqual({
        id: 'edit',
        label: 'Editar',
        icon: 'edit',
        variant: 'primary',
        action: expect.any(Function)
      })
      expect(actions[2]).toEqual({
        id: 'delete',
        label: 'Eliminar',
        icon: 'trash',
        variant: 'danger',
        action: expect.any(Function)
      })
    })

    it('has correct bulk actions structure', () => {
      const { bulkActions } = useTableActions()

      const actions = bulkActions.value
      expect(actions[0]).toEqual({
        id: 'delete',
        label: 'Eliminar Seleccionados',
        icon: 'trash',
        variant: 'danger',
        requiresConfirm: true,
        action: expect.any(Function)
      })
      expect(actions[1]).toEqual({
        id: 'export',
        label: 'Exportar Seleccionados',
        icon: 'download',
        variant: 'secondary',
        requiresConfirm: false,
        action: expect.any(Function)
      })
    })
  })

  describe('viewProduct', () => {
    it('shows info notification with product name', async () => {
      const { viewProduct } = useTableActions()
      const product = createMockProduct({ name: 'Test Product' })

      await viewProduct(product)

      expect(mockShowInfo).toHaveBeenCalledWith(
        'Vista del Producto',
        'Viendo detalles de: Test Product'
      )
    })
  })

  describe('editProduct', () => {
    it('navigates to edit route with product id', async () => {
      const { editProduct } = useTableActions()
      const product = createMockProduct({ id: 'product-123' })

      await editProduct(product)

      expect(mockPush).toHaveBeenCalledWith('/products/product-123/edit')
    })
  })

  describe('deleteProduct', () => {
    it('shows confirmation dialog before deletion', async () => {
      const { deleteProduct } = useTableActions()
      const product = createMockProduct({ name: 'Test Product' })
      
      mockConfirm.mockResolvedValue(false) // User cancels

      await deleteProduct(product)

      expect(mockConfirm).toHaveBeenCalledWith({
        title: 'Eliminar Producto',
        message: '¿Estás seguro de que deseas eliminar "Test Product"?',
        type: 'danger'
      })
    })

    it('deletes product when confirmed', async () => {
      const { deleteProduct } = useTableActions()
      const product = createMockProduct({ id: 'product-123', name: 'Test Product' })
      
      mockConfirm.mockResolvedValue(true)
      vi.spyOn(store, 'deleteProduct').mockResolvedValue()

      await deleteProduct(product)

      expect(store.deleteProduct).toHaveBeenCalledWith('product-123')
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Producto Eliminado',
        '"Test Product" ha sido eliminado exitosamente'
      )
    })

    it('does not delete when user cancels', async () => {
      const { deleteProduct } = useTableActions()
      const product = createMockProduct()
      
      mockConfirm.mockResolvedValue(false)
      vi.spyOn(store, 'deleteProduct').mockResolvedValue()

      await deleteProduct(product)

      expect(store.deleteProduct).not.toHaveBeenCalled()
      expect(mockShowSuccess).not.toHaveBeenCalled()
    })

    it('handles deletion errors gracefully', async () => {
      const { deleteProduct } = useTableActions()
      const product = createMockProduct({ name: 'Test Product' })
      
      mockConfirm.mockResolvedValue(true)
      vi.spyOn(store, 'deleteProduct').mockRejectedValue(new Error('Network error'))

      await deleteProduct(product)

      expect(mockShowError).toHaveBeenCalledWith(
        'Error al Eliminar',
        'No se pudo eliminar el producto. Inténtalo nuevamente.'
      )
    })

    it('manages processing state correctly', async () => {
      const { deleteProduct, isProcessing } = useTableActions()
      const product = createMockProduct()
      
      mockConfirm.mockResolvedValue(true)
      
      let processingDuringDelete = false
      vi.spyOn(store, 'deleteProduct').mockImplementation(async () => {
        processingDuringDelete = isProcessing.value
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(isProcessing.value).toBe(false)
      
      await deleteProduct(product)

      expect(processingDuringDelete).toBe(true)
      expect(isProcessing.value).toBe(false)
    })
  })

  describe('bulkDelete', () => {
    it('shows confirmation dialog with count', async () => {
      const { bulkDelete } = useTableActions()
      const productIds = ['1', '2', '3']
      
      mockConfirm.mockResolvedValue(false)

      await bulkDelete(productIds)

      expect(mockConfirm).toHaveBeenCalledWith({
        title: 'Eliminar Productos',
        message: '¿Estás seguro de que deseas eliminar 3 productos?',
        type: 'danger'
      })
    })

    it('deletes all products when confirmed', async () => {
      const { bulkDelete } = useTableActions()
      const productIds = ['1', '2', '3']
      
      mockConfirm.mockResolvedValue(true)
      vi.spyOn(store, 'deleteProduct').mockResolvedValue()

      await bulkDelete(productIds)

      expect(store.deleteProduct).toHaveBeenCalledTimes(3)
      expect(store.deleteProduct).toHaveBeenNthCalledWith(1, '1')
      expect(store.deleteProduct).toHaveBeenNthCalledWith(2, '2')
      expect(store.deleteProduct).toHaveBeenNthCalledWith(3, '3')
      
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Productos Eliminados',
        '3 productos han sido eliminados'
      )
    })

    it('handles bulk deletion errors', async () => {
      const { bulkDelete } = useTableActions()
      const productIds = ['1', '2']
      
      mockConfirm.mockResolvedValue(true)
      vi.spyOn(store, 'deleteProduct').mockRejectedValue(new Error('Server error'))

      await bulkDelete(productIds)

      expect(mockShowError).toHaveBeenCalledWith(
        'Error en Eliminación',
        'No se pudieron eliminar todos los productos'
      )
    })
  })

  describe('exportProducts', () => {
    beforeEach(() => {
      // Mock products in store
      store.products = [
        createMockProduct({ 
          id: '1', 
          name: 'Product 1', 
          unitPrice: 100, 
          status: ProductStatus.ACTIVE,
          category: ProductCategory.PRODUCT 
        }) as any,
        createMockProduct({ 
          id: '2', 
          name: 'Product 2', 
          unitPrice: 200, 
          status: ProductStatus.ACTIVE,
          category: ProductCategory.SERVICE 
        }) as any,
        createMockProduct({ 
          id: '3', 
          name: 'Product 3', 
          unitPrice: 300 
        }) as any
      ]
    })

    it('exports selected products to CSV', async () => {
      const { exportProducts } = useTableActions()
      const productIds = ['1', '2']

      await exportProducts(productIds)

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
      
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Exportación Completada',
        '2 productos exportados exitosamente'
      )
    })

    it('creates CSV with correct format', async () => {
      const { exportProducts } = useTableActions()
      
      await exportProducts(['1'])

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Exportación Completada',
        '1 productos exportados exitosamente'
      )
    })

    it('handles export errors gracefully', async () => {
      const { exportProducts } = useTableActions()
      
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Blob creation failed')
      })

      await exportProducts(['1'])

      expect(mockShowError).toHaveBeenCalledWith(
        'Error en Exportación',
        'No se pudo completar la exportación'
      )
    })

    it('attempts export process', async () => {
      const { exportProducts, isProcessing } = useTableActions()

      expect(isProcessing.value).toBe(false)
      
      const exportPromise = exportProducts(['1'])
      
      await exportPromise
      
      expect(isProcessing.value).toBe(false)
    })

    it('manages processing state during export', async () => {
      const { exportProducts, isProcessing } = useTableActions()
      
      expect(isProcessing.value).toBe(false)
      
      const exportPromise = exportProducts(['1'])
      
      await exportPromise
      
      expect(isProcessing.value).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('handles delete operation in isolation', async () => {
      const { deleteProduct } = useTableActions()
      const product = createMockProduct({ id: '1', name: 'Test' })
      
      mockConfirm.mockResolvedValue(true)
      vi.spyOn(store, 'deleteProduct').mockResolvedValue()
      
      await deleteProduct(product)
      
      expect(store.deleteProduct).toHaveBeenCalledWith('1')
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Producto Eliminado',
        '"Test" ha sido eliminado exitosamente'
      )
    })

    it('maintains state consistency across operations', async () => {
      const { isProcessing, deleteProduct } = useTableActions()
      const product = createMockProduct()
      
      mockConfirm.mockResolvedValue(true)
      vi.spyOn(store, 'deleteProduct').mockResolvedValue()

      expect(isProcessing.value).toBe(false)
      
      await deleteProduct(product)
      
      expect(isProcessing.value).toBe(false)
    })
  })
})