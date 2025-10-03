
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum ProductCategory {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  DIGITAL_SERVICE = 'DIGITAL_SERVICE',
  CONSULTATION = 'CONSULTATION',
  RENTAL = 'RENTAL',
  OTHER = 'OTHER'
}

export enum TaxType {
  IVA_GENERAL = 'IVA_GENERAL', // 21%
  IVA_REDUCED = 'IVA_REDUCED', // 10%
  IVA_SUPER_REDUCED = 'IVA_SUPER_REDUCED', // 4%
  IVA_EXEMPT = 'IVA_EXEMPT', // 0%
  SPECIAL_TAX = 'SPECIAL_TAX'
}

export enum DocumentType {
  INVOICE = 'INVOICE',
  SIMPLIFIED_INVOICE = 'SIMPLIFIED_INVOICE',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  QUOTE = 'QUOTE',
  DELIVERY_NOTE = 'DELIVERY_NOTE'
}

export enum UnitType {
  UNIT = 'UNIT', // Unidades
  HOUR = 'HOUR', // Horas
  DAY = 'DAY', // Días
  MONTH = 'MONTH', // Meses
  METER = 'METER', // Metros
  KILOGRAM = 'KILOGRAM', // Kilogramos
  LITER = 'LITER', // Litros
  PACKAGE = 'PACKAGE' // Paquetes
}

export enum ApiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

// Base interfaces with audit fields
interface AuditableEntity {
  readonly id: string
  readonly createdAt: string
  readonly updatedAt: string
}

interface Timestamped {
  readonly createdAt: string
  readonly updatedAt: string
}

// Core Domain Entities
export interface Product extends AuditableEntity {
  readonly name: string
  readonly description: string | null
  readonly unitPrice: number // Precio unitario sin impuestos
  readonly currency: string
  readonly companyId: string
  readonly status: ProductStatus
  readonly category: ProductCategory
  readonly unitType: UnitType
  readonly taxType: TaxType
  readonly taxRate: number // Porcentaje de impuesto (ej: 21 para IVA general)
  readonly code: string // Código interno del producto/servicio
  readonly barcode?: string // Código de barras (opcional para productos físicos)
  readonly stockQuantity?: number // Solo para productos físicos
  readonly minimumStock?: number
  readonly trackStock: boolean // Si se debe hacer seguimiento de stock
}

export interface Company extends AuditableEntity {
  readonly name: string
  readonly description: string | null
  readonly taxId: string // NIF/CIF
  readonly address: string
  readonly city: string
  readonly postalCode: string
  readonly country: string
  readonly email: string
  readonly phone: string
  readonly isActive: boolean
}

// Value Objects
export interface Money {
  readonly amount: number
  readonly currency: string
}

export interface ProductPrice extends Money {
  readonly formattedValue: string
}

// DTOs for API communication
export interface CreateProductRequest {
  name: string
  description?: string
  unitPrice: number
  companyId: string
  category: ProductCategory
  unitType: UnitType
  taxType: TaxType
  taxRate: number
  code: string
  barcode?: string
  stockQuantity?: number
  minimumStock?: number
  trackStock: boolean
  currency?: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus
}

// Billing-specific interfaces
export interface InvoiceLineItem {
  productId: string
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  unitType: UnitType
  taxType: TaxType
  taxRate: number
  discount?: number
  subtotal: number
  taxAmount: number
  total: number
}

export interface Invoice extends AuditableEntity {
  readonly number: string
  readonly series: string
  readonly type: DocumentType
  readonly issueDate: string
  readonly dueDate?: string
  readonly companyId: string
  readonly clientId: string
  readonly status: InvoiceStatus
  readonly currency: string
  readonly lineItems: InvoiceLineItem[]
  readonly subtotal: number
  readonly totalTax: number
  readonly totalDiscount: number
  readonly total: number
  readonly notes?: string
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface Client extends AuditableEntity {
  readonly isCompany: boolean
  readonly companyName?: string // Solo para empresas
  readonly firstName?: string // Solo para particulares
  readonly lastName?: string // Solo para particulares
  readonly taxId?: string // NIF/CIF/DNI/NIE (opcional)
  readonly email: string
  readonly phone?: string
  readonly mobile?: string
  readonly contactPerson?: string // Solo para empresas
  readonly address?: string
  readonly city?: string
  readonly postalCode?: string
  readonly province?: string
  readonly country: string
  readonly notes?: string
  readonly isActive: boolean
  readonly sendInvoiceByEmail: boolean
}

export type CreateProductDto = CreateProductRequest
export type UpdateProductDto = UpdateProductRequest

export interface ProductsQuery {
  companyId?: string
  search?: string
  status?: ProductStatus
  limit?: number
  offset?: number
}

// API Response wrapper with proper error handling
export interface ApiResponse<T = unknown> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// Form state management
export interface FormField<T = string> {
  value: T
  error: string | null
  touched: boolean
  dirty: boolean
}

export interface ProductFormState {
  name: FormField<string>
  description: FormField<string>
  unitPrice: FormField<number>
  companyId: FormField<string>
  category: FormField<ProductCategory>
  unitType: FormField<UnitType>
  taxType: FormField<TaxType>
  taxRate: FormField<number>
  code: FormField<string>
  barcode: FormField<string>
  stockQuantity: FormField<number>
  minimumStock: FormField<number>
  trackStock: FormField<boolean>
  status: FormField<ProductStatus>
}

export interface ProductFormData {
  name: string
  description: string
  unitPrice: string // String for form input
  companyId: string
  category: ProductCategory
  unitType: UnitType
  taxType: TaxType
  taxRate: string // String for form input
  code: string
  barcode?: string
  stockQuantity?: number
  minimumStock?: number
  trackStock: boolean
}

// Validation types
export interface ValidationMessages {
  [field: string]: string
}

// UI State management
export interface UiState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  handler: () => void
}

// Resource state with advanced loading patterns
export interface ResourceState<T> {
  data: T | null
  status: ApiStatus
  error: ApiError | null
  lastFetch: string | null
  stale: boolean
}

export interface PaginatedResource<T> extends ResourceState<T[]> {
  pagination: {
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Advanced filter system
export interface BaseFilter {
  field: string
  operator: FilterOperator
  value: unknown
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  CONTAINS = 'contains',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface ProductFilters {
  companyId?: string
  searchTerm?: string
  priceRange?: {
    min: number
    max: number
  }
  status?: string
  // Advanced filters (optional)
  company?: BaseFilter
  name?: BaseFilter
}

// Configuration interfaces
export interface ApiClientConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
  headers?: Record<string, string>
}

export interface AppConfig {
  api: ApiClientConfig
  features: FeatureFlags
  ui: UiConfig
}

export interface FeatureFlags {
  enableAdvancedFilters: boolean
  enableRealTimeUpdates: boolean
  enableExport: boolean
}

export interface UiConfig {
  pageSize: number
  defaultTheme: 'light' | 'dark'
  animationsEnabled: boolean
}

// Utility types for better type safety
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event system for decoupled architecture
export interface DomainEvent {
  type: string
  payload: unknown
  timestamp: string
}

export interface ProductCreatedEvent extends DomainEvent {
  type: 'PRODUCT_CREATED'
  payload: Product
}

export interface ProductUpdatedEvent extends DomainEvent {
  type: 'PRODUCT_UPDATED'
  payload: {
    previous: Product
    current: Product
  }
}

export interface ProductDeletedEvent extends DomainEvent {
  type: 'PRODUCT_DELETED'
  payload: {
    productId: string
  }
}

export type ProductEvent = ProductCreatedEvent | ProductUpdatedEvent | ProductDeletedEvent

// Repository pattern interfaces
export interface Repository<T, K = string> {
  findById(id: K): Promise<T | null>
  findAll(query?: unknown): Promise<T[]>
  save(entity: T): Promise<T>
  delete(id: K): Promise<void>
}

export interface ProductRepository extends Repository<Product> {
  findByCompany(companyId: string): Promise<Product[]>
  search(query: ProductsQuery): Promise<PaginatedResource<Product>>
  countByCompany(companyId: string): Promise<number>
}

// Service layer interfaces
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>
}

export interface ProductService {
  getProducts(query?: ProductsQuery): Promise<Product[]>
  getProduct(id: string): Promise<Product>
  createProduct(request: CreateProductRequest): Promise<Product>
  updateProduct(id: string, request: UpdateProductRequest): Promise<Product>
  deleteProduct(id: string): Promise<void>
}

// Component props with strict typing
export interface ProductTableProps {
  products: Product[]
  loading?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onSort?: (field: keyof Product, direction: 'asc' | 'desc') => void
}

export interface ProductFormProps {
  product?: Product
  companies: Company[]
  loading?: boolean
  onSubmit?: (data: CreateProductRequest | UpdateProductRequest) => void
  onCancel?: () => void
}

export interface TableAction {
  id: string
  label: string
  icon: string
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  action: (item: any) => void | Promise<void>
}

export interface BulkAction {
  id: string
  label: string
  icon: string
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  requiresConfirm: boolean
  action: (itemIds: string[]) => void | Promise<void>
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, item: any) => string | number | boolean
}