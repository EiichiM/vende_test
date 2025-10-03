import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCompaniesStore } from '@/stores/companies'

// Create mock company function that matches the expected interface
const createTestCompany = (overrides = {}) => ({
  id: 'test-company-id',
  name: 'Test Company',
  description: 'Test Company Description',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
})

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    getCompanies: vi.fn(),
    getCompany: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
    deleteCompany: vi.fn(),
  },
}))

describe('useCompaniesStore', () => {
  let mockApiService: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Get the mocked API service
    const { apiService } = await import('@/services/api')
    mockApiService = apiService
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const store = useCompaniesStore()

      expect(store.companies).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('Getters', () => {
    it('companyOptions returns formatted options', () => {
      const store = useCompaniesStore()
      const mockCompanies = [
        createTestCompany({ id: '1', name: 'Company A' }),
        createTestCompany({ id: '2', name: 'Company B' }),
      ]
      
      // Use type assertion to handle readonly interface in tests
      store.$patch({ companies: mockCompanies as any })

      expect(store.companyOptions).toEqual([
        { value: '1', label: 'Company A' },
        { value: '2', label: 'Company B' },
      ])
    })

    it('hasCompanies returns true when companies exist', () => {
      const store = useCompaniesStore()
      store.$patch({ companies: [createTestCompany()] as any })

      expect(store.hasCompanies).toBe(true)
    })

    it('hasCompanies returns false when no companies', () => {
      const store = useCompaniesStore()

      expect(store.hasCompanies).toBe(false)
    })

    it('isLoading reflects loading state', () => {
      const store = useCompaniesStore()
      
      expect(store.isLoading).toBe(false)
      
      store.$patch({ loading: true })
      expect(store.isLoading).toBe(true)
    })
  })

  describe('fetchCompanies', () => {
    it('fetches companies successfully', async () => {
      const store = useCompaniesStore()
      const mockCompanies = [
        createTestCompany({ id: '1', name: 'Company A' }),
        createTestCompany({ id: '2', name: 'Company B' }),
      ]

      mockApiService.getCompanies.mockResolvedValue(mockCompanies)

      await store.fetchCompanies()

      expect(mockApiService.getCompanies).toHaveBeenCalled()
      expect(store.companies).toEqual(mockCompanies)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('handles fetch companies error', async () => {
      const store = useCompaniesStore()
      const mockError = new Error('Network error')

      mockApiService.getCompanies.mockRejectedValue(mockError)

      await store.fetchCompanies()

      expect(store.companies).toEqual([])
      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })

    it('sets loading state during fetch', async () => {
      const store = useCompaniesStore()
      let loadingDuringFetch = false

      mockApiService.getCompanies.mockImplementation(async () => {
        loadingDuringFetch = store.loading
        return []
      })

      await store.fetchCompanies()

      expect(loadingDuringFetch).toBe(true)
    })
  })

  describe('Company Lookup Methods', () => {
    it('getCompanyById returns correct company', () => {
      const store = useCompaniesStore()
      const mockCompanies = [
        createTestCompany({ id: 'company-1', name: 'Company One' }),
        createTestCompany({ id: 'company-2', name: 'Company Two' }),
      ]
      
      store.$patch({ companies: mockCompanies as any })

      const result = store.getCompanyById('company-1')
      expect(result).toEqual(mockCompanies[0])
    })

    it('getCompanyById returns undefined for non-existent company', () => {
      const store = useCompaniesStore()
      const mockCompanies = [
        createTestCompany({ id: 'company-1', name: 'Company One' }),
      ]
      
      store.$patch({ companies: mockCompanies as any })

      const result = store.getCompanyById('non-existent')
      expect(result).toBeUndefined()
    })

    it('getCompanyName returns correct name', () => {
      const store = useCompaniesStore()
      const mockCompanies = [
        createTestCompany({ id: 'company-1', name: 'Company One' }),
        createTestCompany({ id: 'company-2', name: 'Company Two' }),
      ]
      
      store.$patch({ companies: mockCompanies as any })

      const result = store.getCompanyName('company-1')
      expect(result).toBe('Company One')
    })

    it('getCompanyName returns fallback for non-existent company', () => {
      const store = useCompaniesStore()
      const mockCompanies = [
        createTestCompany({ id: 'company-1', name: 'Company One' }),
      ]
      
      store.$patch({ companies: mockCompanies as any })

      const result = store.getCompanyName('non-existent')
      expect(result).toBe('Compañía no encontrada')
    })
  })

  describe('Utility Methods', () => {
    it('clears error', () => {
      const store = useCompaniesStore()
      store.$patch({ error: 'Some error' })

      store.clearError()

      expect(store.error).toBe(null)
    })

    it('resets store state', () => {
      const store = useCompaniesStore()
      
      // Set some state
      store.$patch({
        companies: [createTestCompany()] as any,
        loading: true,
        error: 'error'
      })

      store.$reset()

      expect(store.companies).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('Error Handling', () => {
    it('handles API error during fetch', async () => {
      const store = useCompaniesStore()
      const errorMessage = 'API rate limit exceeded'
      const mockError = new Error(errorMessage)

      mockApiService.getCompanies.mockRejectedValue(mockError)

      await store.fetchCompanies()

      expect(store.error).toBe(errorMessage)
      expect(store.loading).toBe(false)
      expect(store.companies).toEqual([])
    })

    it('handles non-Error exceptions', async () => {
      const store = useCompaniesStore()
      const nonErrorException = 'String error'

      mockApiService.getCompanies.mockRejectedValue(nonErrorException)

      await store.fetchCompanies()

      expect(store.error).toBe('Error al cargar compañías')
      expect(store.loading).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('handles complete workflow', async () => {
      const store = useCompaniesStore()
      
      // Initially empty
      expect(store.hasCompanies).toBe(false)
      expect(store.companyOptions).toEqual([])

      // Fetch companies
      const mockCompanies = [
        createTestCompany({ id: '1', name: 'Tech Corp' }),
        createTestCompany({ id: '2', name: 'Design Ltd' }),
      ]
      mockApiService.getCompanies.mockResolvedValue(mockCompanies)

      await store.fetchCompanies()

      // Verify state after fetch
      expect(store.hasCompanies).toBe(true)
      expect(store.companies).toHaveLength(2)
      expect(store.companyOptions).toEqual([
        { value: '1', label: 'Tech Corp' },
        { value: '2', label: 'Design Ltd' },
      ])
      expect(store.error).toBe(null)
      expect(store.loading).toBe(false)
    })

    it('handles fetch failure and recovery', async () => {
      const store = useCompaniesStore()

      // First fetch fails
      mockApiService.getCompanies.mockRejectedValueOnce(new Error('Server error'))
      await store.fetchCompanies()

      expect(store.error).toBe('Server error')
      expect(store.hasCompanies).toBe(false)

      // Clear error manually
      store.clearError()
      expect(store.error).toBe(null)

      // Second fetch succeeds
      const mockCompanies = [createTestCompany({ name: 'Recovered Corp' })]
      mockApiService.getCompanies.mockResolvedValue(mockCompanies)
      
      await store.fetchCompanies()

      expect(store.error).toBe(null)
      expect(store.hasCompanies).toBe(true)
      expect(store.companies[0].name).toBe('Recovered Corp')
    })
  })
})