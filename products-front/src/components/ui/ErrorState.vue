<!-- ErrorState.vue - Componente mejorado para manejo de errores -->
<template>
  <div :class="containerClass">
    <div class="error-state-content">
      <!-- Error Icon/Illustration -->
      <div class="error-state-illustration">
        <slot name="illustration">
          <div class="error-illustration">
            <svg viewBox="0 0 120 120" class="error-icon">
              <!-- Background circle with gradient -->
              <defs>
                <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#fef2f2"/>
                  <stop offset="100%" style="stop-color:#fee2e2"/>
                </linearGradient>
              </defs>
              
              <!-- Background -->
              <circle cx="60" cy="60" r="45" fill="url(#errorGradient)" stroke="#fecaca" stroke-width="1"/>
              
              <!-- Error symbol with animation -->
              <g class="error-symbol">
                <!-- Exclamation mark -->
                <circle cx="60" cy="45" r="3" :fill="typeColors[type]"/>
                <rect x="57" y="25" width="6" height="15" rx="3" :fill="typeColors[type]"/>
                
                <!-- Additional elements based on error type -->
                <g v-if="type === 'network'">
                  <!-- WiFi bars (broken) -->
                  <path d="M35 75 Q60 50 85 75" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="5,5"/>
                  <circle cx="75" cy="68" r="2" fill="#ef4444"/>
                </g>
                
                <g v-if="type === 'server'">
                  <!-- Server icon -->
                  <rect x="45" y="70" width="30" height="20" rx="2" fill="none" stroke="#ef4444" stroke-width="1.5"/>
                  <line x1="48" y1="76" x2="72" y2="76" stroke="#ef4444" stroke-width="1"/>
                  <line x1="48" y1="82" x2="65" y2="82" stroke="#ef4444" stroke-width="1"/>
                </g>
                
                <g v-if="type === 'forbidden'">
                  <!-- Lock icon -->
                  <rect x="50" y="75" width="20" height="15" rx="2" fill="none" stroke="#ef4444" stroke-width="1.5"/>
                  <path d="M55 75 V70 Q55 65 60 65 Q65 65 65 70 V75" fill="none" stroke="#ef4444" stroke-width="1.5"/>
                </g>
              </g>
            </svg>
          </div>
        </slot>
      </div>
      
      <!-- Error Content -->
      <div class="error-state-text">
        <h3 class="error-state-title">{{ title }}</h3>
        
        <p v-if="description" class="error-state-description">
          {{ description }}
        </p>
        
        <!-- Technical details (collapsible) -->
        <div v-if="details && showDetails" class="error-details">
          <div class="error-details-toggle" @click="toggleDetails">
            <span>{{ detailsExpanded ? 'Ocultar' : 'Ver' }} detalles técnicos</span>
            <svg 
              :class="['details-chevron', { 'details-chevron--expanded': detailsExpanded }]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <div v-if="detailsExpanded" class="error-details-content">
            <pre>{{ details }}</pre>
          </div>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="error-state-actions">
        <slot name="actions">
          <button 
            v-if="primaryAction" 
            type="button"
            @click="$emit('primary-action')"
            class="error-state-primary-btn"
            :disabled="loading"
          >
            <svg v-if="loading" class="btn-spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.2"/>
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
            </svg>
            <svg v-else class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? 'Cargando...' : primaryAction.label }}
          </button>
          
          <button 
            v-if="secondaryAction" 
            type="button"
            @click="$emit('secondary-action')"
            class="error-state-secondary-btn"
          >
            {{ secondaryAction.label }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface ErrorStateProps {
  type?: 'general' | 'network' | 'server' | 'forbidden' | 'notfound'
  title?: string
  description?: string
  details?: string
  showDetails?: boolean
  loading?: boolean
  centered?: boolean
  size?: 'sm' | 'md' | 'lg'
  primaryAction?: {
    label: string
  }
  secondaryAction?: {
    label: string
  }
}

interface ErrorStateEmits {
  'primary-action': []
  'secondary-action': []
}

const props = withDefaults(defineProps<ErrorStateProps>(), {
  type: 'general',
  title: 'Algo salió mal',
  description: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
  details: undefined,
  showDetails: false,
  loading: false,
  centered: true,
  size: 'md',
  primaryAction: undefined,
  secondaryAction: undefined
})

defineEmits<ErrorStateEmits>()

const detailsExpanded = ref(false)

const typeColors = {
  general: '#ef4444',
  network: '#f59e0b',
  server: '#ef4444',
  forbidden: '#dc2626',
  notfound: '#6b7280'
}

const containerClass = computed(() => {
  const base = 'error-state'
  const centered = props.centered ? 'error-state--centered' : ''
  const size = `error-state--${props.size}`
  const typeClass = `error-state--${props.type}`
  
  return [base, centered, size, typeClass].filter(Boolean).join(' ')
})

const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value
}
</script>

<script lang="ts">
import '@/styles/components/ErrorState.css'
</script>
