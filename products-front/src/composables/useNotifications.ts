/**
 * useNotifications - Advanced notification system
 * Features: queuing, auto-dismiss, action buttons, persistence
 */

import { ref, computed } from 'vue'
import type { Notification, NotificationAction } from '@/types'
import { NotificationType } from '@/types'
import { UI_CONSTANTS } from '@/constants'

const notifications = ref<Notification[]>([])
let notificationId = 0

export function useNotifications() {
  const activeNotifications = computed(() => notifications.value)
  const hasNotifications = computed(() => notifications.value.length > 0)

  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    options: {
      duration?: number
      persistent?: boolean
      actions?: NotificationAction[]
    } = {}
  ): string => {
    const id = `notification-${++notificationId}`
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options.duration ?? UI_CONSTANTS.TOAST_DURATION,
      actions: options.actions
    }

    notifications.value.push(notification)

    // Auto-dismiss unless persistent
    if (!options.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Convenience methods
  const showSuccess = (title: string, message?: string, actions?: NotificationAction[]) => {
    return addNotification(NotificationType.SUCCESS, title, message, { actions })
  }

  const showError = (title: string, message?: string, actions?: NotificationAction[]) => {
    return addNotification(NotificationType.ERROR, title, message, { 
      persistent: true,
      actions: actions || [{
        label: 'Cerrar',
        handler: () => {}
      }]
    })
  }

  const showWarning = (title: string, message?: string, actions?: NotificationAction[]) => {
    return addNotification(NotificationType.WARNING, title, message, { actions })
  }

  const showInfo = (title: string, message?: string, actions?: NotificationAction[]) => {
    return addNotification(NotificationType.INFO, title, message, { actions })
  }

  return {
    notifications: activeNotifications,
    hasNotifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}