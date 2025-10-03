<template>
  <Dialog :show="show" @close="$emit('close')" size="md">
    <template #header>
      <h3 class="modal-title">{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
    </template>

    <form @submit.prevent="handleSubmit" class="client-form">
      <!-- Client Type Toggle -->
      <div class="form-section">
        <div class="client-type-selector">
          <label class="type-option" :class="{ active: form.isCompany === false }">
            <input 
              type="radio" 
              :value="false" 
              v-model="form.isCompany"
              @change="resetFormFields"
            />
            <span class="type-icon">👤</span>
            <span class="type-label">Particular</span>
          </label>
          
          <label class="type-option" :class="{ active: form.isCompany === true }">
            <input 
              type="radio" 
              :value="true" 
              v-model="form.isCompany"
              @change="resetFormFields"
            />
            <span class="type-icon">🏢</span>
            <span class="type-label">Empresa</span>
          </label>
        </div>
      </div>

      <!-- Company Fields -->
      <template v-if="form.isCompany">
        <div class="form-group">
          <label class="form-label required">Nombre de la Empresa</label>
          <input
            v-model="form.companyName"
            type="text"
            class="form-input"
            :class="{ error: errors.companyName }"
            placeholder="Ej: Tecnología Avanzada S.L."
            required
          />
          <span v-if="errors.companyName" class="error-message">{{ errors.companyName }}</span>
        </div>

        <div class="form-group">
          <label class="form-label required">CIF/NIF</label>
          <input
            v-model="form.taxId"
            type="text"
            class="form-input"
            :class="{ error: errors.taxId }"
            placeholder="Ej: B12345678 o 12345678Z"
            @input="validateTaxId"
            required
          />
          <span v-if="errors.taxId" class="error-message">{{ errors.taxId }}</span>
          <span v-else-if="taxIdStatus === 'valid'" class="success-message">✓ CIF/NIF válido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Persona de Contacto</label>
          <input
            v-model="form.contactPerson"
            type="text"
            class="form-input"
            placeholder="Nombre del responsable"
          />
        </div>
      </template>

      <!-- Individual Fields -->
      <template v-else>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">Nombre</label>
            <input
              v-model="form.firstName"
              type="text"
              class="form-input"
              :class="{ error: errors.firstName }"
              placeholder="Nombre"
              required
            />
            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
          </div>

          <div class="form-group">
            <label class="form-label required">Apellidos</label>
            <input
              v-model="form.lastName"
              type="text"
              class="form-input"
              :class="{ error: errors.lastName }"
              placeholder="Apellidos"
              required
            />
            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">DNI/NIE</label>
          <input
            v-model="form.taxId"
            type="text"
            class="form-input"
            :class="{ error: errors.taxId }"
            placeholder="Ej: 12345678Z o X1234567L"
            @input="validateTaxId"
          />
          <span v-if="errors.taxId" class="error-message">{{ errors.taxId }}</span>
          <span v-else-if="taxIdStatus === 'valid'" class="success-message">✓ DNI/NIE válido</span>
        </div>
      </template>

      <!-- Common Fields -->
      <div class="form-section">
        <h4 class="section-title">Información de Contacto</h4>
        
        <div class="form-group">
          <label class="form-label required">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="email@empresa.com"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-input"
              placeholder="+34 600 000 000"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono Móvil</label>
            <input
              v-model="form.mobile"
              type="tel"
              class="form-input"
              placeholder="+34 600 000 000"
            />
          </div>
        </div>
      </div>

      <!-- Address Section -->
      <div class="form-section">
        <h4 class="section-title">Dirección de Facturación</h4>
        
        <div class="form-group">
          <label class="form-label">Dirección</label>
          <input
            v-model="form.address"
            type="text"
            class="form-input"
            placeholder="Calle, número, piso, puerta..."
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-2">
            <label class="form-label">Ciudad</label>
            <input
              v-model="form.city"
              type="text"
              class="form-input"
              placeholder="Ciudad"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Código Postal</label>
            <input
              v-model="form.postalCode"
              type="text"
              class="form-input"
              placeholder="28001"
              maxlength="5"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Provincia</label>
            <input
              v-model="form.province"
              type="text"
              class="form-input"
              placeholder="Provincia"
            />
          </div>

          <div class="form-group">
            <label class="form-label">País</label>
            <select v-model="form.country" class="form-input">
              <option value="ES">España</option>
              <option value="FR">Francia</option>
              <option value="PT">Portugal</option>
              <option value="IT">Italia</option>
              <option value="DE">Alemania</option>
              <option value="GB">Reino Unido</option>
              <option value="US">Estados Unidos</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Additional Options -->
      <div class="form-section">
        <h4 class="section-title">Opciones Adicionales</h4>
        
        <div class="form-group">
          <label class="form-label">Notas</label>
          <textarea
            v-model="form.notes"
            class="form-textarea"
            rows="3"
            placeholder="Observaciones, preferencias, términos especiales..."
          ></textarea>
        </div>

        <div class="form-checkboxes">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.isActive"
              class="form-checkbox"
            />
            <span class="checkbox-text">Cliente activo</span>
          </label>

          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.sendInvoiceByEmail"
              class="form-checkbox"
            />
            <span class="checkbox-text">Enviar facturas por email</span>
          </label>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="modal-actions">
        <button @click="$emit('close')" type="button" class="btn-secondary">
          Cancelar
        </button>
        <button 
          @click="handleSubmit" 
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting || !isFormValid"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Cliente' : 'Crear Cliente') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useClientsStore, type CreateClientRequest } from '@/stores/clients'
import { Dialog } from '@/components/ui'
import type { Client } from '@/types'

// Props
export interface Props {
  show: boolean
  client?: Client | null
}

const props = withDefaults(defineProps<Props>(), {
  client: null
})

// Emits
const emit = defineEmits<{
  close: []
  saved: [client: Client]
}>()

// Store
const clientsStore = useClientsStore()

// Form state
const form = ref({
  isCompany: false,
  companyName: '',
  firstName: '',
  lastName: '',
  taxId: '',
  email: '',
  phone: '',
  mobile: '',
  contactPerson: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
  country: 'ES',
  notes: '',
  isActive: true,
  sendInvoiceByEmail: true
})

const errors = ref({
  companyName: '',
  firstName: '',
  lastName: '',
  taxId: '',
  email: ''
})

const isSubmitting = ref(false)
const taxIdStatus = ref<'valid' | 'invalid' | null>(null)

// Computed
const isEditing = computed(() => !!props.client)

const isFormValid = computed(() => {
  const hasRequiredFields = form.value.isCompany 
    ? form.value.companyName && form.value.email
    : form.value.firstName && form.value.lastName && form.value.email

  const hasNoErrors = Object.values(errors.value).every(error => !error)
  
  return hasRequiredFields && hasNoErrors
})

// Methods
const resetFormFields = () => {
  // Clear fields that don't apply to the new client type
  if (form.value.isCompany) {
    form.value.firstName = ''
    form.value.lastName = ''
  } else {
    form.value.companyName = ''
    form.value.contactPerson = ''
  }
  
  // Clear errors
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
}

const validateTaxId = () => {
  const taxId = form.value.taxId.trim().toUpperCase()
  errors.value.taxId = ''
  taxIdStatus.value = null
  
  if (!taxId) return
  
  try {
    const isValid = clientsStore.validateTaxId(taxId, form.value.isCompany)
    if (isValid) {
      taxIdStatus.value = 'valid'
    } else {
      const expectedType = form.value.isCompany ? 'CIF válido' : 'DNI o NIE válido'
      errors.value.taxId = `Introduce un ${expectedType}`
      taxIdStatus.value = 'invalid'
    }
  } catch (error) {
    errors.value.taxId = 'Formato de identificación no válido'
    taxIdStatus.value = 'invalid'
  }
}

const validateEmail = () => {
  const email = form.value.email.trim()
  errors.value.email = ''
  
  if (!email) {
    errors.value.email = 'El email es obligatorio'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.value.email = 'Introduce un email válido'
    return false
  }
  
  return true
}

const validateRequiredFields = () => {
  let isValid = true
  
  // Clear previous errors
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
  
  // Validate based on client type
  if (form.value.isCompany) {
    if (!form.value.companyName.trim()) {
      errors.value.companyName = 'El nombre de la empresa es obligatorio'
      isValid = false
    }
  } else {
    if (!form.value.firstName.trim()) {
      errors.value.firstName = 'El nombre es obligatorio'
      isValid = false
    }
    if (!form.value.lastName.trim()) {
      errors.value.lastName = 'Los apellidos son obligatorios'
      isValid = false
    }
  }
  
  // Validate email
  if (!validateEmail()) {
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateRequiredFields()) return
  
  // Validate tax ID if provided
  if (form.value.taxId) {
    validateTaxId()
    if (errors.value.taxId) return
  }
  
  isSubmitting.value = true
  
  try {
    // Generate name based on client type
    const name = form.value.isCompany 
      ? form.value.companyName 
      : `${form.value.firstName} ${form.value.lastName}`.trim()
    
    const clientData: CreateClientRequest = {
      name,
      email: form.value.email,
      taxId: form.value.taxId || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || '',
      city: form.value.city || '',
      postalCode: form.value.postalCode || '',
      country: form.value.country,
      isCompany: form.value.isCompany
    }
    
    let savedClient: Client
    
    if (isEditing.value && props.client) {
      savedClient = await clientsStore.updateClient(props.client.id, clientData)
    } else {
      savedClient = await clientsStore.createClient(clientData)
    }
    
    emit('saved', savedClient)
    emit('close')
    
  } catch (error) {
    console.error('Error saving client:', error)
    // Here you could show a toast notification or error message
  } finally {
    isSubmitting.value = false
  }
}

const loadClientData = (client: Client) => {
  form.value = {
    isCompany: client.isCompany,
    companyName: client.companyName || '',
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    taxId: client.taxId || '',
    email: client.email,
    phone: client.phone || '',
    mobile: client.mobile || '',
    contactPerson: client.contactPerson || '',
    address: client.address || '',
    city: client.city || '',
    postalCode: client.postalCode || '',
    province: client.province || '',
    country: client.country || 'ES',
    notes: client.notes || '',
    isActive: client.isActive,
    sendInvoiceByEmail: client.sendInvoiceByEmail
  }
}

const resetForm = () => {
  form.value = {
    isCompany: false,
    companyName: '',
    firstName: '',
    lastName: '',
    taxId: '',
    email: '',
    phone: '',
    mobile: '',
    contactPerson: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'ES',
    notes: '',
    isActive: true,
    sendInvoiceByEmail: true
  }
  
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = ''
  })
  
  taxIdStatus.value = null
}

// Watch for prop changes
watch(() => props.show, (show) => {
  if (show) {
    if (props.client) {
      loadClientData(props.client)
    } else {
      resetForm()
    }
  }
})

watch(() => props.client, (client) => {
  if (client && props.show) {
    loadClientData(client)
  }
})
</script>

<script lang="ts">
import '@/styles/components/ClientFormModal.css'
</script>
