import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useNotifications } from '@/composables/useNotifications'
import { NotificationType } from '@/types'

// Mock UI constants
vi.mock('@/constants', () => ({
  UI_CONSTANTS: {
    TOAST_DURATION: 3000
  }
}))

describe('useNotifications', () => {
  beforeEach(() => {
    // Clear all notifications before each test
    const { clearAll } = useNotifications()
    clearAll()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('starts with empty notifications', () => {
      const { notifications, hasNotifications } = useNotifications()

      expect(notifications.value).toEqual([])
      expect(hasNotifications.value).toBe(false)
    })
  })

  describe('Adding Notifications', () => {
    it('adds notification with correct properties', () => {
      const { addNotification, notifications } = useNotifications()

      const id = addNotification(NotificationType.SUCCESS, 'Test Title', 'Test Message')

      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0]).toEqual({
        id,
        type: NotificationType.SUCCESS,
        title: 'Test Title',
        message: 'Test Message',
        duration: 3000,
        actions: undefined
      })
    })

    it('generates unique IDs for notifications', () => {
      const { addNotification, notifications } = useNotifications()

      const id1 = addNotification(NotificationType.INFO, 'Title 1')
      const id2 = addNotification(NotificationType.INFO, 'Title 2')

      expect(id1).not.toBe(id2)
      expect(notifications.value).toHaveLength(2)
      expect(notifications.value[0].id).toBe(id1)
      expect(notifications.value[1].id).toBe(id2)
    })

    it('accepts custom options', () => {
      const { addNotification, notifications } = useNotifications()
      const actions = [{ label: 'Action', handler: () => {} }]

      addNotification(NotificationType.WARNING, 'Title', 'Message', {
        duration: 5000,
        persistent: true,
        actions
      })

      expect(notifications.value[0]).toMatchObject({
        type: NotificationType.WARNING,
        title: 'Title',
        message: 'Message',
        duration: 5000,
        actions
      })
    })

    it('auto-dismisses non-persistent notifications', () => {
      const { addNotification, notifications } = useNotifications()

      addNotification(NotificationType.INFO, 'Title', 'Message', { duration: 1000 })
      
      expect(notifications.value).toHaveLength(1)

      vi.advanceTimersByTime(1000)

      expect(notifications.value).toHaveLength(0)
    })

    it('does not auto-dismiss persistent notifications', () => {
      const { addNotification, notifications } = useNotifications()

      addNotification(NotificationType.ERROR, 'Title', 'Message', { persistent: true })
      
      expect(notifications.value).toHaveLength(1)

      vi.advanceTimersByTime(5000)

      expect(notifications.value).toHaveLength(1)
    })

    it('does not auto-dismiss when duration is 0', () => {
      const { addNotification, notifications } = useNotifications()

      addNotification(NotificationType.INFO, 'Title', 'Message', { duration: 0 })
      
      expect(notifications.value).toHaveLength(1)

      vi.advanceTimersByTime(5000)

      expect(notifications.value).toHaveLength(1)
    })
  })

  describe('Removing Notifications', () => {
    it('removes notification by ID', () => {
      const { addNotification, removeNotification, notifications } = useNotifications()

      const id1 = addNotification(NotificationType.INFO, 'Title 1')
      const id2 = addNotification(NotificationType.INFO, 'Title 2')
      
      expect(notifications.value).toHaveLength(2)

      removeNotification(id1)
      
      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0].id).toBe(id2)
    })

    it('handles removing non-existent notification gracefully', () => {
      const { addNotification, removeNotification, notifications } = useNotifications()

      addNotification(NotificationType.INFO, 'Title')
      removeNotification('non-existent-id')
      
      expect(notifications.value).toHaveLength(1)
    })

    it('clears all notifications', () => {
      const { addNotification, clearAll, notifications } = useNotifications()

      addNotification(NotificationType.INFO, 'Title 1')
      addNotification(NotificationType.SUCCESS, 'Title 2')
      addNotification(NotificationType.ERROR, 'Title 3')
      
      expect(notifications.value).toHaveLength(3)

      clearAll()
      
      expect(notifications.value).toHaveLength(0)
    })
  })

  describe('Convenience Methods', () => {
    it('showSuccess creates SUCCESS notification', () => {
      const { showSuccess, notifications } = useNotifications()
      const actions = [{ label: 'OK', handler: () => {} }]

      const id = showSuccess('Success!', 'Everything worked', actions)

      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0]).toMatchObject({
        id,
        type: NotificationType.SUCCESS,
        title: 'Success!',
        message: 'Everything worked',
        actions
      })
    })

    it('showError creates ERROR notification with default action', () => {
      const { showError, notifications } = useNotifications()

      const id = showError('Error!', 'Something went wrong')

      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0]).toMatchObject({
        id,
        type: NotificationType.ERROR,
        title: 'Error!',
        message: 'Something went wrong',
        actions: [{ label: 'Cerrar', handler: expect.any(Function) }]
      })
    })

    it('showError uses custom actions when provided', () => {
      const { showError, notifications } = useNotifications()
      const customActions = [{ label: 'Retry', handler: () => {} }]

      showError('Error!', 'Something went wrong', customActions)

      expect(notifications.value[0].actions).toEqual(customActions)
    })

    it('showWarning creates WARNING notification', () => {
      const { showWarning, notifications } = useNotifications()

      const id = showWarning('Warning!', 'Be careful')

      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0]).toMatchObject({
        id,
        type: NotificationType.WARNING,
        title: 'Warning!',
        message: 'Be careful'
      })
    })

    it('showInfo creates INFO notification', () => {
      const { showInfo, notifications } = useNotifications()

      const id = showInfo('Info', 'Just so you know')

      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0]).toMatchObject({
        id,
        type: NotificationType.INFO,
        title: 'Info',
        message: 'Just so you know'
      })
    })
  })

  describe('Computed Properties', () => {
    it('hasNotifications reflects notification count', () => {
      const { addNotification, hasNotifications, clearAll } = useNotifications()

      expect(hasNotifications.value).toBe(false)

      addNotification(NotificationType.INFO, 'Title')
      expect(hasNotifications.value).toBe(true)

      clearAll()
      expect(hasNotifications.value).toBe(false)
    })

    it('notifications is reactive', () => {
      const { addNotification, notifications, removeNotification } = useNotifications()

      expect(notifications.value).toHaveLength(0)

      const id = addNotification(NotificationType.INFO, 'Title')
      expect(notifications.value).toHaveLength(1)

      removeNotification(id)
      expect(notifications.value).toHaveLength(0)
    })
  })

  describe('Multiple Notifications', () => {
    it('handles multiple notifications correctly', () => {
      const { showSuccess, showError, showWarning, notifications } = useNotifications()

      showSuccess('Success')
      showError('Error')
      showWarning('Warning')

      expect(notifications.value).toHaveLength(3)
      expect(notifications.value[0].type).toBe(NotificationType.SUCCESS)
      expect(notifications.value[1].type).toBe(NotificationType.ERROR)
      expect(notifications.value[2].type).toBe(NotificationType.WARNING)
    })

    it('auto-dismisses multiple notifications independently', () => {
      const { addNotification, notifications } = useNotifications()

      // Add notification with 1000ms duration
      addNotification(NotificationType.INFO, 'Short', '', { duration: 1000 })
      
      // Add notification with 2000ms duration
      addNotification(NotificationType.SUCCESS, 'Long', '', { duration: 2000 })

      expect(notifications.value).toHaveLength(2)

      // After 1000ms, first should be gone
      vi.advanceTimersByTime(1000)
      expect(notifications.value).toHaveLength(1)
      expect(notifications.value[0].title).toBe('Long')

      // After another 1000ms, second should be gone
      vi.advanceTimersByTime(1000)
      expect(notifications.value).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles notification without message', () => {
      const { addNotification, notifications } = useNotifications()

      addNotification(NotificationType.INFO, 'Title Only')

      expect(notifications.value[0]).toMatchObject({
        title: 'Title Only',
        message: undefined
      })
    })

    it('handles empty title', () => {
      const { addNotification, notifications } = useNotifications()

      addNotification(NotificationType.INFO, '', 'Message only')

      expect(notifications.value[0]).toMatchObject({
        title: '',
        message: 'Message only'
      })
    })

    it('handles removing notification that auto-dismissed', () => {
      const { addNotification, removeNotification, notifications } = useNotifications()

      const id = addNotification(NotificationType.INFO, 'Title', '', { duration: 1000 })
      
      expect(notifications.value).toHaveLength(1)

      // Let it auto-dismiss
      vi.advanceTimersByTime(1000)
      expect(notifications.value).toHaveLength(0)

      // Try to remove manually (should not error)
      removeNotification(id)
      expect(notifications.value).toHaveLength(0)
    })
  })

  describe('Actions Integration', () => {
    it('notification actions can be called', () => {
      const { addNotification, notifications } = useNotifications()
      const mockHandler = vi.fn()
      
      const actions = [
        { label: 'Action 1', handler: mockHandler },
        { label: 'Action 2', handler: () => {} }
      ]

      addNotification(NotificationType.INFO, 'Title', 'Message', { actions })

      const notification = notifications.value[0]
      expect(notification.actions).toHaveLength(2)
      
      // Call first action
      notification.actions![0].handler()
      expect(mockHandler).toHaveBeenCalled()
    })

    it('error notification default action works', () => {
      const { showError, notifications } = useNotifications()

      showError('Error')

      const notification = notifications.value[0]
      expect(notification.actions).toHaveLength(1)
      
      // Should not throw when called
      expect(() => notification.actions![0].handler()).not.toThrow()
    })
  })
})