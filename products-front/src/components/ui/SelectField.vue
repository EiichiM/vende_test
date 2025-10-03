<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <select
      :id="id"
      :value="modelValue"
      class="form-select"
      :class="{ 'error': error }"
      :required="required"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="$emit('blur')"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
export interface Option {
  value: string | number
  label: string
}

export interface Props {
  id?: string
  label?: string
  modelValue: string | number
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()
</script>

<script lang="ts">
import '@/styles/components/SelectField.css'
</script>
