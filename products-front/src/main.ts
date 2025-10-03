import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Bootstrap de la aplicación Vue
// Uso Pinia en lugar de Vuex por simplicidad y mejor integración con TS
const app = createApp(App)

// Store global para estado reactivo
app.use(createPinia())

// Router para SPA navigation
app.use(router)

app.mount('#app')