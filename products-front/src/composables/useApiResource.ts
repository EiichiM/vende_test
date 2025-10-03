/**
 * useApiResource - Advanced resource management composable
 * Implements retry logic, caching, optimistic updates and error recovery
 */

import { ref, computed, toRefs } from 'vue'
import type { ResourceState, ApiError, ApiStatus } from '@/types'

export interface UseApiResourceOptions {
  immediate?: boolean
  retries?: number
  retryDelay?: number
  cacheTime?: number
  staleTime?: number
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
}

export function useApiResource<T>(
  fetcher: () => Promise<T>,
  options: UseApiResourceOptions = {}
) {
  const {
    immediate = true,
    retries = 3,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000, // 1 minute
    onSuccess,
    onError
  } = options

  // Resource state
  const state = ref<ResourceState<T>>({
    data: null,
    status: 'IDLE' as ApiStatus,
    error: null,
    lastFetch: null,
    stale: false
  })

  // Computed properties
  const isLoading = computed(() => state.value.status === 'LOADING')
  const isError = computed(() => state.value.status === 'ERROR')
  const isSuccess = computed(() => state.value.status === 'SUCCESS')
  const isStale = computed(() => {
    if (!state.value.lastFetch) return false
    return Date.now() - new Date(state.value.lastFetch).getTime() > staleTime
  })

  // Retry mechanism with exponential backoff
  const executeWithRetry = async (attempt = 1): Promise<T> => {
    try {
      const data = await fetcher()
      return data
    } catch (error) {
      if (attempt <= retries) {
        const delay = retryDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        return executeWithRetry(attempt + 1)
      }
      throw error
    }
  }

  // Main execution function
  const execute = async (force = false): Promise<T | null> => {
    // Check if data is fresh and not forced
    if (!force && state.value.data && !isStale.value) {
      return state.value.data as T
    }

    state.value.status = 'LOADING' as ApiStatus
    state.value.error = null

    try {
      const data = await executeWithRetry()
      
      state.value = {
        data,
        status: 'SUCCESS' as ApiStatus,
        error: null,
        lastFetch: new Date().toISOString(),
        stale: false
      }

      onSuccess?.(data)
      return data
    } catch (error) {
      const apiError: ApiError = {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }

      state.value = {
        ...state.value,
        status: 'ERROR' as ApiStatus,
        error: apiError
      }

      onError?.(apiError)
      return null
    }
  }

  // Invalidate and refetch
  const invalidate = () => {
    state.value.stale = true
  }

  const refetch = () => execute(true)

  // Reset state
  const reset = () => {
    state.value = {
      data: null,
      status: 'IDLE' as ApiStatus,
      error: null,
      lastFetch: null,
      stale: false
    }
  }

  // Auto-fetch on mount if immediate
  if (immediate) {
    execute()
  }

  return {
    // State
    ...toRefs(state.value),
    
    // Computed
    isLoading,
    isError,
    isSuccess,
    isStale,
    
    execute,
    refetch,
    invalidate,
    reset
  }
}