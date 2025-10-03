<template>
  <div class="app-layout">
    <!-- Header de la aplicación -->
    <header class="app-header">
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/products" class="brand-link">
            <h1 class="brand-title">Vende Products</h1>
            <span class="brand-subtitle">Sistema de Gestión</span>
          </router-link>
        </div>
        
        <div class="nav-menu">
          <router-link 
            to="/products" 
            class="nav-link"
            active-class="nav-link-active"
          >
            📦 Productos
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Contenido principal -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2025 Vende Tech Eiichi Matsuo</p>
        <div class="footer-links">
          <a 
            href="http://localhost:3000/api/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            class="footer-link"
          >
            📚 API Docs
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Este layout puede recibir props si necesitamos personalizar el comportamiento
interface Props {
  showHeader?: boolean
  showFooter?: boolean
}

withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true
})
</script>

<style scoped>
@import '@/styles/layouts/MainLayout.css';
</style>