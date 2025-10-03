import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import { InvoiceStatus, DocumentType } from '@/types'
import type { 
  Invoice, 
  InvoiceLineItem, 
  Client,
  Product
} from '@/types'

export interface CreateInvoiceRequest {
  clientId: string
  type: DocumentType
  series: string
  issueDate: string
  dueDate?: string
  currency: string
  lineItems: Omit<InvoiceLineItem, 'subtotal' | 'taxAmount' | 'total'>[]
  notes?: string
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {
  status?: InvoiceStatus
}

export const useInvoicesStore = defineStore('invoices', () => {
  // State
  const invoices = ref<Invoice[]>([])
  const selectedInvoice = ref<Invoice | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasInvoices = computed(() => invoices.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Invoice statistics
  const invoiceStats = computed(() => {
    const stats = {
      total: invoices.value.length,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    }

    invoices.value.forEach(invoice => {
      const statusKey = invoice.status.toLowerCase() as keyof typeof stats
      if (typeof stats[statusKey] === 'number') {
        (stats[statusKey] as number)++
      }
      stats.totalAmount += invoice.total

      if (invoice.status === InvoiceStatus.PAID) {
        stats.paidAmount += invoice.total
      } else if (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) {
        stats.pendingAmount += invoice.total
      }
    })

    return stats
  })

  // Recent invoices (last 10)
  const recentInvoices = computed(() => 
    [...invoices.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  )

  // Overdue invoices
  const overdueInvoices = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return invoices.value.filter(invoice => 
      invoice.status === InvoiceStatus.SENT && 
      invoice.dueDate && 
      invoice.dueDate < today
    )
  })

  // Actions
  async function fetchInvoices(params?: { 
    clientId?: string
    status?: InvoiceStatus
    type?: DocumentType
    dateFrom?: string
    dateTo?: string
  }) {
    try {
      loading.value = true
      error.value = null
      
      const queryParams = new URLSearchParams()
      if (params?.clientId) queryParams.append('clientId', params.clientId)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.type) queryParams.append('type', params.type)
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo)

      const response = await fetch(`/api/invoices?${queryParams}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      invoices.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar facturas'
      console.error('Error fetching invoices:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoice(id: string): Promise<Invoice | null> {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(`/api/invoices/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Factura no encontrada')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const invoice = await response.json()
      selectedInvoice.value = invoice
      return invoice
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    try {
      loading.value = true
      error.value = null

      // Calculate line items totals
      const processedLineItems = calculateLineItemTotals(data.lineItems)
      
      // Calculate invoice totals
      const totals = calculateInvoiceTotals(processedLineItems)

      const invoiceData = {
        ...data,
        lineItems: processedLineItems,
        ...totals,
        status: InvoiceStatus.DRAFT,
        number: await generateInvoiceNumber(data.series, data.type)
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const invoice = await response.json()
      invoices.value.unshift(invoice) // Add to beginning
      selectedInvoice.value = invoice
      
      return invoice
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    try {
      loading.value = true
      error.value = null

      let updateData = { ...data }

      // Recalculate totals if line items changed
      if (data.lineItems) {
        const processedLineItems = calculateLineItemTotals(data.lineItems)
        const totals = calculateInvoiceTotals(processedLineItems)
        updateData = {
          ...updateData,
          lineItems: processedLineItems,
          ...totals
        }
      }

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const updatedInvoice = await response.json()
      
      // Update in array
      const index = invoices.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        invoices.value[index] = updatedInvoice
      }
      
      // Update selected if it matches
      if (selectedInvoice.value?.id === id) {
        selectedInvoice.value = updatedInvoice
      }
      
      return updatedInvoice
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteInvoice(id: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      // Remove from array
      invoices.value = invoices.value.filter(inv => inv.id !== id)
      
      // Clear selected if it matches
      if (selectedInvoice.value?.id === id) {
        selectedInvoice.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function duplicateInvoice(id: string): Promise<Invoice> {
    try {
      const original = await fetchInvoice(id)
      if (!original) throw new Error('Factura original no encontrada')

      const duplicateData: CreateInvoiceRequest = {
        clientId: original.clientId,
        type: original.type,
        series: original.series,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: original.dueDate,
        currency: original.currency,
        lineItems: original.lineItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitType: item.unitType,
          taxType: item.taxType,
          taxRate: item.taxRate,
          discount: item.discount
        })),
        notes: original.notes
      }

      return await createInvoice(duplicateData)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al duplicar la factura'
      throw err
    }
  }

  async function sendInvoice(id: string): Promise<Invoice> {
    return await updateInvoice(id, { status: InvoiceStatus.SENT })
  }

  async function markAsPaid(id: string): Promise<Invoice> {
    return await updateInvoice(id, { status: InvoiceStatus.PAID })
  }

  async function cancelInvoice(id: string): Promise<Invoice> {
    return await updateInvoice(id, { status: InvoiceStatus.CANCELLED })
  }

  // Utility methods
  function calculateLineItemTotals(
    lineItems: Omit<InvoiceLineItem, 'subtotal' | 'taxAmount' | 'total'>[]
  ): InvoiceLineItem[] {
    return lineItems.map(item => {
      const subtotalBeforeDiscount = item.quantity * item.unitPrice
      const discountAmount = subtotalBeforeDiscount * (item.discount || 0) / 100
      const subtotal = subtotalBeforeDiscount - discountAmount
      const taxAmount = subtotal * (item.taxRate || 0) / 100
      const total = subtotal + taxAmount

      return {
        ...item,
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        total: Number(total.toFixed(2))
      }
    })
  }

  function calculateInvoiceTotals(lineItems: InvoiceLineItem[]) {
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0)
    const totalDiscount = lineItems.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.unitPrice) * (item.discount || 0) / 100
      return sum + discountAmount
    }, 0)
    const total = lineItems.reduce((sum, item) => sum + item.total, 0)

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      total: Number(total.toFixed(2))
    }
  }

  async function generateInvoiceNumber(series: string, type: DocumentType): Promise<string> {
    // This would typically call an API to get the next number
    const year = new Date().getFullYear()
    const timestamp = Date.now().toString().slice(-4)
    return `${series}-${year}-${timestamp}`
  }

  function addLineItem(product: Product, quantity: number = 1): InvoiceLineItem {
    return {
      productId: product.id,
      productName: product.name,
      description: product.description || undefined,
      quantity,
      unitPrice: product.unitPrice,
      unitType: product.unitType,
      taxType: product.taxType,
      taxRate: product.taxRate,
      discount: 0,
      subtotal: product.unitPrice * quantity,
      taxAmount: (product.unitPrice * quantity) * (product.taxRate / 100),
      total: (product.unitPrice * quantity) * (1 + product.taxRate / 100)
    }
  }

  // Reset and utility functions
  function clearError() {
    error.value = null
  }

  function selectInvoice(invoice: Invoice) {
    selectedInvoice.value = invoice
  }

  function clearSelectedInvoice() {
    selectedInvoice.value = null
  }

  function $reset() {
    invoices.value = []
    selectedInvoice.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    invoices,
    selectedInvoice,
    loading,
    error,
    
    // Computed
    hasInvoices,
    isLoading,
    hasError,
    invoiceStats,
    recentInvoices,
    overdueInvoices,
    
    // Actions
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    duplicateInvoice,
    sendInvoice,
    markAsPaid,
    cancelInvoice,
    
    // Utilities
    calculateLineItemTotals,
    calculateInvoiceTotals,
    addLineItem,
    clearError,
    selectInvoice,
    clearSelectedInvoice,
    $reset
  }
})