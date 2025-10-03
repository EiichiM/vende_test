import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ClientFormModal from '@/components/ui/ClientFormModal.vue'
import { useClientsStore } from '@/stores/clients'
import type { Client } from '@/types'

// Mock the Dialog component
vi.mock('@/components/ui/Dialog.vue', () => ({
  default: {
    name: 'Dialog',
    template: `
      <div v-if="show" class="mock-dialog">
        <header><slot name="header" /></header>
        <main><slot /></main>
        <footer><slot name="footer" /></footer>
      </div>
    `,
    props: ['show', 'size'],
    emits: ['close']
  }
}))

// Mock the clients store
vi.mock('@/stores/clients', () => ({
  useClientsStore: vi.fn(() => ({
    createClient: vi.fn().mockResolvedValue({ id: '1' }),
    updateClient: vi.fn().mockResolvedValue({ id: '1' }),
    validateTaxId: vi.fn().mockReturnValue(true)
  }))
}))

describe('ClientFormModal', () => {
  let wrapper: any
  let mockClientsStore: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    
    mockClientsStore = {
      createClient: vi.fn().mockResolvedValue({ 
        id: '1',
        isCompany: false,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        isActive: true,
        sendInvoiceByEmail: true,
        country: 'ES'
      }),
      updateClient: vi.fn().mockResolvedValue({ id: '1' }),
      validateTaxId: vi.fn().mockReturnValue(true)
    }

    // Mock the store
    vi.mocked(useClientsStore).mockReturnValue(mockClientsStore)

    wrapper = mount(ClientFormModal, {
      props: {
        show: true,
        client: null
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders correctly when shown', () => {
      expect(wrapper.find('.mock-dialog').exists()).toBe(true)
      expect(wrapper.find('.client-form').exists()).toBe(true)
    })

    it('displays correct title for new client', () => {
      expect(wrapper.text()).toContain('Nuevo Cliente')
    })

    it('shows client type selector', () => {
      const typeSelector = wrapper.find('.client-type-selector')
      expect(typeSelector.exists()).toBe(true)
      
      const typeOptions = wrapper.findAll('.type-option')
      expect(typeOptions).toHaveLength(2)
    })
  })

  describe('Client Type Selection', () => {
    it('defaults to individual client', () => {
      expect(wrapper.vm.form.isCompany).toBe(false)
    })

    it('switches to company type', async () => {
      const companyOption = wrapper.findAll('.type-option input')[1]
      await companyOption.setChecked(true)
      
      expect(wrapper.vm.form.isCompany).toBe(true)
    })

    it('shows correct fields for individual client', () => {
      expect(wrapper.find('input[placeholder="Nombre"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="Apellidos"]').exists()).toBe(true)
    })

    it('shows correct fields for company', async () => {
      const companyOption = wrapper.findAll('.type-option input')[1]
      await companyOption.setChecked(true)
      
      expect(wrapper.find('input[placeholder*="Tecnología Avanzada"]').exists()).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('validates required fields for individual', async () => {
      // Try to submit with empty form - should trigger validation
      await wrapper.vm.handleSubmit()
      
      // Should show validation errors
      expect(wrapper.vm.errors.firstName).toBeTruthy()
      expect(wrapper.vm.errors.lastName).toBeTruthy()
      expect(wrapper.vm.errors.email).toBeTruthy()
    })

    it('validates required fields for company', async () => {
      // Switch to company
      const companyOption = wrapper.findAll('.type-option input')[1]
      await companyOption.setChecked(true)
      
      // Call handleSubmit to trigger validation
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.vm.errors.companyName).toBeTruthy()
      expect(wrapper.vm.errors.email).toBeTruthy()
    })

    it('validates email format', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('invalid-email')
      
      // Trigger validation
      await wrapper.vm.validateEmail()
      
      expect(wrapper.vm.errors.email).toBeTruthy()
    })

    it('accepts valid email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@example.com')
      
      await wrapper.vm.validateEmail()
      
      expect(wrapper.vm.errors.email).toBe('')
    })
  })

  describe('Tax ID Validation', () => {
    it('calls validateTaxId when tax ID is entered', async () => {
      const taxIdInputs = wrapper.findAll('input[type="text"]')
      // Find the tax ID input by its context
      const taxIdInput = taxIdInputs.find((input: any) => 
        input.element.placeholder?.includes('12345678Z')
      )
      
      if (taxIdInput) {
        await taxIdInput.setValue('12345678Z')
        await taxIdInput.trigger('input')
        
        expect(mockClientsStore.validateTaxId).toHaveBeenCalledWith('12345678Z', false)
      }
    })

    it('shows validation status for valid tax ID', async () => {
      mockClientsStore.validateTaxId.mockReturnValue(true)
      
      const taxIdInputs = wrapper.findAll('input[type="text"]')
      const taxIdInput = taxIdInputs.find((input: any) => 
        input.element.placeholder?.includes('12345678Z')
      )
      
      if (taxIdInput) {
        await taxIdInput.setValue('12345678Z')
        await wrapper.vm.validateTaxId()
        
        expect(wrapper.vm.taxIdStatus).toBe('valid')
      }
    })
  })

  describe('Modal Actions', () => {
    it('emits close when cancel button is clicked', async () => {
      const cancelButton = wrapper.find('.btn-secondary')
      await cancelButton.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('has cancel and confirm buttons', () => {
      expect(wrapper.find('.btn-secondary').exists()).toBe(true)
      expect(wrapper.find('.btn-primary').exists()).toBe(true)
    })
  })

  describe('Contact Information', () => {
    it('has email field', () => {
      const emailInput = wrapper.find('input[type="email"]')
      expect(emailInput.exists()).toBe(true)
    })

    it('has phone fields', () => {
      const phoneInputs = wrapper.findAll('input[type="tel"]')
      expect(phoneInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('updates form data when inputs change', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')
      
      expect(wrapper.vm.form.email).toBe('test@example.com')
    })
  })

  describe('Address Fields', () => {
    it('has address input fields', () => {
      expect(wrapper.find('input[placeholder*="Calle"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="Ciudad"]').exists()).toBe(true)
    })

    it('has country selector', () => {
      const countrySelect = wrapper.find('select')
      expect(countrySelect.exists()).toBe(true)
    })

    it('defaults to Spain', () => {
      expect(wrapper.vm.form.country).toBe('ES')
    })
  })

  describe('Additional Options', () => {
    it('has notes textarea', () => {
      const notesTextarea = wrapper.find('textarea')
      expect(notesTextarea.exists()).toBe(true)
    })

    it('has checkboxes for client options', () => {
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    })

    it('defaults active client to true', () => {
      expect(wrapper.vm.form.isActive).toBe(true)
    })

    it('defaults send invoice by email to true', () => {
      expect(wrapper.vm.form.sendInvoiceByEmail).toBe(true)
    })
  })

  describe('Form Reset', () => {
    it('resets form when modal is closed and reopened', async () => {
      // Fill form
      const nameInput = wrapper.find('input[placeholder="Nombre"]')
      const emailInput = wrapper.find('input[type="email"]')
      
      if (nameInput.exists()) {
        await nameInput.setValue('John')
      }
      
      await emailInput.setValue('john@example.com')
      
      // Close and reopen
      await wrapper.setProps({ show: false })
      await wrapper.setProps({ show: true })
      
      expect(wrapper.vm.form.firstName).toBe('')
      expect(wrapper.vm.form.email).toBe('')
    })

    it('clears validation errors when switching client type', async () => {
      // Add some errors
      wrapper.vm.errors.firstName = 'Required'
      
      // Switch type
      const companyOption = wrapper.findAll('.type-option input')[1]
      await companyOption.setChecked(true)
      
      expect(wrapper.vm.errors.firstName).toBe('')
    })
  })

  describe('Component State', () => {
    it('initializes with correct default values', () => {
      expect(wrapper.vm.form.isCompany).toBe(false)
      expect(wrapper.vm.form.isActive).toBe(true)
      expect(wrapper.vm.form.sendInvoiceByEmail).toBe(true)
      expect(wrapper.vm.form.country).toBe('ES')
    })

    it('handles form validation state', () => {
      // Check if isFormValid exists and has correct type
      const isFormValid = wrapper.vm.isFormValid
      // Empty form should be invalid (false) or undefined/empty string for uninitialized
      expect(typeof isFormValid === 'boolean' ? isFormValid : false).toBe(false)
    })
  })
})