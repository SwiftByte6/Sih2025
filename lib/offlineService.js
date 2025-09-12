// Offline service for handling reports when connection is unavailable
class OfflineService {
  constructor() {
    this.dbName = 'CoastSafeOffline'
    this.version = 1
    this.db = null
    this.init()
  }

  async init() {
    if (typeof window === 'undefined') return // Skip on server side
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create reports store
        if (!db.objectStoreNames.contains('reports')) {
          const reportsStore = db.createObjectStore('reports', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          reportsStore.createIndex('timestamp', 'timestamp', { unique: false })
          reportsStore.createIndex('status', 'status', { unique: false })
        }
        
        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('type', 'type', { unique: false })
        }
      }
    })
  }

  // Store report offline
  async storeReportOffline(reportData) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reports'], 'readwrite')
      const store = transaction.objectStore('reports')
      
      const offlineReport = {
        ...reportData,
        timestamp: new Date().toISOString(),
        status: 'offline',
        synced: false
      }
      
      const request = store.add(offlineReport)
      
      request.onsuccess = () => {
        console.log('Report stored offline:', request.result)
        resolve(request.result)
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // Get all offline reports
  async getOfflineReports() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reports'], 'readonly')
      const store = transaction.objectStore('reports')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Sync offline reports when connection is restored
  async syncOfflineReports() {
    if (!this.db) await this.init()
    
    const offlineReports = await this.getOfflineReports()
    const unsyncedReports = offlineReports.filter(report => !report.synced)
    
    console.log(`Found ${unsyncedReports.length} unsynced reports`)
    
    for (const report of unsyncedReports) {
      try {
        // Import the upload function dynamically to avoid circular dependencies
        const { uploadMediaAndCreateReport } = await import('./reportService')
        
        await uploadMediaAndCreateReport({
          title: report.title,
          description: report.description,
          type: report.type,
          latitude: report.latitude,
          longitude: report.longitude,
          file: report.mediaFile // Note: File objects can't be stored in IndexedDB
        })
        
        // Mark as synced
        await this.markReportAsSynced(report.id)
        
        console.log(`Synced report: ${report.title}`)
      } catch (error) {
        console.error(`Failed to sync report ${report.id}:`, error)
        // Add to sync queue for retry
        await this.addToSyncQueue(report)
      }
    }
  }

  // Mark report as synced
  async markReportAsSynced(reportId) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reports'], 'readwrite')
      const store = transaction.objectStore('reports')
      const getRequest = store.get(reportId)
      
      getRequest.onsuccess = () => {
        const report = getRequest.result
        if (report) {
          report.synced = true
          report.syncedAt = new Date().toISOString()
          
          const putRequest = store.put(report)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Add report to sync queue for retry
  async addToSyncQueue(report) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const queueItem = {
        reportId: report.id,
        type: 'report',
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3
      }
      
      const request = store.add(queueItem)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Check if device is online
  isOnline() {
    return typeof navigator !== 'undefined' && navigator.onLine
  }

  // Get connection status
  getConnectionStatus() {
    return {
      online: this.isOnline(),
      timestamp: new Date().toISOString()
    }
  }

  // Clear old synced reports (cleanup)
  async clearOldSyncedReports(daysOld = 30) {
    if (!this.db) await this.init()
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reports'], 'readwrite')
      const store = transaction.objectStore('reports')
      const index = store.index('timestamp')
      const range = IDBKeyRange.upperBound(cutoffDate.toISOString())
      const request = index.openCursor(range)
      
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          const report = cursor.value
          if (report.synced) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }
}

// Create singleton instance
const offlineService = new OfflineService()

// Export functions for easy use
export const {
  storeReportOffline,
  getOfflineReports,
  syncOfflineReports,
  isOnline,
  getConnectionStatus,
  clearOldSyncedReports
} = offlineService

export default offlineService
