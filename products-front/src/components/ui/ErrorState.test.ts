import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from '@/components/ui/ErrorState.vue'
import { createMockError } from '@/test/setup'

describe('ErrorState.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    title: 'Test Error',
    description: 'Test error description',
  }

  describe('Basic Rendering', () => {
    it('renders correctly with required props', () => {
      wrapper = mount(ErrorState, {
        props: defaultProps,
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.error-state-title').text()).toBe('Test Error')
      expect(wrapper.find('.error-state-description').text()).toBe('Test error description')
    })

    it('renders with default title when not provided', () => {
      wrapper = mount(ErrorState, {
        props: {
          description: 'Test description',
        },
      })

      expect(wrapper.find('.error-state-title').text()).toBe('Algo salió mal')
    })

    it('renders with default description when not provided', () => {
      wrapper = mount(ErrorState, {
        props: {
          title: 'Test Title',
        },
      })

      expect(wrapper.find('.error-state-description').text()).toBe(
        'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
      )
    })
  })

  describe('Error Types', () => {
    it('renders network error correctly', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          type: 'network',
        },
      })

      expect(wrapper.classes()).toContain('error-state--network')
    })

    it('renders server error correctly', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          type: 'server',
        },
      })

      expect(wrapper.classes()).toContain('error-state--server')
    })

    it('renders forbidden error correctly', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          type: 'forbidden',
        },
      })

      expect(wrapper.classes()).toContain('error-state--forbidden')
    })

    it('renders general error as default', () => {
      wrapper = mount(ErrorState, {
        props: defaultProps,
      })

      expect(wrapper.classes()).toContain('error-state--general')
    })
  })

  describe('Action Buttons', () => {
    it('renders primary action button when provided', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Retry' },
        },
      })

      const button = wrapper.find('.error-state-primary-btn')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Retry')
    })

    it('renders secondary action button when provided', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Retry' },
          secondaryAction: { label: 'Cancel' },
        },
      })

      const button = wrapper.find('.error-state-secondary-btn')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Cancel')
    })

    it('emits primary-action event when primary button is clicked', async () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Retry' },
        },
      })

      await wrapper.find('.error-state-primary-btn').trigger('click')
      expect(wrapper.emitted('primary-action')).toBeTruthy()
      expect(wrapper.emitted('primary-action')).toHaveLength(1)
    })

    it('emits secondary-action event when secondary button is clicked', async () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Retry' },
          secondaryAction: { label: 'Cancel' },
        },
      })

      await wrapper.find('.error-state-secondary-btn').trigger('click')
      expect(wrapper.emitted('secondary-action')).toBeTruthy()
      expect(wrapper.emitted('secondary-action')).toHaveLength(1)
    })
  })

  describe('Loading State', () => {
    it('shows spinner when loading', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          loading: true,
          primaryAction: { label: 'Retry' },
        },
      })

      expect(wrapper.find('.btn-spinner').exists()).toBe(true)
      expect(wrapper.find('.error-state-primary-btn').text()).toContain('Cargando...')
    })

    it('disables button when loading', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          loading: true,
          primaryAction: { label: 'Retry' },
        },
      })

      const button = wrapper.find('.error-state-primary-btn')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('does not emit events when loading and button is clicked', async () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          loading: true,
          primaryAction: { label: 'Retry' },
        },
      })

      // Try to click the disabled button
      await wrapper.find('.error-state-primary-btn').trigger('click')
      expect(wrapper.emitted('primary-action')).toBeFalsy()
    })
  })

  describe('Technical Details', () => {
    const mockError = createMockError('Test error message')

    it('shows details toggle when details are provided and showDetails is true', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          details: mockError.stack,
          showDetails: true,
        },
      })

      expect(wrapper.find('.error-details-toggle').exists()).toBe(true)
    })

    it('does not show details when showDetails is false', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          details: mockError.stack,
          showDetails: false,
        },
      })

      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('toggles details visibility when toggle button is clicked', async () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          details: mockError.stack,
          showDetails: true,
        },
      })

      // Initially collapsed
      expect(wrapper.find('.error-details-content').exists()).toBe(false)

      // Click to expand
      await wrapper.find('.error-details-toggle').trigger('click')
      expect(wrapper.find('.error-details-content').exists()).toBe(true)

      // Click to collapse
      await wrapper.find('.error-details-toggle').trigger('click')
      expect(wrapper.find('.error-details-content').exists()).toBe(false)
    })

    it('shows correct chevron state when details are expanded', async () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          details: mockError.stack,
          showDetails: true,
        },
      })

      const chevron = wrapper.find('.details-chevron')
      expect(chevron.exists()).toBe(true)

      // Click to expand
      await wrapper.find('.error-details-toggle').trigger('click')
      expect(chevron.classes()).toContain('details-chevron--expanded')
    })
  })

  describe('Size Variants', () => {
    it('applies small size class', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          size: 'sm',
        },
      })

      expect(wrapper.classes()).toContain('error-state--sm')
    })

    it('applies large size class', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          size: 'lg',
        },
      })

      expect(wrapper.classes()).toContain('error-state--lg')
    })

    it('applies medium size by default', () => {
      wrapper = mount(ErrorState, {
        props: defaultProps,
      })

      expect(wrapper.classes()).toContain('error-state--md')
    })
  })

  describe('Centered Layout', () => {
    it('applies centered class by default', () => {
      wrapper = mount(ErrorState, {
        props: defaultProps,
      })

      expect(wrapper.classes()).toContain('error-state--centered')
    })

    it('does not apply centered class when centered is false', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          centered: false,
        },
      })

      expect(wrapper.classes()).not.toContain('error-state--centered')
    })
  })

  describe('Slots', () => {
    it('renders custom illustration slot', () => {
      wrapper = mount(ErrorState, {
        props: defaultProps,
        slots: {
          illustration: '<div class="custom-illustration">Custom Error Icon</div>',
        },
      })

      expect(wrapper.find('.custom-illustration').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Error Icon')
    })

    it('renders custom actions slot', () => {
      wrapper = mount(ErrorState, {
        props: defaultProps,
        slots: {
          actions: '<button class="custom-button">Custom Action</button>',
        },
      })

      expect(wrapper.find('.custom-button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Action')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes for buttons', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Retry' },
        },
      })

      const button = wrapper.find('.error-state-primary-btn')
      expect(button.attributes('type')).toBe('button')
    })

    it('has proper disabled state for accessibility', () => {
      wrapper = mount(ErrorState, {
        props: {
          ...defaultProps,
          loading: true,
          primaryAction: { label: 'Retry' },
        },
      })

      const button = wrapper.find('.error-state-primary-btn')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})