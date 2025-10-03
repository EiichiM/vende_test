<template>
  <div id="app">
    <!-- Router view con transiciones -->
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>

    <!-- Sistema de notificaciones -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useCompaniesStore } from '@/stores/companies'
import { NotificationContainer } from '@/components/ui'
import '@/styles/App.css'

// Stores
const productsStore = useProductsStore()
const companiesStore = useCompaniesStore()

onMounted(() => {
  // App initialization
})
</script>