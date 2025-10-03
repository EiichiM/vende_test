<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click="handleBackdropClick"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

        <!-- Dialog -->
        <div
          ref="dialogRef"
          class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
          role="dialog"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4" v-if="$slots.header || title">
            <h3 :id="titleId" class="text-lg font-medium leading-6 text-gray-900">
              <slot name="header">{{ title }}</slot>
            </h3>
            <button
              v-if="showCloseButton"
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <span class="sr-only">Cerrar</span>
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div :id="descriptionId" class="mb-6">
            <slot>
              <p class="text-sm text-gray-500">{{ description }}</p>
            </slot>
          </div>

          <!-- Footer -->
          <div class="flex justify-end space-x-3" v-if="$slots.footer || showDefaultButtons">
            <slot name="footer">
              <button
                v-if="showCancelButton"
                @click="$emit('cancel')"
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ cancelText }}
              </button>
              <button
                v-if="showConfirmButton"
                @click="$emit('confirm')"
                type="button"
                :class="confirmButtonClass"
              >
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

export interface DialogProps {
  show: boolean
  title?: string
  description?: string
  showCloseButton?: boolean
  showDefaultButtons?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  variant?: 'default' | 'danger' | 'success' | 'warning'
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  showCloseButton: true,
  showDefaultButtons: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: 'Cancelar',
  confirmText: 'Confirmar',
  variant: 'default',
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
  cancel: []
  confirm: []
}>()

const dialogRef = ref<HTMLElement>()

// Generar IDs únicos estables para accesibilidad
const uniqueId = Math.random().toString(36).substr(2, 9)
const titleId = `dialog-title-${uniqueId}`
const descriptionId = `dialog-description-${uniqueId}`

const confirmButtonClass = computed(() => {
  const baseClass = 'px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  switch (props.variant) {
    case 'danger':
      return `${baseClass} text-white bg-red-600 border-transparent hover:bg-red-700 focus:ring-red-500`
    case 'success':
      return `${baseClass} text-white bg-green-600 border-transparent hover:bg-green-700 focus:ring-green-500`
    case 'warning':
      return `${baseClass} text-white bg-yellow-600 border-transparent hover:bg-yellow-700 focus:ring-yellow-500`
    default:
      return `${baseClass} text-white bg-blue-600 border-transparent hover:bg-blue-700 focus:ring-blue-500`
  }
})

const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdrop && event.target === event.currentTarget) {
    emit('close')
  }
}

// Focus management
watch(() => props.show, async (show) => {
  if (show) {
    await nextTick()
    dialogRef.value?.focus()
  }
})
</script>