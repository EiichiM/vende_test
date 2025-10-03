<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div v-if="type === 'price'" class="price-input-container">
      <span class="currency-symbol">$</span>
      <input
        :id="id"
        :value="modelValue"
        type="number"
        class="form-input price-input"
        :class="{ 'error': error }"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        min="0.01"
        step="0.01"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
    </div>
    
    <div v-else-if="icon" class="relative rounded-md shadow-sm">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="iconComponent" class="h-5 w-5 text-gray-400" />
      </div>
      <input
        :id="id"
        :value="modelValue"
        :type="type"
        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
        :class="{ 'error': error }"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
    </div>
    
    <textarea
      v-else-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      class="form-textarea"
      :class="{ 'error': error }"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('blur')"
    />
    
    <input
      v-else
      :id="id"
      :value="modelValue"
      :type="type"
      class="form-input"
      :class="{ 'error': error }"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />
    
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

export interface Props {
  id?: string
  label?: string
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'price'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  icon?: 'search' | 'user' | 'email'
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()

const iconComponent = computed(() => {
  if (!props.icon) return null
  
  const icons = {
    search: () => h('svg', { 
      fill: 'none', 
      stroke: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'stroke-width': '2', 
        d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' 
      })
    ]),
    user: () => h('svg', { 
      fill: 'none', 
      stroke: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'stroke-width': '2', 
        d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' 
      })
    ]),
    email: () => h('svg', { 
      fill: 'none', 
      stroke: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'stroke-width': '2', 
        d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
      })
    ])
  }
  
  return icons[props.icon] || null
})
</script>

<style scoped>
@import '@/styles/components/ui/InputField.css';
</style>