import { vi, beforeEach } from 'vitest'
import { config } from '@vue/test-utils'

// Mock global objects and APIs
global.fetch = vi.fn()
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

global.navigator = {
  ...global.navigator,
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
    read: vi.fn(),
    write: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as any,
}

// Configure Vue Test Utils
config.global.config.warnHandler = () => {
  // Suppress Vue warnings during testing
}

// Global test utilities
export const createMockError = (message: string, type = 'Error') => {
  const error = new Error(message)
  error.name = type
  error.stack = `${type}: ${message}\n    at test (test.js:1:1)`
  return error
}

import { ProductStatus, ProductCategory, TaxType, UnitType } from '@/types'

export const createMockProduct = (overrides = {}) => ({
  id: 'test-product-id',
  name: 'Test Product',
  description: 'Test Description',
  unitPrice: 100,
  currency: 'USD',
  stockQuantity: 10,
  category: ProductCategory.PRODUCT,
  companyId: 'test-company-id',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  minimumStock: 5,
  code: 'TEST-001',
  unitType: UnitType.UNIT,
  taxType: TaxType.IVA_GENERAL,
  taxRate: 21,
  status: ProductStatus.ACTIVE,
  trackStock: true,
  sku: 'TEST-001',
  barcode: undefined,
  isActive: true,
  canBeOrdered: true,
  isLowStock: false,
  totalValue: 1000,
  formattedPrice: '$100.00',
  isService: false,
  ...overrides,
})

export const createMockCompany = (overrides = {}) => ({
  id: 'test-company-id',
  name: 'Test Company',
  description: 'Test Company Description',
  taxId: 'B12345678',
  address: 'Calle Test 123',
  city: 'Madrid',
  postalCode: '28001',
  country: 'España',
  email: 'test@company.com',
  phone: '+34 912 345 678',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
})

// Mock API responses
export const mockApiService = {
  // Products
  getProducts: vi.fn(),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  searchProducts: vi.fn(),
  // Companies
  getCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}

// Mock router
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      params: {},
      query: {},
      hash: '',
      name: 'home',
      meta: {},
    },
  },
}

// Mock pinia store
export const createMockStore = () => ({
  $patch: vi.fn(),
  $reset: vi.fn(),
  $state: {},
  $subscribe: vi.fn(),
  $onAction: vi.fn(),
})

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})