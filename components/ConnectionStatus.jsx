'use client'
import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Sync, CheckCircle, AlertCircle } from 'lucide-react'
import { syncOfflineReports, getOfflineReports } from '@/lib/offlineService'

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineReports, setOfflineReports] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    // Check initial online status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }
    
    checkOnlineStatus()
    
    // Load offline reports count
    loadOfflineReportsCount()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming back online
      handleSync()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineReportsCount = async () => {
    try {
      const reports = await getOfflineReports()
      const unsyncedCount = reports.filter(report => !report.synced).length
      setOfflineReports(unsyncedCount)
    } catch (error) {
      console.error('Failed to load offline reports count:', error)
    }
  }

  const handleSync = async () => {
    if (syncing || !isOnline) return
    
    setSyncing(true)
    try {
      await syncOfflineReports()
      setLastSync(new Date())
      await loadOfflineReportsCount() // Refresh count after sync
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600 bg-red-50 border-red-200'
    if (offlineReports > 0) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />
    if (offlineReports > 0) return <AlertCircle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (offlineReports > 0) return `${offlineReports} pending sync`
    return 'All synced'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg border text-sm font-medium flex items-center space-x-2 ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {isOnline && offlineReports > 0 && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
          title="Sync offline reports"
        >
          <Sync className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      )}
      
      {lastSync && (
        <span className="text-xs opacity-75">
          {new Date(lastSync).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
