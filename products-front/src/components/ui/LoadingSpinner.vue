<!-- LoadingSpinner.vue - Reusable loading spinner -->
<template>
  <div :class="containerClass">
    <div :class="spinnerClass" :style="spinnerStyle">
      <div v-for="i in 12" :key="i" :class="dotClass" :style="getDotStyle(i)"></div>
    </div>
    <p v-if="message" :class="messageClass">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  message?: string
  center?: boolean
  overlay?: boolean
}

const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
  size: 'md',
  color: 'primary',
  center: false,
  overlay: false
})

const sizeClasses = {
  sm: { spinner: 'w-6 h-6', dot: 'w-1 h-1', text: 'text-xs' },
  md: { spinner: 'w-8 h-8', dot: 'w-1.5 h-1.5', text: 'text-sm' },
  lg: { spinner: 'w-12 h-12', dot: 'w-2 h-2', text: 'text-base' },
  xl: { spinner: 'w-16 h-16', dot: 'w-3 h-3', text: 'text-lg' }
}

const colorClasses = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
  info: 'bg-cyan-600'
}

const containerClass = computed(() => {
  const baseClass = 'flex flex-col items-center space-y-2'
  
  if (props.overlay) {
    return `${baseClass} fixed inset-0 z-50 bg-black bg-opacity-50 justify-center`
  }
  
  if (props.center) {
    return `${baseClass} justify-center h-full`
  }
  
  return baseClass
})

const spinnerClass = computed(() => {
  const size = sizeClasses[props.size]
  return `${size.spinner} relative animate-spin`
})

const dotClass = computed(() => {
  const size = sizeClasses[props.size]
  const color = colorClasses[props.color]
  return `${size.dot} ${color} rounded-full absolute`
})

const messageClass = computed(() => {
  const size = sizeClasses[props.size]
  return `${size.text} text-gray-600 font-medium`
})

const spinnerStyle = computed(() => ({
  animationDuration: '1.2s'
}))

const getDotStyle = (index: number) => {
  const angle = (index - 1) * 30 // 12 dots, 360/12 = 30 degrees
  const radian = (angle * Math.PI) / 180
  
  // Position dots in a circle
  const radius = props.size === 'sm' ? 10 : props.size === 'md' ? 14 : props.size === 'lg' ? 20 : 28
  const x = Math.cos(radian) * radius
  const y = Math.sin(radian) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${(index - 1) * 0.1}s`,
    animation: 'pulse 1.2s infinite'
  }
}
</script>

<script lang="ts">
import '@/styles/components/LoadingSpinner.css'
</script>
