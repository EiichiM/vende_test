# Products Frontend Application
*Single Page Application del sistema de facturación*

## Descripción

Aplicación frontend desarrollada como SPA (Single Page Application) utilizando Vue.js 3 con Composition API, TypeScript y Vite como build tool. Implementa una arquitectura modular con separación clara de responsabilidades entre lógica de negocio, presentación y estado de la aplicación.

## ¿Por qué estas decisiones?

## Stack tecnológico

**Vue 3 + Composition API:**
- Mejor integración con TypeScript
- Mayor control sobre la lógica de componentes
- Reutilización de lógica mediante composables
- Mejor performance y tree-shaking

**Pinia (State Management):**
- Sintaxis más simple y intuitiva que Vuex
- Excelente soporte para TypeScript
- Mejor debugging experience
- Composables nativos

**Vite (Build Tool):**
- Hot Module Replacement instantáneo
- Build optimizado para producción
- Soporte nativo para TypeScript
- Configuración mínima requerida

**Arquitectura CSS modularizada:**
- Separación de estilos por componente
- Estructura organizada en `src/styles/components/`
- Mejor mantenibilidad y reutilización
- Separación clara entre lógica y presentación

## Funcionalidades implementadas

- ✅ **Gestión de productos**: CRUD completo con formularios validados
- ✅ **Sistema de facturación**: Crear facturas, líneas de productos, cálculos automáticos  
- ✅ **Gestión de clientes**: Modal para crear/editar clientes (empresas y particulares)
- ✅ **Búsqueda y filtros**: DataTable con filtros, paginación y búsqueda
- ✅ **Notificaciones**: Sistema toast para feedback
- ✅ **Error handling**: Boundary components y reportes de errores
- ✅ **CSS modularizado**: Cada componente tiene su CSS separado

## Stack técnico

```
Vue 3.4           → Framework principal  
TypeScript 5.x    → Tipado estático
Vite 5.x          → Build tool y dev server
Pinia             → State management
Vue Router        → Routing
Vitest            → Testing (en desarrollo)
```

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

La app estará en `http://localhost:5173`

*Nota: Asegúrate de tener el backend corriendo en puerto 3000*

## Scripts disponibles

```bash
npm run dev        # Desarrollo con hot reload
npm run build      # Build para producción  
npm run preview    # Preview del build
npm run test       # Tests unitarios
npm run lint       # ESLint + fix automático
npm run type-check # Verificar tipos TypeScript
```

## Arquitectura de componentes

### Estructura general
```
src/
├── components/
│   ├── ProductForm.vue       # Formulario de productos
│   ├── ProductTable.vue      # Tabla con filtros
│   ├── InvoiceForm.vue       # Formulario de facturas (complejo)
│   └── ui/                   # Componentes reutilizables
│       ├── DataTable.vue     # Tabla genérica
│       ├── Dialog.vue        # Modales
│       ├── NotificationContainer.vue
│       └── [15+ componentes más]
├── views/                    # Vistas principales
├── stores/                   # Pinia stores  
├── styles/                   # CSS modularizado
│   ├── App.css              # Estilos globales
│   └── components/          # CSS por componente
├── composables/             # Lógica reutilizable
└── types/                   # Definiciones TypeScript
```

### Modularización CSS

Refactoricé todo el CSS que estaba en `<style scoped>` dentro de los componentes. Ahora cada componente importa su CSS:

```vue
<!-- Antes -->
<template>...</template>
<script>...</script>
<style scoped>
  .component-styles { ... }
</style>

<!-- Después -->  
<template>...</template>
<script>
import '@/styles/components/Component.css'
</script>
```

**Beneficios:**
- CSS organizado por funcionalidad
- Fácil mantenimiento y debugging
- Reutilización de estilos
- Mejor performance (menos CSS duplicado)

## Stores (Pinia)

### ProductsStore
```typescript
// Gestión de productos
- products: Product[]           # Lista de productos
- selectedProduct: Product      # Producto seleccionado
- fetchProducts()              # Cargar desde API
- createProduct()              # Crear nuevo
- updateProduct()              # Actualizar existente  
- deleteProduct()              # Eliminar
```

### ClientsStore  
```typescript
// Gestión de clientes
- clients: Client[]            # Lista de clientes
- clientOptions                # Para selects (computed)
- fetchClients()              # Cargar desde API
- createClient()              # Crear cliente
- validateTaxId()             # Validar DNI/CIF
```

### InvoicesStore
```typescript
// Sistema de facturación  
- invoices: Invoice[]          # Lista de facturas
- calculateLineItemTotals()    # Cálculos por línea
- calculateInvoiceTotals()     # Totales finales
- createInvoice()             # Crear factura
- sendInvoice()               # Enviar por email
```

## Composables desarrollados

### useNotifications
Sistema toast para mostrar mensajes al usuario:
```typescript
const { showSuccess, showError, showWarning } = useNotifications()

showSuccess('Producto creado', 'El producto se guardó correctamente')
showError('Error', 'No se pudo conectar con el servidor')
```

### useSelection  
Para manejar selecciones múltiples en tablas:
```typescript
const { 
  selectedItems, 
  toggleSelection, 
  selectAll, 
  clearSelection 
} = useSelection(items)
```

### usePagination
Paginación con cálculos automáticos:
```typescript
const {
  currentPage,
  totalPages, 
  paginatedItems,
  goToPage
} = usePagination(items, pageSize)
```

## Componentes UI clave

### DataTable.vue
Tabla genérica con:
- Ordenamiento por columnas
- Paginación integrada  
- Selección múltiple
- Acciones por fila (editar, eliminar)
- Responsive

### InvoiceForm.vue  
El componente más complejo. Maneja:
- Selección de cliente (con modal para crear nuevo)
- Líneas de productos (agregar/quitar/modificar)
- Cálculos automáticos de impuestos y totales
- Validaciones de negocio
- Estados de borrador/enviado

### ProductSelectorModal.vue
Modal para seleccionar productos en facturas:
- Lista todos los productos disponibles
- Búsqueda en tiempo real
- Selección múltiple
- Información de stock y precios

## Testing

Los tests están en desarrollo. Tengo algunos básicos:

```bash
npm run test                  # Ejecutar tests
npm run test:coverage         # Con coverage
```

**Estado del testing:**
- Tests unitarios implementados con Vitest
- Cobertura de composables y componentes críticos
- Testing de stores con mocking de API calls

**Pendiente para completar:**
- Tests e2e para flujos completos
- Mayor cobertura en componentes complejos (InvoiceForm)
- Tests de integración entre componentes

## Variables de entorno

```bash
VITE_API_BASE_URL=http://localhost:3000    # URL del backend
VITE_APP_TITLE=Vende Products              # Título de la app
```

## Build y deployment

```bash
npm run build                 # Genera dist/
npm run preview              # Preview local del build
```

El build genera archivos estáticos que se pueden servir desde cualquier servidor web.

## Cosas por mejorar

- [ ] Más tests unitarios y e2e
- [ ] Internacionalización (i18n)
- [ ] Convertir en PWA
- [ ] Lazy loading de rutas
- [ ] Optimización de bundle size
- [ ] Dark mode
- [ ] Mejor manejo de errores offline

## Decisiones técnicas destacadas

**Modularización CSS**: El mayor refactor fue separar el CSS. Tomó tiempo pero mejoró mucho la mantenibilidad.

**Composition API**: Uso consistente del Composition API en lugar de Options API. Mejor para TypeScript.

**Stores simples**: Mantuve los stores de Pinia simples, sin over-engineering. Solo lo necesario.

**Componentes genéricos**: DataTable, Dialog, etc. son reutilizables pero no sobrecomplicados.

**TypeScript estricto**: Configuración estricta de TS. Ayuda a detectar errores temprano.

---
*Eiichi M - 2025*
- Diseño optimizado para móviles primero
- Navegación adaptativa
- Tablas con scroll horizontal
- Formularios de una columna

### Tablet & Desktop
- Layouts de múltiples columnas
- Tablas completas
- Sidebar navigation
- Formularios optimizados

## 🚀 Despliegue

### Netlify/Vercel
```bash
# 1. Build de producción
npm run build

# 2. Deploy directorio /dist
# Configurar redirects para SPA:
/*    /index.html   200
```

### Nginx
```nginx
server {
    listen 80;
    server_name ejemplo.com;
    root /var/www/products-front/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🎯 Mejoras Futuras

- [ ] **PWA**: Convertir en Progressive Web App
- [ ] **Tests**: Agregar tests unitarios y e2e
- [ ] **Internacionalización**: Soporte multi-idioma
- [ ] **Dark Mode**: Tema oscuro
- [ ] **Infinite Scroll**: Paginación automática
- [ ] **Drag & Drop**: Reordenamiento de productos
- [ ] **Export**: Exportar lista a CSV/PDF
- [ ] **Notifications**: Sistema de notificaciones push

## Configuración y desarrollo

### Requisitos del sistema
- Node.js 18+ 
- npm 8+
- Navegador moderno con soporte ES6+

### Variables de entorno
```bash
VITE_API_BASE_URL=http://localhost:3000    # URL de la API backend
VITE_APP_TITLE=Sistema Vende              # Título de la aplicación
```

### Scripts de desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run test         # Tests unitarios
npm run lint         # Linting y formato de código
```

## Roadmap de mejoras

### Funcionalidades planificadas
- **PWA (Progressive Web App)**: Funcionamiento offline y notificaciones push
- **Testing exhaustivo**: Implementación de tests e2e con Cypress
- **Internacionalización (i18n)**: Soporte multi-idioma
- **Sistema de temas**: Modo oscuro y personalización
- **Drag & Drop**: Reordenamiento interactivo de elementos
- **Exportación**: Generación de reportes CSV/PDF
- **Optimización**: Lazy loading y code splitting avanzado

### Mejoras técnicas
- **Performance**: Implementación de virtual scrolling
- **Accesibilidad**: Cumplimiento WCAG 2.1
- **SEO**: Server-side rendering con Nuxt.js
- **Monitoreo**: Integración con herramientas de analytics

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Eiichi Matsumoto - 2025**

*Aplicación frontend desarrollada con Vue.js 3 y arquitectura modular*