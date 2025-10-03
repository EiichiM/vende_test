<template>
  <div class="product-form">
    <div class="form-header">
      <h2 class="form-title">{{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
      <p class="form-subtitle">Complete la información del producto/servicio</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <!-- Información Básica -->
      <div class="form-section">
        <h3 class="section-title">Información Básica</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <InputField
              id="name"
              v-model="formData.name"
              label="Nombre del producto"
              placeholder="Ingresa el nombre del producto"
              :required="true"
              :error="errors.name"
              @blur="validateName"
            />
          </div>

          <div class="form-group full-width">
            <InputField
              id="description"
              v-model="formData.description"
              type="textarea"
              label="Descripción"
              placeholder="Describe el producto (opcional)"
              :rows="4"
              :error="errors.description"
              @blur="validateDescription"
            />
          </div>

          <div class="form-group">
            <SelectField
              id="companyId"
              v-model="formData.companyId"
              label="Compañía"
              :options="companyOptions"
              placeholder="Selecciona una compañía"
              :required="true"
              :error="errors.companyId"
              @blur="validateCompanyId"
            />
          </div>

          <div class="form-group">
            <SelectField
              id="category"
              v-model="formData.category"
              label="Tipo de Producto/Servicio"
              :options="categoryOptions"
              placeholder="Selecciona el tipo"
              :required="true"
              :error="errors.category"
              @blur="validateCategory"
            />
          </div>

          <div class="form-group">
            <InputField
              id="code"
              v-model="formData.code"
              label="Código del Producto"
              placeholder="Ej: PROD-001"
              :required="true"
              :error="errors.code"
              @blur="validateCode"
            />
          </div>

          <div class="form-group">
            <InputField
              id="barcode"
              v-model="formData.barcode!"
              label="Código de Barras (opcional)"
              placeholder="Código EAN13"
              :error="errors.barcode"
              @blur="validateBarcode"
            />
          </div>
        </div>
      </div>

      <!-- Precios e Impuestos -->
      <div class="form-section">
        <h3 class="section-title">Precios e Impuestos</h3>
        <div class="form-grid">
          <div class="form-group">
            <InputField
              id="unitPrice"
              v-model="formData.unitPrice"
              type="price"
              label="Precio Unitario ($, sin impuestos)"
              placeholder="0.00"
              :required="true"
              :error="errors.unitPrice"
              @blur="validateUnitPrice"
            />
          </div>

          <div class="form-group">
            <SelectField
              id="unitType"
              v-model="formData.unitType"
              label="Unidad de Medida"
              :options="unitTypeOptions"
              placeholder="Selecciona la unidad"
              :required="true"
              :error="errors.unitType"
              @blur="validateUnitType"
            />
          </div>

          <div class="form-group">
            <SelectField
              id="taxType"
              v-model="formData.taxType"
              label="Tipo de Impuesto"
              :options="taxTypeOptions"
              placeholder="Selecciona el tipo de IVA"
              :required="true"
              :error="errors.taxType"
              @blur="validateTaxType"
            />
          </div>

          <div class="form-group">
            <InputField
              id="taxRate"
              v-model="formData.taxRate"
              type="number"
              label="Tasa de Impuesto (%)"
              placeholder="21"
              :required="true"
              :error="errors.taxRate"
              @blur="validateTaxRate"
            />
          </div>
        </div>
      </div>

      <!-- Configuración de Inventario -->
      <div class="form-section">
        <h3 class="section-title">Configuración de Inventario</h3>
        <div class="form-group">
          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="formData.trackStock"
              class="checkbox-input"
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">Hacer seguimiento de inventario</span>
          </label>
          <p class="help-text">Activar para controlar stock y recibir alertas de inventario bajo</p>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button
          type="button"
          @click="handleCancel"
          class="btn btn-secondary"
          :disabled="isSubmitting"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting || !isFormValid"
        >
          {{ isSubmitting ? 'Guardando...' : submitButtonText }}
        </button>
      </div>

      <!-- Mensaje de error general -->
      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCompaniesStore } from '@/stores/companies'
import { useNotifications } from '@/composables/useNotifications'
import { InputField, SelectField } from '@/components/ui'
import type { ProductFormData, CreateProductDto, UpdateProductDto, ProductCategory, TaxType, UnitType } from '@/types'

// Props
interface Props {
  productId?: string
}

const props = defineProps<Props>()

// Stores y router
const productsStore = useProductsStore()
const companiesStore = useCompaniesStore()
const notifications = useNotifications()
const router = useRouter()
const route = useRoute()

// Estado del formulario
const formData = reactive<ProductFormData>({
  name: '',
  description: '',
  unitPrice: '',
  companyId: '',
  category: 'PRODUCT' as ProductCategory,
  code: '',
  taxType: 'IVA_GENERAL' as TaxType,
  taxRate: '21',
  unitType: 'UNIT' as UnitType,
  barcode: '' as string,
  trackStock: false,
})

const errors = reactive({
  name: '',
  description: '',
  unitPrice: '',
  companyId: '',
  category: '',
  code: '',
  taxType: '',
  taxRate: '',
  unitType: '',
  barcode: '',
})

const isSubmitting = ref(false)
const generalError = ref('')
const isEditMode = computed(() => !!route.params.id)

// Computed
const companyOptions = computed(() => companiesStore.companyOptions)
const categoryOptions = computed(() => [
  { value: 'PRODUCT', label: 'Producto Físico' },
  { value: 'SERVICE', label: 'Servicio' },
  { value: 'DIGITAL_SERVICE', label: 'Servicio Digital' },
  { value: 'CONSULTATION', label: 'Consultoría' },
  { value: 'RENTAL', label: 'Alquiler' },
  { value: 'OTHER', label: 'Otros' }
])

const taxTypeOptions = computed(() => [
  { value: 'IVA_GENERAL', label: 'IVA General (21%)' },
  { value: 'IVA_REDUCED', label: 'IVA Reducido (10%)' },
  { value: 'IVA_SUPER_REDUCED', label: 'IVA Superreducido (4%)' },
  { value: 'IVA_EXEMPT', label: 'Exento de IVA (0%)' },
  { value: 'SPECIAL_TAX', label: 'Impuesto Especial' }
])

const unitTypeOptions = computed(() => [
  { value: 'UNIT', label: 'Unidad' },
  { value: 'HOUR', label: 'Hora' },
  { value: 'DAY', label: 'Día' },
  { value: 'MONTH', label: 'Mes' },
  { value: 'METER', label: 'Metro' },
  { value: 'KILOGRAM', label: 'Kilogramo' },
  { value: 'LITER', label: 'Litro' },
  { value: 'PACKAGE', label: 'Paquete' }
])
const submitButtonText = computed(() => isEditMode.value ? 'Actualizar Producto' : 'Crear Producto')

const isFormValid = computed(() => {
  return formData.name.trim() &&
         formData.companyId &&
         formData.category &&
         formData.code.trim() &&
         formData.unitPrice &&
         parseFloat(formData.unitPrice.toString()) > 0 &&
         formData.taxType &&
         formData.taxRate &&
         parseFloat(formData.taxRate.toString()) >= 0 &&
         formData.unitType &&
         !Object.values(errors).some(error => error)
})

// Validaciones
function validateName() {
  if (!formData.name.trim()) {
    errors.name = 'El nombre es obligatorio'
  } else if (formData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (formData.name.trim().length > 255) {
    errors.name = 'El nombre no puede exceder 255 caracteres'
  } else {
    errors.name = ''
  }
}

function validateDescription() {
  if (formData.description && formData.description.length > 1000) {
    errors.description = 'La descripción no puede exceder 1000 caracteres'
  } else {
    errors.description = ''
  }
}

function validateUnitPrice() {
  if (!formData.unitPrice) {
    errors.unitPrice = 'El precio unitario es obligatorio'
  } else {
    const price = parseFloat(formData.unitPrice.toString())
    if (isNaN(price) || price <= 0) {
      errors.unitPrice = 'El precio debe ser un número positivo'
    } else if (price < 0.01) {
      errors.unitPrice = 'El precio mínimo es 0.01'
    } else if (price > 999999.99) {
      errors.unitPrice = 'El precio no puede exceder 999,999.99'
    } else {
      errors.unitPrice = ''
    }
  }
}

function validateCode() {
  if (!formData.code.trim()) {
    errors.code = 'El código del producto es obligatorio'
  } else if (formData.code.trim().length < 2) {
    errors.code = 'El código debe tener al menos 2 caracteres'
  } else if (formData.code.trim().length > 50) {
    errors.code = 'El código no puede exceder 50 caracteres'
  } else {
    errors.code = ''
  }
}

function validateTaxType() {
  if (!formData.taxType) {
    errors.taxType = 'Debes seleccionar un tipo de impuesto'
  } else {
    errors.taxType = ''
    // Auto-set tax rate based on tax type
    if (formData.taxType === 'IVA_GENERAL') formData.taxRate = '21'
    else if (formData.taxType === 'IVA_REDUCED') formData.taxRate = '10'
    else if (formData.taxType === 'IVA_SUPER_REDUCED') formData.taxRate = '4'
    else if (formData.taxType === 'IVA_EXEMPT') formData.taxRate = '0'
  }
}

function validateTaxRate() {
  if (!formData.taxRate && formData.taxRate !== '0') {
    errors.taxRate = 'La tasa de impuesto es obligatoria'
  } else {
    const rate = parseFloat(formData.taxRate.toString())
    if (isNaN(rate) || rate < 0 || rate > 100) {
      errors.taxRate = 'La tasa debe estar entre 0 y 100'
    } else {
      errors.taxRate = ''
    }
  }
}

function validateUnitType() {
  if (!formData.unitType) {
    errors.unitType = 'Debes seleccionar una unidad de medida'
  } else {
    errors.unitType = ''
  }
}

function validateBarcode() {
  if (formData.barcode && formData.barcode.length > 13) {
    errors.barcode = 'El código de barras no puede exceder 13 caracteres'
  } else {
    errors.barcode = ''
  }
}

function validateCompanyId() {
  if (!formData.companyId) {
    errors.companyId = 'Debes seleccionar una compañía'
  } else {
    errors.companyId = ''
  }
}

function validateCategory() {
  if (!formData.category) {
    errors.category = 'Debes seleccionar una categoría'
  } else {
    errors.category = ''
  }
}

// Validación automática cuando cambian los campos
watch(() => formData.name, validateName)
watch(() => formData.description, validateDescription)
watch(() => formData.unitPrice, validateUnitPrice)
watch(() => formData.companyId, validateCompanyId)
watch(() => formData.category, validateCategory)
watch(() => formData.code, validateCode)
watch(() => formData.taxType, validateTaxType)
watch(() => formData.taxRate, validateTaxRate)
watch(() => formData.unitType, validateUnitType)
watch(() => formData.barcode, validateBarcode)

// Funciones

function resetForm() {
  formData.name = ''
  formData.description = ''
  formData.unitPrice = ''
  formData.companyId = ''
  formData.category = 'PRODUCT' as ProductCategory
  formData.code = ''
  formData.taxType = 'IVA_GENERAL' as TaxType
  formData.taxRate = '21'
  formData.unitType = 'UNIT' as UnitType
  formData.barcode = ''
  formData.trackStock = false
  
  // Limpiar errores
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  generalError.value = ''
}

function validateForm(): boolean {
  validateName()
  validateDescription()
  validateUnitPrice()
  validateCompanyId()
  validateCategory()
  validateCode()
  validateTaxType()
  validateTaxRate()
  validateUnitType()
  validateBarcode()
  
  return !Object.values(errors).some(error => error)
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  generalError.value = ''

  try {
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      unitPrice: parseFloat(formData.unitPrice.toString()),
      currency: 'USD',
      companyId: formData.companyId,
      category: formData.category,
      code: formData.code.trim(),
      taxType: formData.taxType,
      taxRate: parseFloat(formData.taxRate.toString()),
      unitType: formData.unitType,
      barcode: formData.barcode?.trim() || undefined,
      trackStock: formData.trackStock,
    }

    let savedProduct: any;
    if (isEditMode.value) {
      const productId = route.params.id as string
      savedProduct = await productsStore.updateProduct(productId, productData as UpdateProductDto)
      
      // Mostrar notificación de éxito para actualización
      notifications.showSuccess(
        'Producto actualizado',
        `El producto "${savedProduct.name}" se ha actualizado correctamente.`,
        [
          {
            label: 'Ver producto',
            handler: () => router.push(`/products/${savedProduct.id}`)
          }
        ]
      )
    } else {
      savedProduct = await productsStore.createProduct(productData as CreateProductDto)
      
      // Mostrar notificación de éxito para creación
      notifications.showSuccess(
        'Producto creado exitosamente',
        `El producto "${savedProduct.name}" se ha creado correctamente.`,
        [
          {
            label: 'Crear otro',
            handler: () => {
              resetForm()
              // No redirigir, quedarse en el formulario
            }
          },
          {
            label: 'Ver producto',
            handler: () => router.push(`/products/${savedProduct.id}`)
          }
        ]
      )
    }

    // Esperar un poco para que el usuario vea la notificación
    setTimeout(() => {
      // Redirigir a la lista de productos
      router.push('/products')
    }, 1000)

  } catch (error: any) {
    const errorMessage = error.message || 'Error al guardar el producto'
    generalError.value = errorMessage
    
    // Mostrar notificación de error
    notifications.showError(
      isEditMode.value ? 'Error al actualizar producto' : 'Error al crear producto',
      errorMessage,
      [
        {
          label: 'Reintentar',
          handler: () => {
            generalError.value = ''
            handleSubmit()
          }
        }
      ]
    )
    
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/products')
}

// Watch for product data changes
watch(() => productsStore.selectedProduct, (newProduct) => {
  if (newProduct && isEditMode.value) {
    formData.name = newProduct.name
    formData.description = newProduct.description || ''
    formData.unitPrice = newProduct.unitPrice?.toString() || '0'
    formData.companyId = newProduct.companyId
    formData.category = newProduct.category as ProductCategory || 'PRODUCT'
    formData.code = newProduct.code || ''
    formData.taxType = newProduct.taxType as TaxType || 'IVA_GENERAL'
    formData.taxRate = newProduct.taxRate?.toString() || '21'
    formData.unitType = newProduct.unitType as UnitType || 'UNIT'
    formData.barcode = newProduct.barcode || ''
    formData.trackStock = newProduct.trackStock || false
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Solo cargar compañías si no están disponibles
  if (!companiesStore.hasCompanies) {
    await companiesStore.fetchCompanies()
  }
})
</script>

<style scoped>
.product-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.form-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* Checkbox Styling */
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.checkbox-container:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-text {
  font-weight: 500;
  color: #334155;
  font-size: 1rem;
}

.help-text {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
  margin-left: 2.75rem;
  font-style: italic;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
  margin-top: 2rem;
}

.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-width: 120px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

/* Responsive Design */
@media (max-width: 768px) {
  .product-form {
    padding: 1rem;
    margin: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
}

/* Loading States */
.btn:disabled {
  position: relative;
}

.btn:disabled::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  right: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

