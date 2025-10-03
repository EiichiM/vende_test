import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingState from '@/components/ui/LoadingState.vue'

describe('LoadingState.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.loading-state').exists()).toBe(true)
      expect(wrapper.find('.loading-title').text()).toBe('Cargando...')
    })

    it('renders with custom title', () => {
      wrapper = mount(LoadingState, {
        props: {
          title: 'Loading Products...',
        },
      })

      expect(wrapper.find('.loading-title').text()).toBe('Loading Products...')
    })

    it('renders with custom description', () => {
      wrapper = mount(LoadingState, {
        props: {
          description: 'Please wait while we fetch your data.',
        },
      })

      expect(wrapper.find('.loading-description').text()).toBe('Please wait while we fetch your data.')
    })

    it('does not render description when not provided', () => {
      wrapper = mount(LoadingState, {
        props: {
          title: 'Loading...',
        },
      })

      expect(wrapper.find('.loading-description').exists()).toBe(false)
    })
  })

  describe('Variants', () => {
    it('renders spinner variant by default', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.classes()).toContain('loading-state--spinner')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('renders skeleton variant', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
        },
      })

      expect(wrapper.classes()).toContain('loading-state--skeleton')
      expect(wrapper.find('.skeleton-container').exists()).toBe(true)
    })

    it('renders both variant', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'both',
        },
      })

      expect(wrapper.classes()).toContain('loading-state--both')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('.skeleton-container').exists()).toBe(true)
    })
  })

  describe('Skeleton Types', () => {
    it('renders table skeleton by default', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
        },
      })

      expect(wrapper.find('.skeleton-table').exists()).toBe(true)
      expect(wrapper.find('.skeleton-header').exists()).toBe(true)
    })

    it('renders cards skeleton', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
          skeletonType: 'cards',
        },
      })

      expect(wrapper.find('.skeleton-cards').exists()).toBe(true)
      expect(wrapper.find('.skeleton-card').exists()).toBe(true)
    })

    it('renders list skeleton', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
          skeletonType: 'list',
        },
      })

      expect(wrapper.find('.skeleton-list').exists()).toBe(true)
      expect(wrapper.find('.skeleton-list-item').exists()).toBe(true)
    })
  })

  describe('Skeleton Configuration', () => {
    it('renders correct number of skeleton rows', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
          skeletonRows: 3,
        },
      })

      const rows = wrapper.findAll('.skeleton-row')
      expect(rows).toHaveLength(3)
    })

    it('renders correct number of skeleton columns', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
          skeletonColumns: 4,
        },
      })

      const firstRow = wrapper.find('.skeleton-row')
      const cells = firstRow.findAll('.skeleton-cell')
      expect(cells).toHaveLength(4)
    })

    it('renders header cells matching column count', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
          skeletonColumns: 5,
        },
      })

      const headerCells = wrapper.findAll('.skeleton-header-cell')
      expect(headerCells).toHaveLength(5)
    })
  })

  describe('Progress Indicator', () => {
    it('does not render progress bar when progress is undefined', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.find('.loading-progress').exists()).toBe(false)
    })

    it('renders progress bar when progress is provided', () => {
      wrapper = mount(LoadingState, {
        props: {
          progress: 50,
        },
      })

      expect(wrapper.find('.loading-progress').exists()).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
      expect(wrapper.find('.progress-text').text()).toBe('50%')
    })

    it('sets correct progress bar width', () => {
      wrapper = mount(LoadingState, {
        props: {
          progress: 75,
        },
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 75%')
    })

    it('limits progress to 100%', () => {
      wrapper = mount(LoadingState, {
        props: {
          progress: 150,
        },
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 100%')
      expect(wrapper.find('.progress-text').text()).toBe('150%') // Text shows actual value
    })

    it('prevents negative progress', () => {
      wrapper = mount(LoadingState, {
        props: {
          progress: -10,
        },
      })

      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 0%')
    })
  })

  describe('Visibility Controls', () => {
    it('shows illustration by default', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.find('.loading-illustration').exists()).toBe(true)
    })

    it('hides illustration when showIllustration is false', () => {
      wrapper = mount(LoadingState, {
        props: {
          showIllustration: false,
        },
      })

      expect(wrapper.find('.loading-illustration').exists()).toBe(false)
    })

    it('shows text by default', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('hides text when showText is false', () => {
      wrapper = mount(LoadingState, {
        props: {
          showText: false,
        },
      })

      expect(wrapper.find('.loading-text').exists()).toBe(false)
    })

    it('hides illustration in skeleton variant by default', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
        },
      })

      expect(wrapper.find('.loading-illustration').exists()).toBe(false)
    })
  })

  describe('Size Variants', () => {
    it('applies small size class', () => {
      wrapper = mount(LoadingState, {
        props: {
          size: 'sm',
        },
      })

      expect(wrapper.classes()).toContain('loading-state--sm')
    })

    it('applies large size class', () => {
      wrapper = mount(LoadingState, {
        props: {
          size: 'lg',
        },
      })

      expect(wrapper.classes()).toContain('loading-state--lg')
    })

    it('applies medium size by default', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.classes()).toContain('loading-state--md')
    })
  })

  describe('Centered Layout', () => {
    it('applies centered class by default', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.classes()).toContain('loading-state--centered')
    })

    it('does not apply centered class when centered is false', () => {
      wrapper = mount(LoadingState, {
        props: {
          centered: false,
        },
      })

      expect(wrapper.classes()).not.toContain('loading-state--centered')
    })
  })

  describe('Slots', () => {
    it('renders custom illustration slot', () => {
      wrapper = mount(LoadingState, {
        slots: {
          illustration: '<div class="custom-loading">Custom Loading...</div>',
        },
      })

      expect(wrapper.find('.custom-loading').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Loading...')
    })

    it('renders custom skeleton slot', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
        },
        slots: {
          skeleton: '<div class="custom-skeleton">Custom Skeleton</div>',
        },
      })

      expect(wrapper.find('.custom-skeleton').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Skeleton')
    })
  })

  describe('Animation Classes', () => {
    it('has animation classes for spinner elements', () => {
      wrapper = mount(LoadingState)

      expect(wrapper.find('.spinner-outer').exists()).toBe(true)
      expect(wrapper.find('.spinner-inner').exists()).toBe(true)
      expect(wrapper.find('.spinner-center').exists()).toBe(true)
    })

    it('skeleton cells have animation delay styles', () => {
      wrapper = mount(LoadingState, {
        props: {
          variant: 'skeleton',
          skeletonRows: 2,
          skeletonColumns: 2,
        },
      })

      const cells = wrapper.findAll('.skeleton-cell')
      expect(cells.length).toBeGreaterThan(0)
      
      // Check that cells have style attribute (for animation delay)
      cells.forEach((cell: any) => {
        expect(cell.attributes('style')).toBeDefined()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper loading semantics', () => {
      wrapper = mount(LoadingState, {
        props: {
          title: 'Loading data...',
        },
      })

      // Should have appropriate loading indicators
      expect(wrapper.find('.loading-title').exists()).toBe(true)
    })

    it('provides meaningful loading text', () => {
      wrapper = mount(LoadingState, {
        props: {
          title: 'Loading products...',
          description: 'Please wait while we fetch your data.',
        },
      })

      expect(wrapper.text()).toContain('Loading products...')
      expect(wrapper.text()).toContain('Please wait while we fetch your data.')
    })
  })
})