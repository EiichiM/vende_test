<!-- ErrorBoundary.vue - Manejo de errores -->
<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3>Algo salió mal</h3>
      <p>{{ errorMessage }}</p>
      <button @click="retry" class="retry-button">
        Intentar de nuevo
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

export interface ErrorBoundaryProps {
  fallbackMessage?: string
}

const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  fallbackMessage: 'Ha ocurrido un error inesperado'
})

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message || props.fallbackMessage
  console.error('ErrorBoundary captured error:', error)
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<script lang="ts">
import '@/styles/components/ErrorBoundary.css'
</script>