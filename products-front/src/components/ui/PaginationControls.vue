<template>
  <div class="pagination">
    <div class="pagination-info">
      Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} {{ itemLabel }}
    </div>
    <div class="pagination-controls">
      <button 
        @click="goToPage(1)" 
        :disabled="currentPage === 1"
        class="pagination-btn"
        title="Primera página"
      >
        ⏮️
      </button>
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="pagination-btn"
        title="Página anterior"
      >
        ◀️
      </button>
      <span class="pagination-current">Página {{ currentPage }} de {{ totalPages }}</span>
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        title="Página siguiente"
      >
        ▶️
      </button>
      <button 
        @click="goToPage(totalPages)" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        title="Última página"
      >
        ⏭️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface Props {
  currentPage: number
  totalItems: number
  pageSize: number
  itemLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemLabel: 'elementos'
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const startItem = computed(() => (props.currentPage - 1) * props.pageSize + 1)

const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems))

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
@import '@/styles/components/ui/PaginationControls.css';
</style>