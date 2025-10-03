

import { ref } from 'vue'

export interface ConfirmDialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger' | 'success'
}

export interface ConfirmDialogState {
  show: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  type: 'info' | 'warning' | 'danger' | 'success'
  onConfirm?: () => void
  onCancel?: () => void
}

const dialogState = ref<ConfirmDialogState>({
  show: false,
  title: 'Confirmación',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'info'
})

export function useConfirmDialog() {
  
  const confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      dialogState.value = {
        show: true,
        title: options.title || 'Confirmación',
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'info',
        onConfirm: () => {
          dialogState.value.show = false
          resolve(true)
        },
        onCancel: () => {
          dialogState.value.show = false
          resolve(false)
        }
      }
    })
  }

  const confirmDelete = (itemName?: string): Promise<boolean> => {
    return confirm({
      title: 'Confirmar Eliminación',
      message: itemName 
        ? `¿Estás seguro de que deseas eliminar "${itemName}"?`
        : '¿Estás seguro de que deseas eliminar este elemento?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
  }

  const confirmAction = (action: string, itemName?: string): Promise<boolean> => {
    return confirm({
      title: `Confirmar ${action}`,
      message: itemName
        ? `¿Estás seguro de que deseas ${action.toLowerCase()} "${itemName}"?`
        : `¿Estás seguro de que deseas ${action.toLowerCase()}?`,
      confirmText: action,
      cancelText: 'Cancelar',
      type: 'warning'
    })
  }

  const close = () => {
    dialogState.value.show = false
  }

  return {
    // State
    dialogState,
    
    confirm,
    confirmDelete,
    confirmAction,
    close
  }
}