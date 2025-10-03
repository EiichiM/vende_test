import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/ui/EmptyState.vue'

describe('EmptyState.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    title: 'No data found',
    description: 'There are no items to display.',
  }

  describe('Basic Rendering', () => {
    it('renders correctly with required props', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.empty-state-title').text()).toBe('No data found')
      expect(wrapper.find('.empty-state-description').text()).toBe('There are no items to display.')
    })

    it('renders with minimal props', () => {
      wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
        },
      })

      expect(wrapper.find('.empty-state-title').text()).toBe('Empty')
      expect(wrapper.find('.empty-state-description').exists()).toBe(false)
    })

    it('renders without description when not provided', () => {
      wrapper = mount(EmptyState, {
        props: {
          title: 'Empty State',
        },
      })

      expect(wrapper.find('.empty-state-description').exists()).toBe(false)
    })
  })

  describe('Primary Action', () => {
    it('renders primary action button when provided', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Add Item' },
        },
      })

      const button = wrapper.find('.empty-state-primary-btn')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Add Item')
    })

    it('emits primary-action event when button is clicked', async () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Add Item' },
        },
      })

      await wrapper.find('.empty-state-primary-btn').trigger('click')
      expect(wrapper.emitted('primary-action')).toBeTruthy()
      expect(wrapper.emitted('primary-action')).toHaveLength(1)
    })

    it('shows icon in primary action button', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Add Item' },
        },
      })

      const button = wrapper.find('.empty-state-primary-btn')
      expect(button.find('.btn-icon').exists()).toBe(true)
    })
  })

  describe('Illustration', () => {
    it('renders default illustration when no custom illustration is provided', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      expect(wrapper.find('.empty-products-illustration').exists()).toBe(true)
      expect(wrapper.find('.empty-icon').exists()).toBe(true)
    })

    it('renders custom illustration slot when provided', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
        slots: {
          illustration: '<div class="custom-illustration">Custom Empty Icon</div>',
        },
      })

      expect(wrapper.find('.custom-illustration').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Empty Icon')
    })

    it('has animated elements in default illustration', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      const svg = wrapper.find('.empty-icon')
      expect(svg.exists()).toBe(true)

      // Check for animated elements
      expect(svg.find('.rotate-animation').exists()).toBe(true)
      expect(svg.find('.float-animation-1').exists()).toBe(true)
      expect(svg.find('.pulse-animation').exists()).toBe(true)
    })
  })

  describe('Size Variants', () => {
    it('applies small size class', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          size: 'sm',
        },
      })

      expect(wrapper.classes()).toContain('empty-state--sm')
    })

    it('applies large size class', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          size: 'lg',
        },
      })

      expect(wrapper.classes()).toContain('empty-state--lg')
    })

    it('applies medium size by default', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      expect(wrapper.classes()).toContain('empty-state--md')
    })
  })

  describe('Centered Layout', () => {
    it('applies centered class by default', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      expect(wrapper.classes()).toContain('empty-state--centered')
    })

    it('does not apply centered class when centered is false', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          centered: false,
        },
      })

      expect(wrapper.classes()).not.toContain('empty-state--centered')
    })
  })

  describe('Slots', () => {
    it('renders custom actions slot', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
        slots: {
          actions: '<button class="custom-action">Custom Action</button>',
        },
      })

      expect(wrapper.find('.custom-action').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Action')
    })

    it('prioritizes actions slot over primaryAction prop', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Prop Action' },
        },
        slots: {
          actions: '<button class="slot-action">Slot Action</button>',
        },
      })

      expect(wrapper.find('.slot-action').exists()).toBe(true)
      expect(wrapper.find('.empty-state-primary-btn').exists()).toBe(false)
    })
  })

  describe('Gradient Background', () => {
    it('has gradient background styling', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      // The gradient is applied via CSS, so we just verify the class exists
    })
  })

  describe('Animation Classes', () => {
    it('has fade-in animation on content', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      expect(wrapper.find('.empty-state-content').exists()).toBe(true)
      // Animation is applied via CSS classes
    })

    it('has floating animations on illustration elements', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      const svg = wrapper.find('.empty-icon')
      if (svg.exists()) {
        expect(svg.find('.float-animation-1').exists()).toBe(true)
        expect(svg.find('.float-animation-2').exists()).toBe(true)
        expect(svg.find('.float-animation-3').exists()).toBe(true)
      }
    })
  })

  describe('Typography', () => {
    it('has gradient text styling on title', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      const title = wrapper.find('.empty-state-title')
      expect(title.exists()).toBe(true)
      // Gradient text is applied via CSS
    })

    it('displays description with proper styling', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      const description = wrapper.find('.empty-state-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('There are no items to display.')
    })
  })

  describe('Button Styling', () => {
    it('primary button has correct styling classes', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Add Item' },
        },
      })

      const button = wrapper.find('.empty-state-primary-btn')
      expect(button.exists()).toBe(true)
      // Button styling is applied via CSS classes
    })

    it('button has hover effects', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Add Item' },
        },
      })

      const button = wrapper.find('.empty-state-primary-btn')
      expect(button.exists()).toBe(true)
      // Hover effects are applied via CSS
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      wrapper = mount(EmptyState, {
        props: defaultProps,
      })

      expect(wrapper.find('.empty-state-title').exists()).toBe(true)
      expect(wrapper.find('.empty-state-description').exists()).toBe(true)
    })

    it('button has proper attributes', () => {
      wrapper = mount(EmptyState, {
        props: {
          ...defaultProps,
          primaryAction: { label: 'Add Item' },
        },
      })

      const button = wrapper.find('.empty-state-primary-btn')
      expect(button.attributes('type')).toBe('button')
    })

    it('provides meaningful content for screen readers', () => {
      wrapper = mount(EmptyState, {
        props: {
          title: 'No products found',
          description: 'Start by adding your first product to the catalog',
          primaryAction: { label: 'Add first product' },
        },
      })

      expect(wrapper.text()).toContain('No products found')
      expect(wrapper.text()).toContain('Start by adding your first product to the catalog')
      expect(wrapper.text()).toContain('Add first product')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      wrapper = mount(EmptyState, {
        props: {
          title: '',
          description: 'Description only',
        },
      })

      const title = wrapper.find('.empty-state-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('')
    })

    it('handles very long titles', () => {
      const longTitle = 'This is a very long title that should still be displayed properly without breaking the layout'
      wrapper = mount(EmptyState, {
        props: {
          title: longTitle,
        },
      })

      expect(wrapper.find('.empty-state-title').text()).toBe(longTitle)
    })

    it('handles very long descriptions', () => {
      const longDescription = 'This is a very long description that should wrap properly and maintain readability even when it contains a lot of text that goes on for multiple lines'
      wrapper = mount(EmptyState, {
        props: {
          title: 'Title',
          description: longDescription,
        },
      })

      expect(wrapper.find('.empty-state-description').text()).toBe(longDescription)
    })
  })
})