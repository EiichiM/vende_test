

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

export const formatDate = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  locale = 'es-ES'
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return 'Fecha inválida'
  }
}

export const formatNumber = (
  number: number,
  options: Intl.NumberFormatOptions = {},
  locale = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(number)
  } catch {
    return number.toString()
  }
}

// Debounce utility with proper cleanup
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay) as unknown as number
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      cloned[key as keyof T] = deepClone((obj as any)[key])
    })
    return cloned
  }
  
  return obj
}

// String utilities
export const capitalize = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncate = (str: string, length: number, suffix = '...'): string => {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + suffix
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Array utilities
export const groupBy = <T, K extends keyof any>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item)
    const group = groups[key] || []
    group.push(item)
    groups[key] = group
    return groups
  }, {} as Record<K, T[]>)
}

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email)
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// Performance utilities
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Storage utilities with error handling
export const localStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },
  
  set: (key: string, value: any): boolean => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key: string): boolean => {
    try {
      window.localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  
  clear: (): boolean => {
    try {
      window.localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

// Error handling utilities
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error, ...args: Parameters<T>) => void
): T => {
  return ((...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      return fn(...args)
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error, ...args)
      } else {
        console.error('Unhandled error:', error)
      }
      return undefined
    }
  }) as T
}

// Async utilities
export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError!
}

export const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    })
  ])
}