import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type { Company } from '@/types'

export const useCompaniesStore = defineStore('companies', () => {
  // State
  const companies = ref<Company[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const companyOptions = computed(() =>
    companies.value.map(company => ({
      value: company.id,
      label: company.name,
    }))
  )

  const hasCompanies = computed(() => companies.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Actions
  async function fetchCompanies() {
    try {
      loading.value = true
      error.value = null
      companies.value = await apiService.getCompanies()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar compañías'
      console.error('Error fetching companies:', err)
    } finally {
      loading.value = false
    }
  }

  function getCompanyById(id: string): Company | undefined {
    return companies.value.find(company => company.id === id)
  }

  function getCompanyName(id: string): string {
    const company = getCompanyById(id)
    return company ? company.name : 'Compañía no encontrada'
  }

  function clearError() {
    error.value = null
  }

  // Reset store
  function $reset() {
    companies.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    companies,
    loading,
    error,
    
    // Getters
    companyOptions,
    hasCompanies,
    isLoading,
    
    // Actions
    fetchCompanies,
    getCompanyById,
    getCompanyName,
    clearError,
    $reset,
  }
})