'use client'
import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Activity, 
  BarChart3, 
  RefreshCw,
  Download,
  Filter,
  Bell,
  Target,
  Clock,
  Users,
  Shield,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'

// Analytics Card Component
const AnalyticsCard = ({ title, value, icon: Icon, trend, color = 'blue', subtitle, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm flex items-center mt-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% from last period
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

// Insight Card Component
const InsightCard = ({ insight, onDismiss }) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-orange-200 bg-orange-50',
    low: 'border-blue-200 bg-blue-50'
  }

  const priorityIcons = {
    high: AlertTriangle,
    medium: Bell,
    low: Target
  }

  const Icon = priorityIcons[insight.priority] || Target

  return (
    <div className={`border rounded-lg p-4 ${priorityColors[insight.priority]} relative`}>
      {onDismiss && (
        <button
          onClick={() => onDismiss(insight.id)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${
          insight.priority === 'high' ? 'text-red-600' : 
          insight.priority === 'medium' ? 'text-orange-600' : 'text-blue-600'
        }`} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
          <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
          {insight.recommendation && (
            <p className="text-xs text-gray-600 mt-2 italic">
              <strong>Recommendation:</strong> {insight.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Analytics Dashboard Component
export default function AnalyticsDashboard({ 
  analytics, 
  loading, 
  error, 
  onRefresh, 
  onExport,
  showFilters = true,
  showControls = true,
  compact = false,
  onInsightDismiss
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [dismissedInsights, setDismissedInsights] = useState(new Set())

  const pieColors = ['#93C5FD', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return

    const interval = setInterval(() => {
      onRefresh()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  // Handle insight dismissal
  const handleInsightDismiss = (insightId) => {
    setDismissedInsights(prev => new Set([...prev, insightId]))
    if (onInsightDismiss) {
      onInsightDismiss(insightId)
    }
  }

  // Filter out dismissed insights
  const visibleInsights = analytics?.reports?.insights?.filter(
    insight => !dismissedInsights.has(insight.id)
  ) || []

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">Error loading analytics: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  const reportData = analytics.reports
  const socialData = analytics.social

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Automated insights and comprehensive analytics</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {!compact && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'insights', label: 'AI Insights', icon: Zap },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'performance', label: 'Performance', icon: Activity }
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
      )}

      {/* Overview Tab */}
      {(activeTab === 'overview' || compact) && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className={`grid gap-6 ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            <AnalyticsCard
              title="Total Reports"
              value={reportData.summary.totalReports}
              icon={AlertTriangle}
              color="blue"
              subtitle={`${reportData.summary.recentReports} in last 24h`}
            />
            <AnalyticsCard
              title="Verified Reports"
              value={reportData.summary.verifiedReports}
              icon={Shield}
              color="green"
              subtitle={`${reportData.summary.verificationRate}% verification rate`}
            />
            <AnalyticsCard
              title="Risk Level"
              value={reportData.riskAssessment.level.toUpperCase()}
              icon={Target}
              color={reportData.riskAssessment.level === 'high' ? 'red' : 
                     reportData.riskAssessment.level === 'medium' ? 'orange' : 'green'}
              subtitle={`Score: ${reportData.riskAssessment.score}`}
            />
            <AnalyticsCard
              title="Social Activity"
              value={socialData?.totalPosts || 0}
              icon={Users}
              color="purple"
              subtitle={`${socialData?.trendingKeywords?.length || 0} trending topics`}
            />
          </div>

          {/* Charts Grid */}
          {!compact && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hazard Types Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Types Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie 
                        data={Object.entries(reportData.hazardTypes).map(([name, value]) => ({ name, value }))} 
                        dataKey="value" 
                        nameKey="name" 
                        outerRadius={80} 
                        innerRadius={40} 
                        paddingAngle={2}
                      >
                        {Object.entries(reportData.hazardTypes).map((_, idx) => (
                          <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reports Over Time */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.timeTrends.last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Geographic Distribution */}
          {!compact && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.geoDistribution.regions).map(([region, count]) => (
                  <div key={region} className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{region}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Insights Tab */}
      {!compact && activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Automated Insights
            </h3>
            <div className="space-y-4">
              {visibleInsights.length > 0 ? (
                visibleInsights.map((insight, index) => (
                  <InsightCard 
                    key={insight.id || index} 
                    insight={insight} 
                    onDismiss={onInsightDismiss ? handleInsightDismiss : null}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active insights at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {!compact && activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Social Media Trends */}
            {socialData && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Trends</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Trending Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {socialData.trendingKeywords.slice(0, 8).map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {keyword.keyword} ({keyword.count})
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sentiment Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(socialData.sentimentDistribution).map(([sentiment, count]) => (
                        <div key={sentiment} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">{sentiment}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(count / socialData.totalPosts) * 100}%` }}
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
            )}

            {/* Performance Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Average Response Time</span>
                  <span className="text-lg font-bold text-gray-900">{reportData.performance.avgResponseTime}h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Verification Rate</span>
                  <span className="text-lg font-bold text-gray-900">{reportData.performance.verificationRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Data Quality Score</span>
                  <span className="text-lg font-bold text-gray-900">{reportData.performance.dataQuality}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {!compact && activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <span className="text-sm font-medium text-gray-900">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Freshness</span>
                  <span className="text-sm font-medium text-gray-900">2 min ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <span className="text-sm font-medium text-gray-900">120ms</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Complete Reports</span>
                  <span className="text-sm font-medium text-gray-900">{reportData.performance.dataQuality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Geotagged Reports</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((reportData.geoDistribution.totalWithLocation / reportData.summary.totalReports) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Media Attachments</span>
                  <span className="text-sm font-medium text-gray-900">78%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto Refresh</span>
                  <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Insight Generation</span>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Assessment</span>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
