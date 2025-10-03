/**
 * Advanced Form Management Composable
 * Implements complex validatio  const validateField = async (fieldName: keyof T): Promise<boolean> => { field tracking, and reactive state
 */

import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormField, ValidationMessages } from '@/types'
import { VALIDATION_RULES } from '@/constants'

export interface ValidationRule<T = any> {
  validate: (value: T, form?: any) => boolean | string
  message?: string
  deps?: string[] // Dependencies - other fields to watch
}

export interface FieldConfig<T = any> {
  initialValue: T
  rules?: ValidationRule<T>[]
  debounce?: number
  validateOnChange?: boolean
  transform?: (value: T) => T
}

export interface FormConfig {
  [key: string]: FieldConfig
}

export function useAdvancedForm<T extends Record<string, any>>(config: FormConfig) {
  // Form state
  const fields = reactive<Record<string, FormField>>({})
  const isValidating = ref(false)
  const submitCount = ref(0)
  
  // Initialize fields
  Object.entries(config).forEach(([key, fieldConfig]) => {
    fields[key] = {
      value: fieldConfig.initialValue,
      error: null,
      touched: false,
      dirty: false
    }
  })

  // Computed properties
  const values = computed(() => {
    const result: Partial<T> = {}
    Object.entries(fields).forEach(([key, field]) => {
      ;(result as any)[key] = field.value
    })
    return result as T
  })

  const errors = computed(() => {
    const result: ValidationMessages = {}
    Object.entries(fields).forEach(([key, field]) => {
      if (field.error) {
        result[key] = field.error
      }
    })
    return result
  })

  const isValid = computed(() => {
    return Object.values(fields).every(field => !field.error)
  })

  const isDirty = computed(() => {
    return Object.values(fields).some(field => field.dirty)
  })

  const touchedFields = computed(() => {
    return Object.entries(fields)
      .filter(([, field]) => field.touched)
      .map(([key]) => key)
  })

  // Validation functions
  const validateField = async (fieldName: string): Promise<boolean> => {
    const field = fields[fieldName]
    const fieldConfig = config[fieldName]
    
    if (!field || !fieldConfig?.rules) return true

    field.error = null
    
    for (const rule of fieldConfig.rules) {
      const result = rule.validate(field.value, values.value)
      
      if (result !== true) {
        field.error = typeof result === 'string' ? result : rule.message || 'Invalid value'
        return false
      }
    }
    
    return true
  }

  const validateAll = async (): Promise<boolean> => {
    isValidating.value = true
    
    try {
      const validationPromises = Object.keys(fields).map(validateField)
      const results = await Promise.all(validationPromises)
      return results.every(Boolean)
    } finally {
      isValidating.value = false
    }
  }

  // Field manipulation
  const setFieldValue = (fieldName: string, value: any) => {
    const field = fields[fieldName]
    const fieldConfig = config[fieldName]
    
    if (!field) return

    // Apply transform if provided
    const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value
    
    field.value = transformedValue
    field.dirty = true
    
    // Validate on change if configured
    if (fieldConfig?.validateOnChange !== false) {
      nextTick(() => validateField(fieldName))
    }
  }

  const setFieldTouched = (fieldName: string, touched = true) => {
    const field = fields[fieldName]
    if (field) {
      field.touched = touched
      
      // Validate when field is touched
      if (touched) {
        nextTick(() => validateField(fieldName))
      }
    }
  }

  const setFieldError = (fieldName: string, error: string | null) => {
    const field = fields[fieldName]
    if (field) {
      field.error = error
    }
  }

  // Form operations
  const reset = () => {
    Object.entries(config).forEach(([key, fieldConfig]) => {
      const field = fields[key]
      if (field) {
        field.value = fieldConfig.initialValue
        field.error = null
        field.touched = false
        field.dirty = false
      }
    })
    submitCount.value = 0
  }

  const submit = async (onSubmit: (values: T) => Promise<void> | void) => {
    submitCount.value++
    
    // Mark all fields as touched
    Object.keys(fields).forEach(key => setFieldTouched(key, true))
    
    const isFormValid = await validateAll()
    
    if (isFormValid) {
      await onSubmit(values.value)
    }
    
    return isFormValid
  }

  // Watch for field dependencies
  Object.entries(config).forEach(([fieldName, fieldConfig]) => {
    if (fieldConfig.rules) {
      fieldConfig.rules.forEach(rule => {
        if (rule.deps?.length) {
          // Watch dependent fields
          rule.deps.forEach(depField => {
            watch(
              () => fields[depField]?.value,
              () => {
                if (fields[fieldName].touched) {
                  nextTick(() => validateField(fieldName))
                }
              },
              { deep: true }
            )
          })
        }
      })
    }
  })

  return {
    // State
    fields,
    values,
    errors,
    isValidating,
    submitCount,
    
    // Computed
    isValid,
    isDirty,
    touchedFields,
    
    // Methods
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validateAll,
    reset,
    submit
  }
}

// Common validation rules
export const validationRules = {
  required: (message = 'Este campo es obligatorio'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0
      return value != null && value !== ''
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `Mínimo ${min} caracteres`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `Máximo ${max} caracteres`
  }),

  email: (message = 'Email inválido'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message
  }),

  number: (message = 'Debe ser un número válido'): ValidationRule => ({
    validate: (value) => {
      if (value === '' || value == null) return true
      return !isNaN(Number(value))
    },
    message
  }),

  min: (minValue: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value == null) return true
      return Number(value) >= minValue
    },
    message: message || `Valor mínimo: ${minValue}`
  }),

  max: (maxValue: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value == null) return true
      return Number(value) <= maxValue
    },
    message: message || `Valor máximo: ${maxValue}`
  }),

  // Product-specific validations
  productName: (): ValidationRule<string> => ({
    validate: (value) => {
      if (!value || typeof value !== 'string') return false
      const trimmed = value.trim()
      return trimmed.length >= VALIDATION_RULES.PRODUCT_NAME.MIN_LENGTH &&
             trimmed.length <= VALIDATION_RULES.PRODUCT_NAME.MAX_LENGTH
    },
    message: `El nombre debe tener entre ${VALIDATION_RULES.PRODUCT_NAME.MIN_LENGTH} y ${VALIDATION_RULES.PRODUCT_NAME.MAX_LENGTH} caracteres`
  }),

  unitPrice: (): ValidationRule<number> => ({
    validate: (value) => {
      const num = Number(value)
      return !isNaN(num) && 
             num >= VALIDATION_RULES.UNIT_PRICE.MIN_VALUE &&
             num <= VALIDATION_RULES.UNIT_PRICE.MAX_VALUE
    },
    message: `El precio debe estar entre $${VALIDATION_RULES.UNIT_PRICE.MIN_VALUE} y $${VALIDATION_RULES.UNIT_PRICE.MAX_VALUE.toLocaleString()}`
  })
}