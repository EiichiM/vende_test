/**
 * Error Reporting Service
 * Servicio para reportar errores a diferentes destinos (consola, servidor, servicios externos)
 */

export interface ErrorReport {
  id: string
  timestamp: string
  error: {
    message: string
    stack?: string
    type: string
  }
  context: {
    url: string
    userAgent: string
    userId?: string
    sessionId: string
  }
  user?: {
    description?: string
    email?: string
    steps?: string[]
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'ui' | 'api' | 'network' | 'validation' | 'unknown'
}

export interface ErrorReportingConfig {
  enabled: boolean
  endpoint?: string
  apiKey?: string
  includeTechnicalDetails: boolean
  includeUserAgent: boolean
  autoReport: boolean
}

class ErrorReportingService {
  private config: ErrorReportingConfig = {
    enabled: true,
    includeTechnicalDetails: true,
    includeUserAgent: true,
    autoReport: false
  }

  private sessionId: string = this.generateSessionId()

  constructor(config?: Partial<ErrorReportingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Genera un ID único para la sesión
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Genera un ID único para el reporte
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Categoriza el tipo de error automáticamente
   */
  private categorizeError(error: Error): ErrorReport['category'] {
    const message = error.message?.toLowerCase() || ''
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network'
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation'
    }
    if (message.includes('api') || message.includes('server') || message.includes('http')) {
      return 'api'
    }
    if (message.includes('render') || message.includes('component') || message.includes('ui')) {
      return 'ui'
    }
    
    return 'unknown'
  }

  /**
   * Determina la severidad del error automáticamente
   */
  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message?.toLowerCase() || ''
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical'
    }
    if (message.includes('server') || message.includes('network')) {
      return 'high'
    }
    if (message.includes('validation') || message.includes('ui')) {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Crea un reporte de error completo
   */
  private createErrorReport(
    error: Error, 
    userInput?: {
      description?: string
      email?: string
      steps?: string[]
    }
  ): ErrorReport {
    return {
      id: this.generateReportId(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: this.config.includeTechnicalDetails ? error.stack : undefined,
        type: error.name || 'Error'
      },
      context: {
        url: window.location.href,
        userAgent: this.config.includeUserAgent ? navigator.userAgent : 'Hidden',
        sessionId: this.sessionId
      },
      user: userInput,
      severity: this.determineSeverity(error),
      category: this.categorizeError(error)
    }
  }

  /**
   * Envía el reporte al backend
   */
  private async sendToBackend(report: ErrorReport): Promise<boolean> {
    try {
      console.log('📤 Sending error report to backend:', report)
      
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Error report sent successfully:', result)
        return true
      } else {
        console.error('❌ Failed to send error report, status:', response.status)
        // Store locally as fallback
        this.storeReportLocally(report)
        return false
      }
    } catch (error) {
      console.error('❌ Network error sending report:', error)
      // Store locally as fallback
      this.storeReportLocally(report)
      return false
    }
  }

  /**
   * Almacena el reporte localmente como fallback
   */
  private storeReportLocally(report: ErrorReport): void {
    try {
      const key = 'error_reports'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(report)
      
      // Keep only last 10 reports
      if (existing.length > 10) {
        existing.splice(0, existing.length - 10)
      }
      
      localStorage.setItem(key, JSON.stringify(existing))
    } catch (error) {
      console.error('Failed to store error report locally:', error)
    }
  }

  /**
   * Envía el reporte a la consola del navegador
   */
  private logToConsole(report: ErrorReport): void {
    console.group(`🐛 Error Report: ${report.id}`)
    console.error('Error:', report.error)
    console.log('Context:', report.context)
    if (report.user) {
      console.log('User Input:', report.user)
    }
    console.log('Severity:', report.severity)
    console.log('Category:', report.category)
    console.groupEnd()
  }

  /**
   * Reporta un error de forma simple (automática)
   */
  async reportError(error: Error): Promise<string> {
    if (!this.config.enabled) {
      return 'reporting-disabled'
    }

    const report = this.createErrorReport(error)
    
    // Always log to console
    this.logToConsole(report)
    
    // Try to send to backend
    const success = await this.sendToBackend(report)
    
    return success ? report.id : 'failed-to-send'
  }

  /**
   * Reporta un error con input del usuario
   */
  async reportErrorWithUserInput(
    error: Error,
    userInput: {
      description?: string
      email?: string
      steps?: string[]
    }
  ): Promise<string> {
    if (!this.config.enabled) {
      return 'reporting-disabled'
    }

    const report = this.createErrorReport(error, userInput)
    
    // Log to console
    this.logToConsole(report)
    
    // Send to backend
    const success = await this.sendToBackend(report)
    
    return success ? report.id : 'failed-to-send'
  }

  /**
   * Obtiene reportes almacenados localmente
   */
  getLocalReports(): ErrorReport[] {
    try {
      const reports = localStorage.getItem('error_reports')
      return reports ? JSON.parse(reports) : []
    } catch {
      return []
    }
  }

  /**
   * Limpia reportes almacenados localmente
   */
  clearLocalReports(): void {
    localStorage.removeItem('error_reports')
  }

  /**
   * Actualiza la configuración del servicio
   */
  updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): ErrorReportingConfig {
    return { ...this.config }
  }
}

// Instancia singleton del servicio
export const errorReportingService = new ErrorReportingService({
  enabled: true,
  includeTechnicalDetails: true,
  includeUserAgent: true,
  autoReport: false
})

// Helper function para uso rápido
export const reportError = (error: Error) => errorReportingService.reportError(error)

export default errorReportingService