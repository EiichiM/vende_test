/**
 * Vende - Sistema de Facturación
 * Constantes centralizadas para gestión fiscal y de documentos
 */

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  SERVICES: '/services',
  COMPANIES: '/companies',
  CLIENTS: '/clients',
  INVOICES: '/invoices',
  QUOTES: '/quotes',
  TAX_RATES: '/tax-rates',
  HEALTH: '/health'
} as const

// Validation Rules for Billing System
export const VALIDATION_RULES = {
  PRODUCT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 255
  },
  PRODUCT_DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  UNIT_PRICE: {
    MIN_VALUE: 0.00, // Permitir servicios gratuitos
    MAX_VALUE: 999999.99
  },
  PRODUCT_CODE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[A-Z0-9\-_]+$/i // Alfanumérico con guiones
  },
  TAX_RATE: {
    MIN_VALUE: 0,
    MAX_VALUE: 100
  },
  INVOICE_NUMBER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20
  },
  TAX_ID: {
    MIN_LENGTH: 9,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9]+$/ // NIF/CIF pattern
  }
} as const

// Tax Rates (Spain)
export const TAX_RATES = {
  IVA_GENERAL: 21,
  IVA_REDUCED: 10,
  IVA_SUPER_REDUCED: 4,
  IVA_EXEMPT: 0
} as const

// UI Constants
export const UI_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, inténtalo de nuevo.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  SERVER_ERROR: 'Error del servidor. Por favor, contacta al soporte.',
  TAX_CALCULATION_ERROR: 'Error al calcular los impuestos.',
  INVOICE_GENERATION_ERROR: 'Error al generar la factura.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Producto/Servicio creado exitosamente',
  PRODUCT_UPDATED: 'Producto/Servicio actualizado exitosamente',
  PRODUCT_DELETED: 'Producto/Servicio eliminado exitosamente',
  INVOICE_CREATED: 'Factura generada exitosamente',
  INVOICE_SENT: 'Factura enviada exitosamente',
  QUOTE_CREATED: 'Presupuesto creado exitosamente'
} as const

// Route Names
export const ROUTE_NAMES = {
  DASHBOARD: 'Dashboard',
  PRODUCTS: 'ProductList',
  PRODUCT_CREATE: 'ProductCreate',
  PRODUCT_EDIT: 'ProductEdit',
  INVOICES: 'InvoiceList',
  INVOICE_CREATE: 'InvoiceCreate',
  INVOICE_EDIT: 'InvoiceEdit',
  CLIENTS: 'ClientList',
  COMPANIES: 'CompanyList',
  REPORTS: 'Reports'
} as const

// Document Status Labels
export const STATUS_LABELS = {
  PRODUCT: {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo', 
    DISCONTINUED: 'Descontinuado'
  },
  INVOICE: {
    DRAFT: 'Borrador',
    SENT: 'Enviada',
    PAID: 'Pagada',
    OVERDUE: 'Vencida',
    CANCELLED: 'Cancelada'
  }
} as const

// Unit Type Labels
export const UNIT_LABELS = {
  UNIT: 'Unidad',
  HOUR: 'Hora',
  DAY: 'Día',
  MONTH: 'Mes',
  METER: 'Metro',
  KILOGRAM: 'Kilogramo',
  LITER: 'Litro',
  PACKAGE: 'Paquete'
} as const

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  FILTERS: 'product_filters'
} as const