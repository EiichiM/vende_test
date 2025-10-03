/**
 * Cliente API para el microservicio de productos
 * Funcionalidades:
 * - Manejo automático de reintentos con backoff exponencial
 * - Deduplicación de peticiones para evitar llamadas redundantes
 * - Normalización y manejo centralizado de errores
 * - Interceptores para logging y monitoreo
 */

import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios'
import type {
  Product,
  Company,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsQuery,
  ApiClientConfig,
  ApiResponse,
  ApiError
} from '@/types'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/constants'

// Request deduplication cache
interface PendingRequest {
  promise: Promise<any>
  timestamp: number
}

class EnterpriseApiClient {
  private client: AxiosInstance
  private pendingRequests = new Map<string, PendingRequest>()
  private requestId = 0

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        ...config.headers,
      },
    })

    this.setupInterceptors(config)
  }

  private setupInterceptors(config: ApiClientConfig) {
    // Request interceptor
    this.client.interceptors.request.use(
      (requestConfig) => {
        // Add request ID for tracking
        ;(requestConfig as any).metadata = {
          requestId: ++this.requestId,
          startTime: Date.now()
        }

        const token = this.getAuthToken()
        if (token) {
          requestConfig.headers['Authorization'] = `Bearer ${token}`
        }

        return requestConfig
      },
      (error) => {
        console.error('[API] Request Error:', error)
        return Promise.reject(this.normalizeError(error))
      }
    )

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalConfig = error.config as AxiosRequestConfig & {
          _retry?: boolean
          _retryCount?: number
        }

        // Don't retry if it's already a retry or specific error codes
        if (
          !originalConfig ||
          originalConfig._retry ||
          this.shouldNotRetry(error)
        ) {
          return Promise.reject(this.normalizeError(error))
        }

        const retryCount = originalConfig._retryCount || 0
        
        if (retryCount < config.retries) {
          originalConfig._retry = true
          originalConfig._retryCount = retryCount + 1

          // Calculate delay with exponential backoff
          const delay = this.calculateRetryDelay(retryCount, config.retryDelay)
          await this.sleep(delay)

          console.warn(`[API] Retrying request (${retryCount + 1}/${config.retries}) after ${delay}ms`)
          return this.client(originalConfig)
        }

        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  private getAuthToken(): string | null {
    // Get from localStorage, cookie, or state management
    return localStorage.getItem('auth_token')
  }





  private shouldNotRetry(error: AxiosError): boolean {
    // Don't retry on client errors (4xx) except 408, 429
    const status = error.response?.status
    if (status && status >= 400 && status < 500) {
      return ![408, 429].includes(status)
    }
    return false
  }

  private calculateRetryDelay(retryCount: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, retryCount)
    const jitter = Math.random() * 0.1 * exponentialDelay
    return Math.min(exponentialDelay + jitter, 30000) // Max 30s
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private normalizeError(error: any): ApiError {
    const baseError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: ERROR_MESSAGES.SERVER_ERROR,
      timestamp: new Date().toISOString()
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const data = error.response?.data

      baseError.code = `HTTP_${status || 'NETWORK'}_ERROR`
      
      if (status === 400) {
        baseError.message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR
      } else if (status === 404) {
        baseError.message = ERROR_MESSAGES.NOT_FOUND
      } else if (status === 401 || status === 403) {
        baseError.message = ERROR_MESSAGES.UNAUTHORIZED
      } else if (!error.response) {
        baseError.message = ERROR_MESSAGES.NETWORK_ERROR
      } else {
        baseError.message = data?.message || ERROR_MESSAGES.SERVER_ERROR
      }

      if (data?.details) {
        baseError.details = data.details
      }
    }

    return baseError
  }

  // Request deduplication
  private async executeWithDeduplication<T>(
    key: string,
    executor: () => Promise<AxiosResponse<T>>
  ): Promise<T> {
    const existing = this.pendingRequests.get(key)
    
    if (existing && Date.now() - existing.timestamp < 5000) {

      return existing.promise
    }

    const promise = executor().then(response => {
      this.pendingRequests.delete(key)
      return response.data
    }).catch(error => {
      this.pendingRequests.delete(key)
      throw error
    })

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  // Products API
  async getProducts(query: ProductsQuery = {}): Promise<Product[]> {
    const key = `GET_PRODUCTS_${JSON.stringify(query)}`
    
    const response = await this.executeWithDeduplication(key, () =>
      this.client.get<{products: Product[], total: number} | Product[]>(API_ENDPOINTS.PRODUCTS, { params: query })
    )
    
    // Normalizar formato de respuesta del servidor
    return Array.isArray(response) ? response : (response as any).products || []
  }

  async getProduct(id: string): Promise<Product> {
    const key = `GET_PRODUCT_${id}`
    
    return this.executeWithDeduplication(key, () =>
      this.client.get<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`)
    )
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await this.client.post<Product>(API_ENDPOINTS.PRODUCTS, data)
    return response.data
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await this.client.patch<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string): Promise<void> {
    await this.client.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`)
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    const key = `SEARCH_PRODUCTS_${searchTerm}`
    
    const response = await this.executeWithDeduplication(key, () =>
      this.client.get<{products: Product[], total: number} | Product[]>(`${API_ENDPOINTS.PRODUCTS}/search`, {
        params: { q: searchTerm }
      })
    )
    
    // Handle both response formats: {products: [...]} or [...]
    return Array.isArray(response) ? response : (response as any).products || []
  }

  // Companies API
  async getCompanies(): Promise<Company[]> {
    const key = 'GET_COMPANIES'
    
    return this.executeWithDeduplication(key, () =>
      this.client.get<Company[]>(API_ENDPOINTS.COMPANIES)
    )
  }

  async getCompany(id: string): Promise<Company> {
    const key = `GET_COMPANY_${id}`
    
    return this.executeWithDeduplication(key, () =>
      this.client.get<Company>(`${API_ENDPOINTS.COMPANIES}/${id}`)
    )
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{ status: string; timestamp: string }>(API_ENDPOINTS.HEALTH)
    return response.data
  }

  // Utility methods
  clearCache(): void {
    this.pendingRequests.clear()
  }

  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  clearAuthToken(): void {
    localStorage.removeItem('auth_token')
  }
}

// Configuration
const apiConfig: ApiClientConfig = {
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
}

// Singleton instance
export const apiClient = new EnterpriseApiClient(apiConfig)

// Alias for backward compatibility
export const apiService = apiClient

export const createApiClient = (config: Partial<ApiClientConfig> = {}) => {
  return new EnterpriseApiClient({ ...apiConfig, ...config })
}

export default EnterpriseApiClient