import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Client } from '@/types'

export interface CreateClientRequest {
  name: string
  email: string
  taxId?: string
  phone?: string
  address: string
  city: string
  postalCode: string
  country: string
  isCompany: boolean
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  isActive?: boolean
}

export const useClientsStore = defineStore('clients', () => {
  // State
  const clients = ref<Client[]>([])
  const selectedClient = ref<Client | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasClients = computed(() => clients.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Active clients only
  const activeClients = computed(() => 
    clients.value.filter(client => client.isActive)
  )

  // Company vs individual clients
  const companyClients = computed(() => 
    clients.value.filter(client => client.isCompany && client.isActive)
  )
  
  const individualClients = computed(() => 
    clients.value.filter(client => !client.isCompany && client.isActive)
  )

  // Client options for selects
  const clientOptions = computed(() =>
    activeClients.value.map(client => ({
      value: client.id,
      label: client.isCompany ? client.companyName || 'Sin nombre' : `${client.firstName} ${client.lastName}`.trim(),
      subtitle: client.isCompany ? client.taxId : client.email
    }))
  )

  // Actions
  async function fetchClients(params?: { 
    search?: string
    isCompany?: boolean
    isActive?: boolean
  }) {
    try {
      loading.value = true
      error.value = null
      
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.append('search', params.search)
      if (params?.isCompany !== undefined) queryParams.append('isCompany', params.isCompany.toString())
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

      const response = await fetch(`/api/clients?${queryParams}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      clients.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar clientes'
      console.error('Error fetching clients:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchClient(id: string): Promise<Client | null> {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(`/api/clients/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cliente no encontrado')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const client = await response.json()
      selectedClient.value = client
      return client
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar el cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createClient(data: CreateClientRequest): Promise<Client> {
    try {
      loading.value = true
      error.value = null

      // Validate required fields based on client type
      if (data.isCompany && !data.taxId) {
        throw new Error('El CIF/NIF es obligatorio para empresas')
      }

      const clientData = {
        ...data,
        isActive: true,
        country: data.country || 'España' // Default to Spain
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un cliente con ese email o CIF/NIF')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const client = await response.json()
      clients.value.unshift(client) // Add to beginning
      selectedClient.value = client
      
      return client
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear el cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un cliente con ese email o CIF/NIF')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const updatedClient = await response.json()
      
      // Update in array
      const index = clients.value.findIndex(client => client.id === id)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }
      
      // Update selected if it matches
      if (selectedClient.value?.id === id) {
        selectedClient.value = updatedClient
      }
      
      return updatedClient
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteClient(id: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('No se puede eliminar un cliente con facturas asociadas')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      // Remove from array
      clients.value = clients.value.filter(client => client.id !== id)
      
      // Clear selected if it matches
      if (selectedClient.value?.id === id) {
        selectedClient.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleClientStatus(id: string): Promise<Client> {
    const client = clients.value.find(c => c.id === id)
    if (!client) throw new Error('Cliente no encontrado')

    return await updateClient(id, { isActive: !client.isActive })
  }

  // Search functionality
  function searchClients(query: string): Client[] {
    if (!query.trim()) return activeClients.value

    const searchTerm = query.toLowerCase().trim()
    
    return activeClients.value.filter(client => {
      const displayName = client.isCompany ? (client.companyName || '') : `${client.firstName} ${client.lastName}`.trim()
      return displayName.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        (client.taxId && client.taxId.toLowerCase().includes(searchTerm)) ||
        (client.city && client.city.toLowerCase().includes(searchTerm))
    })
  }

  // Get client by ID
  function getClientById(id: string): Client | undefined {
    return clients.value.find(client => client.id === id)
  }

  // Get client display name
  function getClientDisplayName(id: string): string {
    const client = getClientById(id)
    if (!client) return 'Cliente no encontrado'
    
    return client.isCompany ? (client.companyName || 'Sin nombre') : `${client.firstName} ${client.lastName}`.trim()
  }

  // Validate tax ID (basic Spanish CIF/NIF validation)
  function validateTaxId(taxId: string, isCompany: boolean): boolean {
    if (!taxId) return !isCompany // Optional for individuals

    const cleanTaxId = taxId.replace(/[-\s]/g, '').toUpperCase()
    
    if (isCompany) {
      // Basic CIF validation (letter + 8 digits)
      const cifPattern = /^[ABCDEFGHJNPQRSUVW][0-9]{8}$/
      return cifPattern.test(cleanTaxId)
    } else {
      // Basic DNI/NIE validation
      const dniPattern = /^[0-9]{8}[A-Z]$/
      const niePattern = /^[XYZ][0-9]{7}[A-Z]$/
      return dniPattern.test(cleanTaxId) || niePattern.test(cleanTaxId)
    }
  }

  // Reset and utility functions
  function clearError() {
    error.value = null
  }

  function selectClient(client: Client) {
    selectedClient.value = client
  }

  function clearSelectedClient() {
    selectedClient.value = null
  }

  function $reset() {
    clients.value = []
    selectedClient.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    clients,
    selectedClient,
    loading,
    error,
    
    // Computed
    hasClients,
    isLoading,
    hasError,
    activeClients,
    companyClients,
    individualClients,
    clientOptions,
    
    // Actions
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    
    // Utilities
    searchClients,
    getClientById,
    getClientDisplayName,
    validateTaxId,
    clearError,
    selectClient,
    clearSelectedClient,
    $reset
  }
})