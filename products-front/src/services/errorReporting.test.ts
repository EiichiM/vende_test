import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { errorReportingService, ErrorReport } from '@/services/errorReporting'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
}
Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true,
})

describe('ErrorReportingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset service configuration
    errorReportingService.updateConfig({
      enabled: true,
      includeTechnicalDetails: true,
      includeUserAgent: true,
      autoReport: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Configuration', () => {
    it('has default configuration', () => {
      const config = errorReportingService.getConfig()
      
      expect(config.enabled).toBe(true)
      expect(config.includeTechnicalDetails).toBe(true)
      expect(config.includeUserAgent).toBe(true)
      expect(config.autoReport).toBe(false)
    })

    it('updates configuration correctly', () => {
      errorReportingService.updateConfig({
        enabled: false,
        autoReport: true,
      })

      const config = errorReportingService.getConfig()
      expect(config.enabled).toBe(false)
      expect(config.autoReport).toBe(true)
      expect(config.includeTechnicalDetails).toBe(true) // Unchanged
    })
  })

  describe('Error Categorization', () => {
    it('categorizes network errors correctly', async () => {
      const networkError = new Error('Network connection failed')
      const reportId = await errorReportingService.reportError(networkError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.group).toHaveBeenCalled()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Category:'),
        'network'
      )
    })

    it('categorizes validation errors correctly', async () => {
      const validationError = new Error('Validation failed: required field missing')
      const reportId = await errorReportingService.reportError(validationError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Category:'),
        'validation'
      )
    })

    it('categorizes API errors correctly', async () => {
      const apiError = new Error('API server returned 500 error')
      const reportId = await errorReportingService.reportError(apiError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Category:'),
        'api'
      )
    })

    it('categorizes UI errors correctly', async () => {
      const uiError = new Error('Component render error in UI')
      const reportId = await errorReportingService.reportError(uiError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Category:'),
        'ui'
      )
    })

    it('defaults to unknown category for unrecognized errors', async () => {
      const unknownError = new Error('Some random error')
      const reportId = await errorReportingService.reportError(unknownError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Category:'),
        'unknown'
      )
    })
  })

  describe('Severity Determination', () => {
    it('determines critical severity correctly', async () => {
      const criticalError = new Error('Critical system failure')
      const reportId = await errorReportingService.reportError(criticalError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Severity:'),
        'critical'
      )
    })

    it('determines high severity for server errors', async () => {
      const serverError = new Error('Server internal error')
      const reportId = await errorReportingService.reportError(serverError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Severity:'),
        'high'
      )
    })

    it('determines medium severity for validation errors', async () => {
      const validationError = new Error('Validation failed: Invalid user input')
      const reportId = await errorReportingService.reportError(validationError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        'Severity:',
        'medium'
      )
    })

    it('defaults to low severity for unknown errors', async () => {
      const unknownError = new Error('Some minor issue')
      const reportId = await errorReportingService.reportError(unknownError)
      
      expect(reportId).toBeDefined()
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Severity:'),
        'low'
      )
    })
  })

  describe('Backend Communication', () => {
    it('sends error report to backend successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      const reportId = await errorReportingService.reportError(error)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"message":"Test error"'),
      })
      
      expect(reportId).toBeDefined()
      expect(reportId).not.toBe('failed-to-send')
    })

    it('handles backend failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const error = new Error('Test error')
      const reportId = await errorReportingService.reportError(error)
      
      expect(mockFetch).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalled() // Falls back to local storage
      expect(reportId).toBe('failed-to-send')
    })

    it('handles network failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const error = new Error('Test error')
      const reportId = await errorReportingService.reportError(error)
      
      expect(mockFetch).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalled() // Falls back to local storage
      expect(reportId).toBe('failed-to-send')
    })
  })

  describe('Local Storage Fallback', () => {
    it('stores report locally when backend fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      mockLocalStorage.getItem.mockReturnValue('[]')

      const error = new Error('Test error')
      await errorReportingService.reportError(error)
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('error_reports')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'error_reports',
        expect.stringContaining('"message":"Test error"')
      )
    })

    it('maintains only last 10 reports in local storage', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      // Mock 10 existing reports
      const existingReports = Array(10).fill(null).map((_, i) => ({
        id: `report-${i}`,
        timestamp: new Date().toISOString(),
        error: { message: `Error ${i}` },
      }))
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingReports))

      const error = new Error('New error')
      await errorReportingService.reportError(error)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      const savedData = mockLocalStorage.setItem.mock.calls[0][1]
      const savedReports = JSON.parse(savedData)
      expect(savedReports).toHaveLength(10) // Should still be 10, oldest removed
    })

    it('retrieves local reports correctly', () => {
      const mockReports = [
        { id: 'report-1', error: { message: 'Error 1' } },
        { id: 'report-2', error: { message: 'Error 2' } },
      ]
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockReports))
      
      const reports = errorReportingService.getLocalReports()
      expect(reports).toEqual(mockReports)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('error_reports')
    })

    it('returns empty array when no local reports exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const reports = errorReportingService.getLocalReports()
      expect(reports).toEqual([])
    })

    it('clears local reports correctly', () => {
      errorReportingService.clearLocalReports()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('error_reports')
    })
  })

  describe('User Input Reports', () => {
    it('includes user input in report', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      const userInput = {
        description: 'I was trying to save a product',
        email: 'user@test.com',
        steps: ['Opened form', 'Filled data', 'Clicked save'],
      }

      const reportId = await errorReportingService.reportErrorWithUserInput(error, userInput)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"description":"I was trying to save a product"'),
      })
      
      expect(reportId).toBeDefined()
    })

    it('handles user input with partial data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      const userInput = {
        description: 'Partial description',
        // email and steps omitted
      }

      const reportId = await errorReportingService.reportErrorWithUserInput(error, userInput)
      
      expect(reportId).toBeDefined()
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('Configuration Options', () => {
    it('respects disabled configuration', async () => {
      errorReportingService.updateConfig({ enabled: false })

      const error = new Error('Test error')
      const reportId = await errorReportingService.reportError(error)
      
      expect(reportId).toBe('reporting-disabled')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('excludes technical details when configured', async () => {
      errorReportingService.updateConfig({ includeTechnicalDetails: false })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      error.stack = 'Error stack trace here'
      
      await errorReportingService.reportError(error)
      
      const requestBody = mockFetch.mock.calls[0][1].body
      const report = JSON.parse(requestBody)
      
      expect(report.error.stack).toBeUndefined()
    })

    it('excludes user agent when configured', async () => {
      errorReportingService.updateConfig({ includeUserAgent: false })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      await errorReportingService.reportError(error)
      
      const requestBody = mockFetch.mock.calls[0][1].body
      const report = JSON.parse(requestBody)
      
      expect(report.context.userAgent).toBe('Hidden')
    })
  })

  describe('Console Logging', () => {
    it('logs to console with proper structure', async () => {
      const error = new Error('Test error')
      await errorReportingService.reportError(error)
      
      expect(mockConsole.group).toHaveBeenCalledWith(
        expect.stringContaining('🐛 Error Report:')
      )
      expect(mockConsole.error).toHaveBeenCalledWith('Error:', expect.any(Object))
      expect(mockConsole.log).toHaveBeenCalledWith('Context:', expect.any(Object))
      expect(mockConsole.groupEnd).toHaveBeenCalled()
    })

    it('includes user input in console log when provided', async () => {
      const error = new Error('Test error')
      const userInput = {
        description: 'User description',
        email: 'test@example.com',
      }

      await errorReportingService.reportErrorWithUserInput(error, userInput)
      
      expect(mockConsole.log).toHaveBeenCalledWith('User Input:', userInput)
    })
  })

  describe('Report Structure', () => {
    it('generates valid report ID', async () => {
      // Mock successful fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      const reportId = await errorReportingService.reportError(error)
      
      expect(reportId).toMatch(/^report_\d+_[a-z0-9]+$/)
    })

    it('includes all required fields in report', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'backend-report-id' }),
      })

      const error = new Error('Test error')
      await errorReportingService.reportError(error)
      
      const requestBody = mockFetch.mock.calls[0][1].body
      const report = JSON.parse(requestBody)
      
      expect(report).toHaveProperty('id')
      expect(report).toHaveProperty('timestamp')
      expect(report).toHaveProperty('error')
      expect(report).toHaveProperty('context')
      expect(report).toHaveProperty('severity')
      expect(report).toHaveProperty('category')
      
      expect(report.error).toHaveProperty('message')
      expect(report.error).toHaveProperty('type')
      
      expect(report.context).toHaveProperty('url')
      expect(report.context).toHaveProperty('sessionId')
    })
  })
})