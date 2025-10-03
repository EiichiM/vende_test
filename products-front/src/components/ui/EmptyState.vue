<!-- EmptyState.vue - Estado vacío mejorado para cuando no hay datos -->
<template>
  <div :class="containerClass">
    <div class="empty-state-content">
      <!-- Illustration Area -->
      <div class="empty-state-illustration">
        <slot name="illustration">
          <!-- Animated Empty Products Icon -->
          <div class="empty-products-illustration">
            <svg viewBox="0 0 120 120" class="empty-icon">
              <!-- Background circle -->
              <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.2" class="rotate-animation"/>
              
              <!-- Product boxes -->
              <rect x="35" y="40" width="20" height="20" rx="3" fill="currentColor" opacity="0.3" class="float-animation-1"/>
              <rect x="65" y="35" width="20" height="20" rx="3" fill="currentColor" opacity="0.25" class="float-animation-2"/>
              <rect x="50" y="60" width="20" height="20" rx="3" fill="currentColor" opacity="0.2" class="float-animation-3"/>
              
              <!-- Plus icon for adding products -->
              <circle cx="85" cy="25" r="8" fill="var(--primary-color)" opacity="0.8" class="pulse-animation"/>
              <path d="M85 21 L85 29 M81 25 L89 25" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </slot>
      </div>
      
      <!-- Title with gradient -->
      <h3 class="empty-state-title">{{ title }}</h3>
      
      <!-- Description -->
      <p v-if="description" class="empty-state-description">
        {{ description }}
      </p>
      
      <!-- Action buttons -->
      <div v-if="$slots.actions || primaryAction" class="empty-state-actions">
        <slot name="actions">
          <button 
            v-if="primaryAction" 
            type="button"
            @click="$emit('primary-action')"
            class="empty-state-primary-btn"
          >
            <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ primaryAction.label }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface EmptyStateProps {
  title: string
  description?: string
  centered?: boolean
  size?: 'sm' | 'md' | 'lg'
  primaryAction?: {
    label: string
  }
}

interface EmptyStateEmits {
  'primary-action': []
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  centered: true,
  size: 'md',
  primaryAction: undefined
})

defineEmits<EmptyStateEmits>()

const containerClass = computed(() => {
  const base = 'empty-state'
  const centered = props.centered ? 'empty-state--centered' : ''
  const size = `empty-state--${props.size}`
  
  return [base, centered, size].filter(Boolean).join(' ')
})
</script>

<style scoped>
@import '@/styles/components/ui/EmptyState.css';
</style>