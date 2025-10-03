<!-- ErrorReportModal.vue - Modal para reportar errores con detalles del usuario -->
<template>
  <Dialog 
    :show="show" 
    @close="handleClose"
    :title="modalTitle"
    size="lg"
  >
    <template #content>
      <div class="error-report-modal">
        <!-- Error Summary -->
        <div class="error-summary">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="error-info">
            <h4>{{ errorType }}</h4>
            <p>{{ truncatedErrorMessage }}</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="report-form">
          <!-- User Description -->
          <div class="form-group">
            <label for="description" class="form-label">
              ¿Qué estabas haciendo cuando ocurrió el error?
              <span class="optional">(opcional)</span>
            </label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Describe brevemente lo que estabas haciendo cuando apareció este error..."
              rows="3"
              class="form-textarea"
            />
          </div>

          <!-- Steps to Reproduce -->
          <div class="form-group">
            <label class="form-label">
              Pasos para reproducir el error
              <span class="optional">(opcional)</span>
            </label>
            <div class="steps-container">
              <div 
                v-for="(step, index) in form.steps" 
                :key="index"
                class="step-item"
              >
                <span class="step-number">{{ index + 1 }}</span>
                <input
                  v-model="form.steps[index]"
                  :placeholder="`Paso ${index + 1}`"
                  class="step-input"
                />
                <button
                  type="button"
                  @click="removeStep(index)"
                  class="remove-step-btn"
                  v-if="form.steps.length > 1"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                @click="addStep"
                class="add-step-btn"
                v-if="form.steps.length < 5"
              >
                + Agregar paso
              </button>
            </div>
          </div>

          <!-- Contact Email -->
          <div class="form-group">
            <label for="email" class="form-label">
              Email de contacto
              <span class="optional">(opcional, para seguimiento)</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              class="form-input"
            />
          </div>

          <!-- Technical Details Toggle -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="showTechnicalDetails"
                class="checkbox"
              />
              <span class="checkbox-text">
                Incluir detalles técnicos
                <small>(ayuda a nuestro equipo a diagnosticar el problema)</small>
              </span>
            </label>
          </div>

          <!-- Technical Details -->
          <div v-if="showTechnicalDetails" class="technical-details">
            <h5>Detalles técnicos</h5>
            <div class="tech-detail">
              <strong>Error:</strong> 
              <code>{{ error?.message }}</code>
            </div>
            <div class="tech-detail" v-if="error?.stack">
              <strong>Stack trace:</strong>
              <pre class="stack-trace">{{ error.stack }}</pre>
            </div>
            <div class="tech-detail">
              <strong>URL:</strong> {{ currentUrl }}
            </div>
            <div class="tech-detail">
              <strong>User Agent:</strong> {{ userAgent }}
            </div>
            <div class="tech-detail">
              <strong>Timestamp:</strong> {{ timestamp }}
            </div>
          </div>
        </form>
      </div>
    </template>

    <template #actions>
      <div class="modal-actions">
        <button
          type="button"
          @click="handleClose"
          class="btn-secondary"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          class="btn-primary"
          :disabled="isSubmitting"
        >
          <svg v-if="isSubmitting" class="btn-spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.2"/>
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
          </svg>
          {{ isSubmitting ? 'Enviando...' : 'Enviar reporte' }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog } from '@/components/ui'
import { errorReportingService } from '@/services/errorReporting'
import { useNotifications } from '@/composables/useNotifications'
import { NotificationType } from '@/types'

export interface ErrorReportModalProps {
  show: boolean
  error: Error | null
}

export interface ErrorReportModalEmits {
  'close': []
  'success': [reportId: string]
}

const props = defineProps<ErrorReportModalProps>()
const emit = defineEmits<ErrorReportModalEmits>()

const { addNotification } = useNotifications()

// Form state
const form = ref({
  description: '',
  email: '',
  steps: ['']
})

const isSubmitting = ref(false)
const showTechnicalDetails = ref(false)

// Computed
const modalTitle = computed(() => {
  const type = getErrorType(props.error)
  return `Reportar ${getErrorTypeLabel(type)}`
})

const errorType = computed(() => {
  return getErrorTypeLabel(getErrorType(props.error))
})

const truncatedErrorMessage = computed(() => {
  const message = props.error?.message || 'Error desconocido'
  return message.length > 100 ? message.substring(0, 100) + '...' : message
})

const currentUrl = computed(() => window.location.href)
const userAgent = computed(() => navigator.userAgent)
const timestamp = computed(() => new Date().toLocaleString())

// Methods
const getErrorType = (error: Error | null) => {
  if (!error) return 'unknown'
  
  const message = error.message?.toLowerCase() || ''
  if (message.includes('network') || message.includes('fetch')) return 'network'
  if (message.includes('server') || message.includes('500')) return 'server'
  if (message.includes('forbidden') || message.includes('403')) return 'forbidden'
  if (message.includes('not found') || message.includes('404')) return 'notfound'
  
  return 'general'
}

const getErrorTypeLabel = (type: string) => {
  const labels = {
    network: 'Error de Conexión',
    server: 'Error del Servidor',
    forbidden: 'Error de Acceso',
    notfound: 'Recurso No Encontrado',
    general: 'Error General',
    unknown: 'Error Desconocido'
  }
  
  return labels[type as keyof typeof labels] || labels.unknown
}

const addStep = () => {
  if (form.value.steps.length < 5) {
    form.value.steps.push('')
  }
}

const removeStep = (index: number) => {
  if (form.value.steps.length > 1) {
    form.value.steps.splice(index, 1)
  }
}

const resetForm = () => {
  form.value = {
    description: '',
    email: '',
    steps: ['']
  }
  showTechnicalDetails.value = false
  isSubmitting.value = false
}

const handleClose = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

const handleSubmit = async () => {
  if (!props.error || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    // Prepare user input
    const userInput = {
      description: form.value.description.trim() || undefined,
      email: form.value.email.trim() || undefined,
      steps: form.value.steps
        .map(step => step.trim())
        .filter(step => step.length > 0)
    }
    
    // Send error report
    const reportId = await errorReportingService.reportErrorWithUserInput(
      props.error,
      userInput
    )
    
    if (reportId && reportId !== 'failed-to-send' && reportId !== 'reporting-disabled') {
      // Success
    addNotification(
      NotificationType.SUCCESS,
      'Reporte enviado exitosamente',
      `Tu reporte (ID: ${reportId}) ha sido enviado. Nuestro equipo lo revisará pronto.`
    )
      
      emit('success', reportId)
      handleClose()
    } else {
      // Error
      addNotification(
        NotificationType.ERROR,
        'Error al enviar reporte',
        'No se pudo enviar el reporte. Se ha guardado localmente para intentar enviarlo más tarde.'
      )
    }
  } catch (error) {
    console.error('Error submitting report:', error)
    addNotification(
      NotificationType.ERROR,
      'Error inesperado',
      'Ocurrió un error al procesar tu reporte. Por favor, intenta nuevamente.'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Watch for show changes to reset form
watch(() => props.show, (newShow) => {
  if (newShow) {
    resetForm()
  }
})
</script>

<script lang="ts">
import '@/styles/components/ErrorReportModal.css'
</script>
