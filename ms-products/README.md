# MS ## Decisiones técnicas

**NestJS Framework:**
- Arquitectura modular basada en decorators
- Inyección de dependencias nativa
- Integración completa con TypeScript
- Generación automática de documentación Swagger
- Facilita testing y mantenimiento

**Base de datos multiconfigurable:**
- SQLite para desarrollo (cero configuración, ideal para prototipado)
- PostgreSQL para producción (escalabilidad y rendimiento)
- TypeORM como abstraction layer para compatibilidad

**Patrón arquitectónico:**
- Controller → Service → Entity (separation of concerns)
- DTOs para validación y transformación de datos
- Repository pattern a través de TypeORMcts API
*Microservicio de gestión de productos*

## Descripción

Microservicio backend desarrollado con NestJS que proporciona una API REST para la gestión integral de productos y compañías dentro del sistema de facturación Vende. Implementa arquitectura modular con TypeORM como ORM y soporte para múltiples bases de datos.

## ¿Por qué estas decisiones técnicas?

**NestJS Framework:**
- Arquitectura modular escalable similar a Angular
- Integración completa con TypeScript
- Generación automática de documentación Swagger
- Sistema robusto de inyección de dependencias

**SQLite**: Para desarrollo es una maravilla. Cero configuración, cero problemas. En producción cambio a PostgreSQL pero para empezar SQLite es perfecto.

**Arquitectura directa**: Controller → Service → Entity. Nada de patrones raros. Mi filosofía: que funcione primero, ya optimizaré después si hace falta.

## Lo que hace

- Gestión completa de productos (CRUD)
- Cada producto pertenece a una compañía
- Búsqueda básica por nombre
- Validaciones con class-validator
- API REST documentada automáticamente

## Stack técnico

```
NestJS 10.x      → Framework principal
TypeORM          → ORM, funciona bien con SQLite
class-validator  → Validaciones automáticas
Swagger          → Documentación de API
Jest             → Testing (básico por ahora)
Docker           → Para deployment
```

## Cómo ejecutar esto

Necesitas Node.js 18+ y npm. Docker es opcional pero recomendado.

### Opción rápida
```bash
npm install
npm run start:dev
```

La API estará en `http://localhost:3000`
Swagger en `http://localhost:3000/api/docs`

### Con Docker (recomendado)
```bash
docker-compose up
```

Esto levanta todo: la API + PostgreSQL + Adminer para ver la BD.

## 🚀 Instalación y Ejecución

### Opción 1: Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd ms-products

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Ejecutar en modo desarrollo
npm run start:dev

# La aplicación estará disponible en: http://localhost:3000
# Documentación Swagger: http://localhost:3000/api/docs
```

### Opción 2: Docker Compose (Recomendado)

```bash
# 1. Ejecutar con Docker Compose
docker-compose up -d

# 2. Ver logs
docker-compose logs -f ms-products

# 3. Detener servicios
docker-compose down
```

## Endpoints disponibles

### Productos
```
GET    /products              → Todos los productos
GET    /products?companyId=x  → Solo de una compañía
GET    /products/:id          → Un producto específico
POST   /products              → Crear producto
PATCH  /products/:id          → Actualizar producto  
DELETE /products/:id          → Borrar producto
GET    /products/search?q=x   → Buscar por nombre
```

### Compañías
```
GET    /companies     → Todas las compañías
GET    /companies/:id → Una compañía específica
```

*Tip: Usa Swagger en `/api/docs` para probar los endpoints directamente*

## Ejemplos rápidos

Uso Postman normalmente, pero aquí tienes algunos curl si prefieres terminal:

### Crear producto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Air M2",
    "description": "Para desarrollo y diseño", 
    "unitPrice": 1299.99,
    "currency": "USD",
    "code": "MBA-M2-001",
    "companyId": "tu-company-id-aqui",
    "category": "PRODUCT"
  }'
```

### Buscar productos
```bash
curl "http://localhost:3000/products/search?q=macbook"
```

### Listar por compañía
```bash
curl "http://localhost:3000/products?companyId=tu-company-id"
```

**Recomendación:** Utilizar la documentación interactiva Swagger en `/api/docs` para testing y exploración de endpoints.

## Testing

## Testing

El proyecto implementa testing unitario con Jest:

```bash
npm test              # Ejecutar tests unitarios
npm run test:cov      # Tests con reporte de cobertura
npm run test:watch    # Modo watch para desarrollo
npm run test:debug    # Debug mode para tests
```

**Estado actual:**
- Tests unitarios para controllers y services
- Mocking de dependencias con Jest
- Cobertura básica de casos críticos

**Roadmap de testing:**
- Implementación de tests e2e con Supertest
- Mejora de cobertura de código
- Tests de integración con base de datos

## Estructura de datos

### Producto
```typescript
{
  id: string;              // UUID generado automáticamente  
  name: string;            // "MacBook Air M2"
  description?: string;    // Opcional
  unitPrice: number;       // 1299.99 (sin IVA)
  currency: string;        // "USD" (por defecto)
  taxType: TaxType;        // IVA_GENERAL, IVA_REDUCED, etc.
  taxRate: number;         // 21 (porcentaje)
  unitType: UnitType;      // UNIT, HOUR, DAY, etc.
  code: string;            // "MBA-M2-001" (código interno)
  companyId: string;       // A qué compañía pertenece
  status: ProductStatus;   // ACTIVE, INACTIVE, DRAFT
  category: ProductCategory; // PRODUCT, SERVICE, etc.
  // timestamps automáticos
}
```

### Compañía  
```typescript
{
  id: string;              // UUID
  name: string;            // "Mi Empresa SL"
  taxId: string;           // CIF/NIF
  address: string;         // Dirección completa
  email: string;           // Contacto
  phone: string;           // Teléfono
  isActive: boolean;       // true/false
  // más campos de contacto
}
```

*Los enums están definidos en las entidades para mantener consistencia*

## Docker y deployment

Tengo configurado multi-stage builds en el Dockerfile. Para desarrollo:

```bash
docker-compose up
```

Esto levanta todo el stack: API + PostgreSQL + Adminer en puerto 8080 para gestionar la BD.

Para producción:
```bash  
docker-compose -f docker-compose.prod.yml up
```

## Variables de entorno importantes

```bash
DATABASE_HOST=postgres     # o localhost en desarrollo
PORT=3000                 # puerto de la API
NODE_ENV=development      # o production
```

## Estructura del proyecto

```
src/
├── modules/
│   ├── products/          # Todo lo relacionado con productos
│   │   ├── dto/           # Validaciones de entrada
│   │   ├── entities/      # Modelo de datos
│   │   ├── *.controller.ts # Endpoints REST  
│   │   └── *.service.ts   # Lógica de negocio
│   └── companies/         # Gestión de compañías
├── app.module.ts         # Configuración principal
└── main.ts              # Bootstrap de la aplicación
```

## Arquitectura del proyecto

```
src/
├── modules/
│   ├── products/          # Módulo de gestión de productos
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── entities/      # Entidades de base de datos
│   │   ├── *.controller.ts # Controladores REST  
│   │   └── *.service.ts   # Lógica de negocio
│   └── companies/         # Módulo de gestión de compañías
├── config/               # Configuraciones de la aplicación
├── app.module.ts         # Módulo raíz de la aplicación
└── main.ts              # Punto de entrada de la aplicación
```

**Patrón arquitectónico implementado:**
- **Controller Layer**: Manejo de requests HTTP y responses
- **Service Layer**: Lógica de negocio y operaciones
- **Entity Layer**: Modelos de datos y mapeo a base de datos
- **DTO Layer**: Validación y transformación de datos de entrada

## Configuración y despliegue

### Variables de entorno
```bash
PORT=3000                                  # Puerto del servidor
DATABASE_HOST=localhost                    # Host de base de datos
DATABASE_PORT=5432                        # Puerto de base de datos
DATABASE_NAME=vende_products              # Nombre de base de datos
DATABASE_USER=vende_user                  # Usuario de base de datos
DATABASE_PASSWORD=vende_password          # Contraseña de base de datos
NODE_ENV=development                      # Entorno de ejecución
```

### Docker
```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

## Roadmap técnico

### Mejoras planificadas
- **Tests e2e**: Implementación con Supertest
- **Paginación**: Paginación eficiente para listados grandes
- **Rate limiting**: Protección contra abuse de API
- **Logging**: Sistema de logs estructurado con Winston
- **Health checks**: Endpoints de monitoreo avanzados
- **Cache**: Implementación de Redis para optimización
- **Documentación**: OpenAPI 3.0 completa

---
**Eiichi Matsumoto - 2025**

*API REST desarrollada con NestJS siguiendo principios SOLID*