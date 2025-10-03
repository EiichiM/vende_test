<template>
  <teleport to="body">
    <div class="notifications-container" v-if="hasNotifications">
      <TransitionGroup name="notification" tag="div" class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification--${notification.type.toLowerCase()}`]"
        >
          <div class="notification-icon">
            <component :is="getIconComponent(notification.type)" />
          </div>
          
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p v-if="notification.message" class="notification-message">
              {{ notification.message }}
            </p>
          </div>

          <div class="notification-actions" v-if="notification.actions?.length">
            <button
              v-for="action in notification.actions"
              :key="action.label"
              @click="handleAction(action, notification)"
              class="notification-action"
            >
              {{ action.label }}
            </button>
          </div>

          <button
            @click="removeNotification(notification.id)"
            class="notification-close"
            aria-label="Cerrar notificación"
          >
            <CloseIcon />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { NotificationType, type Notification, type NotificationAction } from '@/types'

const { notifications, hasNotifications, removeNotification } = useNotifications()

function handleAction(action: NotificationAction, notification: Notification) {
  action.handler()
  removeNotification(notification.id)
}

// Icon components
function CheckIcon() {
  return h('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'currentColor'
  }, h('path', {
    fillRule: 'evenodd',
    d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
    clipRule: 'evenodd'
  }))
}

function ErrorIcon() {
  return h('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'currentColor'
  }, h('path', {
    fillRule: 'evenodd',
    d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
    clipRule: 'evenodd'
  }))
}

function WarningIcon() {
  return h('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'currentColor'
  }, h('path', {
    fillRule: 'evenodd',
    d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
    clipRule: 'evenodd'
  }))
}

function InfoIcon() {
  return h('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'currentColor'
  }, h('path', {
    fillRule: 'evenodd',
    d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    clipRule: 'evenodd'
  }))
}

function CloseIcon() {
  return h('svg', {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'currentColor'
  }, h('path', {
    d: 'M12.854 4.854a0.5 0.5 0 0 0-0.708-0.708L8 8.293 3.854 4.146a0.5 0.5 0 1 0-0.708 0.708L7.293 9l-4.147 4.146a0.5 0.5 0 0 0 0.708 0.708L8 9.707l4.146 4.147a0.5 0.5 0 0 0 0.708-0.708L8.707 9l4.147-4.146z'
  }))
}

function getIconComponent(type: NotificationType) {
  switch (type) {
    case NotificationType.SUCCESS:
      return CheckIcon
    case NotificationType.ERROR:
      return ErrorIcon
    case NotificationType.WARNING:
      return WarningIcon
    case NotificationType.INFO:
      return InfoIcon
    default:
      return InfoIcon
  }
}
</script>

<script lang="ts">
import '@/styles/components/NotificationContainer.css'
</script>
