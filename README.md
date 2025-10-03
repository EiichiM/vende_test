# Sistema Vende
*Plataforma de facturación y gestión de productos*

## Descripción

Sistema completo de facturación desarrollado con arquitectura de### NestJS Framework
**Características principales:**
- Arquitectura modular escalable
- Decorators para metadatos y configuración
- Sistema de inyección de dependencias robusto
- Generación automática de documentación Swagger
- Excelente soporte para TypeScript
- Facilita testing con mocks e inyecciónicroservicios, compuesto por una API REST backend construida con NestJS y una aplicación frontend SPA desarrollada en Vue.js 3. El sistema permite la gestión integral de productos, clientes, compañías y generación de facturas con cálculos automáticos de impuestos.

**Frontend**: Vue.js con TypeScript para la interfaz de usuario  
**Backend**: NestJS con TypeORM para la API REST  
**Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                    Sistema Vende                            │
│                                                             │
│  ┌──────────────────┐            ┌─────────────────────┐    │
│  │   Frontend       │   HTTP     │      Backend        │    │
│  │   (Vue.js)       │ ◄─────────► │     (NestJS)        │    │
│  │                  │   REST API  │                     │    │
│  │  - products-front│            │   - ms-products     │    │
│  │  - Puerto 5173   │            │   - Puerto 3000     │    │
│  └──────────────────┘            └─────────────────────┘    │
│                                             │                │
│                                             │ TypeORM        │
│                                             ▼                │
│                                   ┌─────────────────────┐    │
│                                   │    Base de Datos    │    │
│                                   │                     │    │
│                                   │  SQLite / PostgreSQL│    │
│                                   └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Funcionalidades implementadas

### ✅ Gestión de productos
- CRUD completo de productos
- Categorización (producto, servicio, etc.)
- Gestión de precios e impuestos
- Códigos internos y códigos de barras

### ✅ Sistema de facturación  
- Crear facturas con múltiples productos
- Cálculos automáticos de impuestos (IVA)
- Descuentos por línea
- Diferentes tipos de documento (factura, presupuesto, etc.)

### ✅ Gestión de clientes
- Clientes particulares y empresas
- Validación de DNI/CIF
- Direcciones de facturación
- Configuración de envío automático

### ✅ Gestión de compañías
- Múltiples compañías por usuario
- Datos fiscales completos
- Configuración de impuestos por defecto

## Cómo ejecutar todo

### Opción rápida (Docker)
```bash
# Clonar el repositorio
git clone <tu-repo>
cd Vende_Tech

# Levantar el backend
cd ms-products
docker-compose up -d

# Levantar el frontend (en otra terminal)
cd ../products-front
npm install
npm run dev
```

### Desarrollo local
```bash
# Backend (en una terminal)
cd ms-products
npm install
npm run start:dev    # Puerto 3000

# Frontend (en otra terminal) 
cd products-front
npm install  
npm run dev         # Puerto 5173
```

**URLs importantes:**
- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Adminer (BD): http://localhost:8080

## Stack técnico completo

### Frontend (products-front/)
```
Vue 3.4           → Framework principal
TypeScript 5.x    → Tipado estático  
Vite 5.x          → Build tool
Pinia             → State management
Vue Router        → Enrutado
CSS Modules       → Estilos modularizados
Vitest            → Testing
```

### Backend (ms-products/)
```
NestJS 10.x       → Framework Node.js
TypeORM           → ORM para base de datos
SQLite            → BD para desarrollo
PostgreSQL        → BD para producción
Swagger           → Documentación API
Jest              → Testing
Docker            → Contenedorización
```

## Estructura del proyecto

```
Vende_Tech/
├── ms-products/              # Backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/     # Gestión productos
│   │   │   └── companies/    # Gestión compañías  
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── products-front/           # Frontend SPA
│   ├── src/
│   │   ├── components/       # Componentes Vue
│   │   ├── views/           # Páginas
│   │   ├── stores/          # Estado (Pinia)
│   │   ├── styles/          # CSS modularizado
│   │   └── types/           # Tipos TypeScript
│   └── README.md
│
└── README.md                # Este archivo
```

## Decisiones técnicas importantes

### Vue.js 3 + Composition API
**Ventajas técnicas:**
- Sintaxis declarativa más legible
- Excelente integración nativa con TypeScript
- Sistema de reactividad optimizado
- Pinia ofrece mejor developer experience que Redux
- Menor curva de aprendizaje y mayor productividad

### NestJS Framework
**Características principales:**
- Arquitectura modular escalable
- Decorators para metadatos y configuración
- Sistema de inyección de dependencias robusto
- Generación automática de documentación Swagger
- Excelente soporte para TypeScript
- Facilita testing con mocks e inyección

### Estrategia de Base de Datos
**Desarrollo - SQLite:**
- Configuración cero para entorno de desarrollo
- Base de datos embebida, no requiere servicios externos
- Ideal para prototipado y desarrollo local
- Compatibilidad completa con TypeORM

**Producción - PostgreSQL:**
- Base de datos robusta para entornos de producción
- Mejor rendimiento con grandes volúmenes de datos
- Soporte avanzado para transacciones y concurrencia### Arquitectura CSS Modularizada
**Problema identificado:**
- Estilos CSS mezclados dentro de componentes Vue
- Dificultad para mantener y reutilizar estilos
- Código menos legible y organizacion deficiente

**Solución implementada:**
- Separación de estilos en archivos individuales por componente
- Estructura organizada en `src/styles/components/`
- Mejor reutilización y mantenibilidad del código CSS
- Separación clara de responsabilidades (lógica vs presentación)

## Características destacadas

### Sistema de notificaciones toast
Sistema de notificaciones toast implementado:
```typescript
const { showSuccess, showError } = useNotifications()
showSuccess('Producto creado', 'El producto se guardó correctamente')
```

### Validación de documentos españoles
Validación automática de DNI, NIE y CIF:
```typescript
validateTaxId(taxId: string, isCompany: boolean)
// Valida formato y dígito de control
```

### Cálculos automáticos de facturación
Los totales se recalculan automáticamente al cambiar cualquier línea:
- Subtotal por línea
- Descuentos aplicados  
- IVA por tipo de producto
- Total final

### Tabla genérica reutilizable
Un componente de tabla que uso en múltiples lugares:
- Ordenamiento por columnas
- Paginación
- Selección múltiple
- Acciones personalizables

## Configuración y variables

### Backend (.env)
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432  
DATABASE_NAME=vende_products
DATABASE_USER=vende_user
DATABASE_PASSWORD=vende_password
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Vende Products
```

## Testing

### Backend
```bash
cd ms-products
npm test              # Tests unitarios
npm run test:cov      # Con cobertura
```

### Frontend  
```bash
cd products-front
npm test              # Tests unitarios (Vitest)
```

**Estado actual de testing:**
- Tests unitarios básicos implementados
- Cobertura enfocada en funcionalidades críticas
- Pendiente: Implementación de tests e2e y mayor cobertura

## Deployment

### Desarrollo
```bash
# Backend con Docker
cd ms-products && docker-compose up

# Frontend 
cd products-front && npm run dev
```

### Producción
```bash
# Backend
cd ms-products && docker-compose -f docker-compose.prod.yml up

# Frontend  
cd products-front && npm run build
# Servir archivos estáticos desde dist/
```

### Decisiones técnicas exitosas
- **Arquitectura simple y clara**: Patrón Controller → Service → Entity sin over-engineering
- **TypeScript estricto**: Detección temprana de errores y mejor refactoring
- **Modularización CSS**: Mejora significativa en mantenibilidad y organización
- **Docker multi-stage builds**: Optimización de builds y reducción de tamaño de imágenes

### Áreas de mejora identificadas
- **Testing temprano**: Implementar TDD desde el inicio del proyecto
- **Manejo centralizado de errores**: Estrategia unificada de error handling
- **Conventional commits**: Estandarización en historial de cambios para mejor trazabilidad

## Documentación técnica

Para información detallada de implementación y configuración:
- [Backend API Documentation](./ms-products/README.md)  
- [Frontend Application Documentation](./products-front/README.md)

## Contribución y desarrollo

El proyecto sigue las mejores prácticas de desarrollo moderno:
- Conventional commits para historial de cambios
- TypeScript estricto para type safety
- ESLint y Prettier para calidad de código
- Testing unitario y de integración
- Documentación automática con Swagger

---
**Eiichi Matsumoto - 2025**

*Desarrollado siguiendo principios de Clean Code y arquitectura modular*
