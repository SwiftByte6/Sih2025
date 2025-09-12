'use client'
import { useEffect, useState } from 'react'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'combined'
      })
      
      const response = await fetch(`/api/analytics?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalytics(result.data)
        setError('')
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  // Export analytics data
  const exportData = () => {
    if (!analytics) return
    
    const dataStr = JSON.stringify(analytics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle insight dismissal
  const handleInsightDismiss = (insightId) => {
    console.log('Insight dismissed:', insightId)
    // Here you could implement logic to mark insights as dismissed in the database
  }

  return (
    <AnalyticsDashboard
      analytics={analytics}
      loading={loading}
      error={error}
      onRefresh={loadAnalytics}
      onExport={exportData}
      showFilters={true}
      showControls={true}
      compact={false}
      onInsightDismiss={handleInsightDismiss}
    />
  )
}

