<template>
  <div class="invoice-form-container">
    <div class="form-header">
      <div class="form-title-section">
        <h2 class="form-title">
          {{ isEditing ? 'Editar Factura' : 'Nueva Factura' }}
        </h2>
        <p class="form-subtitle">
          {{ isEditing ? `Factura ${invoice?.number}` : 'Crear una nueva factura o presupuesto' }}
        </p>
      </div>
      
      <div class="form-actions">
        <button 
          @click="handleCancel" 
          type="button" 
          class="btn-secondary"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        <button 
          @click="handleSave(false)" 
          type="button" 
          class="btn-primary"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? 'Guardando...' : 'Guardar Borrador' }}
        </button>
        <button 
          v-if="!isEditing || invoice?.status === 'DRAFT'" 
          @click="handleSave(true)" 
          type="button" 
          class="btn-success"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? 'Enviando...' : 'Guardar y Enviar' }}
        </button>
      </div>
    </div>

    <form @submit.prevent class="invoice-form">
      <!-- Document Info Section -->
      <div class="form-section">
        <div class="section-header">
          <h3 class="section-title">📄 Información del Documento</h3>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de Documento *</label>
            <select 
              v-model="formData.type" 
              class="form-select"
              :disabled="isEditing"
            >
              <option value="INVOICE">Factura</option>
              <option value="SIMPLIFIED_INVOICE">Factura Simplificada</option>
              <option value="QUOTE">Presupuesto</option>
              <option value="CREDIT_NOTE">Nota de Crédito</option>
              <option value="DEBIT_NOTE">Nota de Débito</option>
            </select>
            <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Serie *</label>
            <input 
              v-model="formData.series" 
              type="text" 
              class="form-input"
              placeholder="Ej: FAC, PRE"
              :disabled="isEditing"
            />
            <span v-if="errors.series" class="error-message">{{ errors.series }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Emisión *</label>
            <input 
              v-model="formData.issueDate" 
              type="date" 
              class="form-input"
            />
            <span v-if="errors.issueDate" class="error-message">{{ errors.issueDate }}</span>
          </div>

          <div class="form-group" v-if="formData.type === 'INVOICE'">
            <label class="form-label">Fecha de Vencimiento</label>
            <input 
              v-model="formData.dueDate" 
              type="date" 
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Client Selection -->
      <div class="form-section">
        <div class="section-header">
          <h3 class="section-title">👤 Cliente</h3>
          <button 
            @click="showNewClientModal = true" 
            type="button" 
            class="btn-outline-sm"
          >
            + Nuevo Cliente
          </button>
        </div>
        
        <div class="form-group">
          <label class="form-label">Seleccionar Cliente *</label>
          <select 
            v-model="formData.clientId" 
            class="form-select"
            @change="onClientChange"
          >
            <option value="">Seleccionar cliente...</option>
            <option 
              v-for="option in clientOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }} - {{ option.subtitle }}
            </option>
          </select>
          <span v-if="errors.clientId" class="error-message">{{ errors.clientId }}</span>
        </div>

        <!-- Client Info Display -->
        <div v-if="selectedClient" class="client-info-card">
          <div class="client-info-header">
            <h4 class="client-name">{{ getClientName(selectedClient) }}</h4>
            <span class="client-type-badge" :class="{ 'is-company': selectedClient.isCompany }">
              {{ selectedClient.isCompany ? 'Empresa' : 'Particular' }}
            </span>
          </div>
          <div class="client-info-details">
            <p><strong>Email:</strong> {{ selectedClient.email }}</p>
            <p v-if="selectedClient.taxId"><strong>{{ selectedClient.isCompany ? 'CIF' : 'DNI/NIE' }}:</strong> {{ selectedClient.taxId }}</p>
            <p><strong>Dirección:</strong> {{ formatClientAddress(selectedClient) }}</p>
          </div>
        </div>
      </div>

      <!-- Line Items Section -->
      <div class="form-section">
        <div class="section-header">
          <h3 class="section-title">📝 Líneas de Factura</h3>
          <button 
            @click="showProductSelector = true" 
            type="button" 
            class="btn-primary-sm"
          >
            + Agregar Producto/Servicio
          </button>
        </div>

        <div v-if="formData.lineItems.length === 0" class="empty-line-items">
          <p class="empty-message">No hay productos o servicios agregados</p>
          <p class="empty-description">Haz clic en "Agregar Producto/Servicio" para comenzar</p>
        </div>

        <div v-else class="line-items-table">
          <div class="table-header">
            <div class="col-description">Descripción</div>
            <div class="col-quantity">Cantidad</div>
            <div class="col-unit-price">Precio Unit.</div>
            <div class="col-tax">Impuesto</div>
            <div class="col-discount">Descuento</div>
            <div class="col-total">Total</div>
            <div class="col-actions">Acciones</div>
          </div>
          
          <div 
            v-for="(item, index) in formData.lineItems" 
            :key="`line-${index}`" 
            class="table-row"
          >
            <div class="col-description">
              <div class="item-info">
                <strong class="item-name">{{ item.productName }}</strong>
                <p class="item-description">{{ item.description }}</p>
              </div>
            </div>
            
            <div class="col-quantity">
              <input 
                v-model.number="item.quantity" 
                type="number" 
                min="0.01" 
                step="0.01"
                class="quantity-input"
                @input="updateLineItem(index)"
              />
              <span class="unit-type">{{ formatUnitType(item.unitType) }}</span>
            </div>
            
            <div class="col-unit-price">
              <input 
                v-model.number="item.unitPrice" 
                type="number" 
                min="0" 
                step="0.01"
                class="price-input"
                @input="updateLineItem(index)"
              />
              <span class="currency">$</span>
            </div>
            
            <div class="col-tax">
              <div class="tax-info">
                <span class="tax-rate">{{ item.taxRate }}%</span>
                <span class="tax-type">{{ formatTaxType(item.taxType) }}</span>
              </div>
            </div>
            
            <div class="col-discount">
              <input 
                v-model.number="item.discount" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                class="discount-input"
                @input="updateLineItem(index)"
              />
              <span class="percentage">%</span>
            </div>
            
            <div class="col-total">
              <div class="total-info">
                <span class="total-amount">{{ formatCurrency(calculateLineTotal(item)) }}</span>
                <span class="tax-amount">IVA: {{ formatCurrency(calculateLineTax(item)) }}</span>
              </div>
            </div>
            
            <div class="col-actions">
              <button 
                @click="removeLineItem(index)" 
                type="button" 
                class="btn-icon btn-danger"
                title="Eliminar línea"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Totals Section -->
      <div v-if="formData.lineItems.length > 0" class="form-section">
        <div class="totals-card">
          <div class="totals-grid">
            <div class="total-row">
              <span class="total-label">Subtotal (sin IVA):</span>
              <span class="total-value">{{ formatCurrency(invoiceTotals.subtotal) }}</span>
            </div>
            <div class="total-row" v-if="invoiceTotals.totalDiscount > 0">
              <span class="total-label">Descuentos:</span>
              <span class="total-value discount">-{{ formatCurrency(invoiceTotals.totalDiscount) }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Total IVA:</span>
              <span class="total-value">{{ formatCurrency(invoiceTotals.totalTax) }}</span>
            </div>
            <div class="total-row total-final">
              <span class="total-label">Total:</span>
              <span class="total-value">{{ formatCurrency(invoiceTotals.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <textarea 
            v-model="formData.notes" 
            class="form-textarea"
            rows="3"
            placeholder="Observaciones adicionales para la factura..."
          ></textarea>
        </div>
      </div>
    </form>

    <!-- Product Selector Modal -->
    <ProductSelectorModal 
      :show="showProductSelector"
      :selected-products="selectedProductIds"
      @close="showProductSelector = false"
      @select="addProductToInvoice"
    />

    <!-- New Client Modal -->
    <ClientFormModal 
      :show="showNewClientModal"
      @close="showNewClientModal = false"
      @success="onClientCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInvoicesStore } from '@/stores/invoices'
import { useClientsStore } from '@/stores/clients'
import { useProductsStore } from '@/stores/products'
import { useNotifications } from '@/composables/useNotifications'
import { DocumentType, InvoiceStatus } from '@/types'
import type { Invoice, InvoiceLineItem, Client, Product } from '@/types'
import ProductSelectorModal from '@/components/ui/ProductSelectorModal.vue'
import ClientFormModal from '@/components/ui/ClientFormModal.vue'

// Props
interface Props {
  invoiceId?: string
}

const props = defineProps<Props>()

// Stores
const invoicesStore = useInvoicesStore()
const clientsStore = useClientsStore()
const productsStore = useProductsStore()
const router = useRouter()
const { showSuccess, showError } = useNotifications()

const { clientOptions } = storeToRefs(clientsStore)

// Local state
const isSubmitting = ref(false)
const showProductSelector = ref(false)
const showNewClientModal = ref(false)
const errors = ref<Record<string, string>>({})

// Form data
const formData = ref({
  type: DocumentType.INVOICE,
  series: 'FAC',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  clientId: '',
  currency: 'USD',
  lineItems: [] as Omit<InvoiceLineItem, 'subtotal' | 'taxAmount' | 'total'>[],
  notes: ''
})

// Computed
const isEditing = computed(() => !!props.invoiceId)
const invoice = computed(() => invoicesStore.selectedInvoice)

const selectedClient = computed(() => {
  if (!formData.value.clientId) return null
  return clientsStore.getClientById(formData.value.clientId)
})

const selectedProductIds = computed(() => 
  formData.value.lineItems.map(item => item.productId)
)

const isFormValid = computed(() => {
  return formData.value.type &&
         formData.value.series &&
         formData.value.issueDate &&
         formData.value.clientId &&
         formData.value.lineItems.length > 0
})

const invoiceTotals = computed(() => {
  const processedItems = invoicesStore.calculateLineItemTotals(formData.value.lineItems)
  return invoicesStore.calculateInvoiceTotals(processedItems)
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!formData.value.type) {
    errors.value.type = 'El tipo de documento es obligatorio'
  }

  if (!formData.value.series) {
    errors.value.series = 'La serie es obligatoria'
  }

  if (!formData.value.issueDate) {
    errors.value.issueDate = 'La fecha de emisión es obligatoria'
  }

  if (!formData.value.clientId) {
    errors.value.clientId = 'Debe seleccionar un cliente'
  }

  if (formData.value.lineItems.length === 0) {
    errors.value.lineItems = 'Debe agregar al menos una línea de factura'
  }

  return Object.keys(errors.value).length === 0
}

const handleSave = async (sendInvoice = false) => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const invoiceData = {
      ...formData.value,
      lineItems: formData.value.lineItems
    }

    let savedInvoice: Invoice

    if (isEditing.value && props.invoiceId) {
      savedInvoice = await invoicesStore.updateInvoice(props.invoiceId, invoiceData)
    } else {
      savedInvoice = await invoicesStore.createInvoice(invoiceData)
    }

    // Send invoice if requested
    if (sendInvoice && savedInvoice.status === InvoiceStatus.DRAFT) {
      await invoicesStore.sendInvoice(savedInvoice.id)
    }

    const action = isEditing.value ? 'actualizada' : 'creada'
    const status = sendInvoice ? 'y enviada' : ''
    
    showSuccess(
      'Factura guardada', 
      `La factura ha sido ${action} ${status} exitosamente`
    )

    // Navigate back to list
    router.push('/invoices')

  } catch (err) {
    showError(
      'Error al guardar',
      err instanceof Error ? err.message : 'No se pudo guardar la factura'
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  if (confirm('¿Descartar los cambios y volver al listado?')) {
    router.push('/invoices')
  }
}

const onClientChange = () => {
  // Auto-set due date based on client type (30 days for companies, 15 for individuals)
  if (formData.value.type === DocumentType.INVOICE && selectedClient.value) {
    const daysToAdd = selectedClient.value.isCompany ? 30 : 15
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + daysToAdd)
    formData.value.dueDate = dueDate.toISOString().split('T')[0]
  }
}

const addProductToInvoice = (product: Product) => {
  // Check if product already exists
  const existingIndex = formData.value.lineItems.findIndex(
    item => item.productId === product.id
  )

  if (existingIndex !== -1) {
    // Increase quantity
    formData.value.lineItems[existingIndex].quantity += 1
  } else {
    // Add new line item
    const lineItem = {
      productId: product.id,
      productName: product.name,
      description: product.description || undefined,
      quantity: 1,
      unitPrice: product.unitPrice,
      unitType: product.unitType,
      taxType: product.taxType,
      taxRate: product.taxRate,
      discount: 0
    }
    
    formData.value.lineItems.push(lineItem)
  }
}

const removeLineItem = (index: number) => {
  formData.value.lineItems.splice(index, 1)
}

const updateLineItem = (index: number) => {
  // Trigger reactivity - totals will be recalculated automatically
  const item = formData.value.lineItems[index]
  
  // Ensure valid values
  if (item.quantity < 0.01) item.quantity = 0.01
  if (item.unitPrice < 0) item.unitPrice = 0
  if (item.discount !== undefined) {
    if (item.discount < 0) item.discount = 0
    if (item.discount > 100) item.discount = 100
  }
}

const calculateLineTotal = (item: Omit<InvoiceLineItem, 'subtotal' | 'taxAmount' | 'total'>) => {
  const subtotalBeforeDiscount = item.quantity * item.unitPrice
  const discountAmount = subtotalBeforeDiscount * (item.discount || 0) / 100
  const subtotal = subtotalBeforeDiscount - discountAmount
  const taxAmount = subtotal * (item.taxRate || 0) / 100
  return subtotal + taxAmount
}

const calculateLineTax = (item: Omit<InvoiceLineItem, 'subtotal' | 'taxAmount' | 'total'>) => {
  const subtotalBeforeDiscount = item.quantity * item.unitPrice
  const discountAmount = subtotalBeforeDiscount * (item.discount || 0) / 100
  const subtotal = subtotalBeforeDiscount - discountAmount
  return subtotal * (item.taxRate || 0) / 100
}

const onClientCreated = (client: Client) => {
  formData.value.clientId = client.id
  showNewClientModal.value = false
  const clientName = client.isCompany ? (client.companyName || 'Cliente') : `${client.firstName} ${client.lastName}`.trim()
  showSuccess('Cliente creado', `${clientName} ha sido creado y seleccionado`)
}

// Helper functions
const getClientName = (client: Client) => {
  return client.isCompany ? (client.companyName || 'Cliente') : `${client.firstName} ${client.lastName}`.trim()
}

const formatClientAddress = (client: Client) => {
  return `${client.address}, ${client.city}, ${client.postalCode}, ${client.country}`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatUnitType = (unitType: string) => {
  const units: Record<string, string> = {
    'UNIT': 'ud.',
    'HOUR': 'h',
    'DAY': 'día',
    'MONTH': 'mes',
    'METER': 'm',
    'KILOGRAM': 'kg',
    'LITER': 'l',
    'PACKAGE': 'paq.'
  }
  return units[unitType] || 'ud.'
}

const formatTaxType = (taxType: string) => {
  const types: Record<string, string> = {
    'IVA_GENERAL': 'IVA',
    'IVA_REDUCED': 'IVA Red.',
    'IVA_SUPER_REDUCED': 'IVA S.Red.',
    'IVA_EXEMPT': 'Exento',
    'SPECIAL_TAX': 'Esp.'
  }
  return types[taxType] || 'IVA'
}

// Load initial data
const loadInitialData = async () => {
  try {
    await Promise.all([
      clientsStore.fetchClients({ isActive: true }),
      productsStore.fetchProducts()
    ])

    // Load existing invoice if editing
    if (isEditing.value && props.invoiceId) {
      const invoice = await invoicesStore.fetchInvoice(props.invoiceId)
      if (invoice) {
        formData.value = {
          type: invoice.type,
          series: invoice.series,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate || '',
          clientId: invoice.clientId,
          currency: invoice.currency,
          lineItems: invoice.lineItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitType: item.unitType,
            taxType: item.taxType,
            taxRate: item.taxRate,
            discount: item.discount || 0
          })),
          notes: invoice.notes || ''
        }
      }
    }
  } catch (err) {
    showError('Error de carga', 'No se pudieron cargar los datos iniciales')
  }
}

// Lifecycle
onMounted(() => {
  loadInitialData()
})

// Auto-set due date when issue date changes
watch(() => formData.value.issueDate, () => {
  if (formData.value.type === DocumentType.INVOICE && !isEditing.value) {
    const issueDate = new Date(formData.value.issueDate)
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 30) // Default 30 days
    formData.value.dueDate = dueDate.toISOString().split('T')[0]
  }
})
</script>

