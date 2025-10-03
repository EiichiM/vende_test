<!-- LoadingState.vue - Componente moderno de carga con skeletons -->
<template>
  <div :class="containerClass">
    <div class="loading-state-content">
      <!-- Loading Illustration/Spinner -->
      <div v-if="shouldShowIllustration" class="loading-illustration">
        <slot name="illustration">
          <div class="loading-spinner-container">
            <svg class="loading-spinner" viewBox="0 0 120 120">
              <!-- Outer ring -->
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="var(--primary-color)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-dasharray="30 10"
                class="spinner-outer"
              />
              
              <!-- Inner ring -->
              <circle
                cx="60"
                cy="60"
                r="35"
                fill="none"
                stroke="var(--primary-color)"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-dasharray="20 15"
                stroke-opacity="0.6"
                class="spinner-inner"
              />
              
              <!-- Center dot -->
              <circle
                cx="60"
                cy="60"
                r="4"
                fill="var(--primary-color)"
                class="spinner-center"
              />
            </svg>
          </div>
        </slot>
      </div>

      <!-- Loading Text -->
      <div v-if="shouldShowText" class="loading-text">
        <h3 class="loading-title">{{ title }}</h3>
        <p v-if="description" class="loading-description">{{ description }}</p>
        
        <!-- Progress indicator (optional) -->
        <div v-if="progress !== undefined" class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${Math.max(0, Math.min(100, progress))}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ Math.round(progress) }}%</span>
        </div>
      </div>

      <!-- Skeleton Content -->
      <div v-if="variant === 'skeleton' || variant === 'both'" class="skeleton-container">
        <slot name="skeleton">
          <!-- Default table skeleton -->
          <div v-if="skeletonType === 'table'" class="skeleton-table">
            <div class="skeleton-header">
              <div 
                v-for="n in skeletonColumns" 
                :key="`header-${n}`" 
                class="skeleton-header-cell"
              ></div>
            </div>
            <div 
              v-for="row in skeletonRows" 
              :key="`row-${row}`" 
              class="skeleton-row"
            >
              <div 
                v-for="col in skeletonColumns" 
                :key="`cell-${row}-${col}`" 
                class="skeleton-cell"
                :style="{ animationDelay: `${(row - 1) * 100 + col * 50}ms` }"
              ></div>
            </div>
          </div>

          <!-- Cards skeleton -->
          <div v-else-if="skeletonType === 'cards'" class="skeleton-cards">
            <div 
              v-for="n in skeletonRows" 
              :key="`card-${n}`" 
              class="skeleton-card"
              :style="{ animationDelay: `${n * 150}ms` }"
            >
              <div class="skeleton-card-header"></div>
              <div class="skeleton-card-content">
                <div class="skeleton-line skeleton-line--title"></div>
                <div class="skeleton-line skeleton-line--text"></div>
                <div class="skeleton-line skeleton-line--text skeleton-line--short"></div>
              </div>
            </div>
          </div>

          <!-- List skeleton -->
          <div v-else class="skeleton-list">
            <div 
              v-for="n in skeletonRows" 
              :key="`list-${n}`" 
              class="skeleton-list-item"
              :style="{ animationDelay: `${n * 100}ms` }"
            >
              <div class="skeleton-avatar"></div>
              <div class="skeleton-list-content">
                <div class="skeleton-line skeleton-line--title"></div>
                <div class="skeleton-line skeleton-line--text skeleton-line--short"></div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'both'
  title?: string
  description?: string
  progress?: number
  showText?: boolean
  showIllustration?: boolean
  centered?: boolean
  size?: 'sm' | 'md' | 'lg'
  skeletonType?: 'table' | 'cards' | 'list'
  skeletonRows?: number
  skeletonColumns?: number
}

const props = withDefaults(defineProps<LoadingStateProps>(), {
  variant: 'spinner',
  title: 'Cargando...',
  description: undefined,
  progress: undefined,
  showText: true,
  showIllustration: true,
  centered: true,
  size: 'md',
  skeletonType: 'table',
  skeletonRows: 5,
  skeletonColumns: 6
})

const containerClass = computed(() => {
  const base = 'loading-state'
  const centered = props.centered ? 'loading-state--centered' : ''
  const size = `loading-state--${props.size}`
  const variant = `loading-state--${props.variant}`
  
  return [base, centered, size, variant].filter(Boolean).join(' ')
})

// Show illustration only for spinner and both variants
const shouldShowIllustration = computed(() => {
  return props.variant !== 'skeleton' && props.showIllustration
})

// Show text for spinner and both variants, but not for skeleton by default
const shouldShowText = computed(() => {
  if (props.variant === 'skeleton') {
    return false // Hide text by default for skeleton
  }
  return props.showText
})
</script>

<script lang="ts">
import '@/styles/components/LoadingState.css'
</script>
