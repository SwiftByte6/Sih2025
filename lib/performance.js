// Performance monitoring utilities for login flow

export function measurePerformance(name, fn) {
  return async (...args) => {
    const startTime = performance.now()
    try {
      const result = await fn(...args)
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
      }
      
      // Log slow operations in production
      if (duration > 1000) {
        console.warn(`🐌 Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }
}

export function createPerformanceTimer(name) {
  const startTime = performance.now()
  
  return {
    end: () => {
      const duration = performance.now() - startTime
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
      }
      return duration
    }
  }
}
