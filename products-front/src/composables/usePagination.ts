/**
 * usePagination - Advanced pagination composable
 * Handles client-side and server-side pagination with URL sync
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export interface PaginationConfig {
  pageSize?: number
  maxPages?: number
  serverSide?: boolean
  urlSync?: boolean
}

export function usePagination<T>(
  items: T[] | (() => T[]),
  config: PaginationConfig = {}
) {
  const router = useRouter()
  const route = useRoute()
  
  const {
    pageSize = 20,
    maxPages = 10,
    serverSide = false,
    urlSync = false
  } = config

  // State
  const currentPage = ref(1)
  const totalItems = ref(0)
  
  // Initialize from URL if sync is enabled
  if (urlSync && route.query.page) {
    currentPage.value = parseInt(route.query.page as string) || 1
  }

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize))
  
  const paginatedItems = computed(() => {
    if (serverSide) return []
    
    const itemArray = typeof items === 'function' ? items() : items
    totalItems.value = itemArray.length
    
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return itemArray.slice(start, end)
  })

  const hasNext = computed(() => currentPage.value < totalPages.value)
  const hasPrev = computed(() => currentPage.value > 1)

  const pageNumbers = computed(() => {
    const pages: number[] = []
    const start = Math.max(1, currentPage.value - Math.floor(maxPages / 2))
    const end = Math.min(totalPages.value, start + maxPages - 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      
      if (urlSync) {
        router.push({
          query: { ...route.query, page: page.toString() }
        })
      }
    }
  }

  const nextPage = () => {
    if (hasNext.value) {
      goToPage(currentPage.value + 1)
    }
  }

  const prevPage = () => {
    if (hasPrev.value) {
      goToPage(currentPage.value - 1)
    }
  }

  const firstPage = () => goToPage(1)
  const lastPage = () => goToPage(totalPages.value)

  const setTotalItems = (total: number) => {
    totalItems.value = total
  }

  // Watch for URL changes
  if (urlSync) {
    watch(
      () => route.query.page,
      (newPage) => {
        const page = parseInt(newPage as string) || 1
        if (page !== currentPage.value) {
          currentPage.value = page
        }
      }
    )
  }

  return {
    // State
    currentPage,
    totalItems,
    pageSize,
    
    // Computed
    totalPages,
    paginatedItems,
    hasNext,
    hasPrev,
    pageNumbers,
    
    // Methods
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setTotalItems
  }
}