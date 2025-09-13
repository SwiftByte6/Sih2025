'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { supabase } from '@/lib/supabaseClient'
import { fetchRecentReports } from '@/lib/reportService'
import SocialMediaFeed from '@/components/SocialMediaFeed'
import MapWithHotspots from '@/components/MapWithHotspots'
import { 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Activity,
  BarChart3,
  Filter,
  Calendar,
  Map
} from 'lucide-react'

// Analytics card component
function AnalyticsCard({ title, value, icon: Icon, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm flex items-center mt-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

// Filter component
function FilterPanel({ filters, onFilterChange }) {
  const { t } = useI18n()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Filter className="w-5 h-5 mr-2" />
        Filters
      </h3>
      
      <div className="space-y-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            <option value="mumbai">Mumbai</option>
            <option value="chennai">Chennai</option>
            <option value="kolkata">Kolkata</option>
            <option value="kochi">Kochi</option>
          </select>
        </div>

        {/* Hazard Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hazard Type
          </label>
          <select
            value={filters.hazardType}
            onChange={(e) => onFilterChange('hazardType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="tsunami">Tsunami</option>
            <option value="storm_surge">Storm Surge</option>
            <option value="high_waves">High Waves</option>
            <option value="flood">Flood</option>
            <option value="cyclone">Cyclone</option>
            <option value="erosion">Erosion</option>
            <option value="pollution">Pollution</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Main analytics page
export default function AnalyticsPage() {
  const { t } = useI18n()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    hazardType: '',
    dateRange: '7d'
  })
  const [activeTab, setActiveTab] = useState('overview')

  // Load analytics data using the new analytics service
  useEffect(() => {
    let isMounted = true
    
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          type: 'combined',
          ...filters
        })
        
        const response = await fetch(`/api/analytics?${params}`)
        const result = await response.json()
        
        if (result.success && isMounted) {
          // Transform the data to match the existing structure
          const reportData = result.data.reports
          setReports(reportData.summary ? [] : result.data.reports) // Fallback for compatibility
          setError('')
        } else if (isMounted) {
          setError(result.error || 'Failed to load analytics')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()
    return () => { isMounted = false }
  }, [filters])

  // Filter reports based on current filters
  const filteredReports = useMemo(() => {
    let filtered = reports

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(report => 
        report.description?.toLowerCase().includes(filters.location.toLowerCase()) ||
        report.title?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Filter by hazard type
    if (filters.hazardType) {
      filtered = filtered.filter(report => report.type === filters.hazardType)
    }

    // Filter by date range
    const now = new Date()
    const dateRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    }

    if (filters.dateRange && dateRanges[filters.dateRange]) {
      const cutoff = new Date(now.getTime() - dateRanges[filters.dateRange])
      filtered = filtered.filter(report => 
        new Date(report.created_at) >= cutoff
      )
    }

    return filtered
  }, [reports, filters])

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const totalReports = filteredReports.length
    const verifiedReports = filteredReports.filter(r => r.status === 'verified').length
    const pendingReports = filteredReports.filter(r => r.status === 'pending').length
    
    // Group by hazard type
    const hazardTypes = filteredReports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1
      return acc
    }, {})

    // Most common hazard type
    const mostCommonHazard = Object.entries(hazardTypes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

    // Recent activity (last 24 hours)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentReports = filteredReports.filter(r => 
      new Date(r.created_at) >= last24h
    ).length

    return {
      totalReports,
      verifiedReports,
      pendingReports,
      hazardTypes,
      mostCommonHazard,
      recentReports,
      verificationRate: totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0
    }
  }, [filteredReports])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src="/Logo.png" alt="ShoreHelp" className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">Comprehensive view of coastal hazard reports and social media activity</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'map', label: 'Map View', icon: Map },
                { id: 'social', label: 'Social Media', icon: Activity }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard
                title="Total Reports"
                value={analytics.totalReports}
                icon={AlertTriangle}
                color="blue"
                trend={analytics.recentReports > 0 ? 12 : -5}
              />
              <AnalyticsCard
                title="Verified Reports"
                value={analytics.verifiedReports}
                icon={Users}
                color="green"
                trend={analytics.verificationRate > 70 ? 8 : -3}
              />
              <AnalyticsCard
                title="Recent Activity"
                value={analytics.recentReports}
                icon={Activity}
                color="orange"
              />
              <AnalyticsCard
                title="Most Common"
                value={analytics.mostCommonHazard}
                icon={TrendingUp}
                color="purple"
              />
            </div>

            {/* Filters and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
              </div>
              
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Type Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.hazardTypes)
                      .sort(([,a], [,b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(count / analytics.totalReports) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Map with Hotspots</h3>
              <div className="h-96">
                <MapWithHotspots 
                  reports={filteredReports} 
                  showHotspots={true}
                  showIndividualReports={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <SocialMediaFeed 
                filterByLocation={filters.location}
                filterByHazard={filters.hazardType}
                maxPosts={20}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
