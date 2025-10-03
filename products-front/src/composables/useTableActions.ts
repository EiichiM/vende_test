/**
 * useTableActions - Composable para acciones de tabla
 * Versión simplificada para resolver errores de importación
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useNotifications } from '@/composables/useNotifications'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { Product, TableAction, BulkAction } from '@/types'

export function useTableActions() {
  const router = useRouter()
  const productsStore = useProductsStore()
  const { showSuccess, showError, showInfo } = useNotifications()
  const { confirm } = useConfirmDialog()

  const isProcessing = ref(false)

  // Acciones individuales simplificadas
  const tableActions = computed<TableAction[]>(() => [
    {
      id: 'view',
      label: 'Ver',
      icon: 'eye',
      variant: 'secondary',
      action: (product: Product) => viewProduct(product)
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      variant: 'primary',
      action: (product: Product) => editProduct(product)
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'trash',
      variant: 'danger',
      action: (product: Product) => deleteProduct(product)
    }
  ])

  // Acciones en lote simplificadas
  const bulkActions = computed<BulkAction[]>(() => [
    {
      id: 'delete',
      label: 'Eliminar Seleccionados',
      icon: 'trash',
      variant: 'danger',
      requiresConfirm: true,
      action: (productIds: string[]) => bulkDelete(productIds)
    },
    {
      id: 'export',
      label: 'Exportar Seleccionados',
      icon: 'download',
      variant: 'secondary',
      requiresConfirm: false,
      action: (productIds: string[]) => exportProducts(productIds)
    }
  ])

  // Implementaciones simplificadas
  const viewProduct = async (product: Product) => {
    showInfo('Vista del Producto', `Viendo detalles de: ${product.name}`)
  }

  const editProduct = async (product: Product) => {
    router.push(`/products/${product.id}/edit`)
  }

  const deleteProduct = async (product: Product) => {
    const confirmed = await confirm({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que deseas eliminar "${product.name}"?`,
      type: 'danger'
    })

    if (confirmed) {
      try {
        isProcessing.value = true
        await productsStore.deleteProduct(product.id)
        showSuccess('Producto Eliminado', `"${product.name}" ha sido eliminado exitosamente`)
      } catch (error) {
        showError('Error al Eliminar', 'No se pudo eliminar el producto. Inténtalo nuevamente.')
      } finally {
        isProcessing.value = false
      }
    }
  }

  const bulkDelete = async (productIds: string[]) => {
    const confirmed = await confirm({
      title: 'Eliminar Productos',
      message: `¿Estás seguro de que deseas eliminar ${productIds.length} productos?`,
      type: 'danger'
    })

    if (confirmed) {
      try {
        isProcessing.value = true
        
        for (const id of productIds) {
          await productsStore.deleteProduct(id)
        }
        
        showSuccess('Productos Eliminados', `${productIds.length} productos han sido eliminados`)
      } catch (error) {
        showError('Error en Eliminación', 'No se pudieron eliminar todos los productos')
      } finally {
        isProcessing.value = false
      }
    }
  }

  const exportProducts = async (productIds: string[]) => {
    try {
      isProcessing.value = true
      
      const products = productsStore.products.filter(p => productIds.includes(p.id))
      
      // Crear CSV simple
      const headers = ['ID', 'Nombre', 'Precio Unitario', 'Estado', 'Categoría']
      const csvContent = [
        headers.join(','),
        ...products.map(p => [
          p.id,
          `"${p.name}"`,
          p.unitPrice,
          p.status || 'ACTIVE',
          p.category || 'OTHER'
        ].join(','))
      ].join('\n')
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `productos-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showSuccess('Exportación Completada', `${productIds.length} productos exportados exitosamente`)
    } catch (error) {
      showError('Error en Exportación', 'No se pudo completar la exportación')
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // State
    isProcessing,
    
    // Actions
    tableActions,
    bulkActions,
    
    // Methods
    viewProduct,
    editProduct,
    deleteProduct,
    bulkDelete,
    exportProducts
  }
}