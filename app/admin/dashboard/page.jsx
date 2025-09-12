'use client'
import { useEffect, useState } from 'react'
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  Bell, 
  TrendingUp, 
  Shield, 
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Clock,
  MapPin,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Server,
  Globe,
  Smartphone,
  Monitor
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
const AnalyticsCard = ({ title, value, icon: Icon, trend, color = 'blue', subtitle, onClick, loading }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${colorClasses[color]}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`text-sm flex items-center mt-2 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

// System Status Component
const SystemStatus = ({ status, title, description }) => {
  const statusColors = {
    online: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    maintenance: 'text-blue-600 bg-blue-100'
  }

  const statusIcons = {
    online: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    maintenance: Clock
  }

  const Icon = statusIcons[status] || CheckCircle

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
      <div className={`p-2 rounded-full ${statusColors[status]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

// Recent Activity Component
const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      report: FileText,
      alert: AlertTriangle,
      user: Users,
      system: Settings
    }
    return icons[type] || Activity
  }

  const getActivityColor = (type) => {
    const colors = {
      report: 'text-blue-600',
      alert: 'text-red-600',
      user: 'text-green-600',
      system: 'text-purple-600'
    }
    return colors[type] || 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [systemAlerts, setSystemAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load analytics data
      const analyticsResponse = await fetch('/api/analytics?type=combined')
      const analyticsResult = await analyticsResponse.json()
      
      // Load system alerts
      const alertsResponse = await fetch('/api/alerts/system?action=list')
      const alertsResult = await alertsResponse.json()
      
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data)
      }
      
      if (alertsResult.success) {
        setSystemAlerts(alertsResult.data)
      }
      
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadDashboardData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Export dashboard data
  const exportData = () => {
    if (!analytics) return
    
    const dataStr = JSON.stringify({
      analytics,
      systemAlerts,
      timestamp: new Date().toISOString()
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Acknowledge alert
  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch('/api/alerts/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', alertId })
      })
      
      if (response.ok) {
        setDismissedAlerts(prev => new Set([...prev, alertId]))
        loadDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  // Mock recent activities
  const recentActivities = [
    {
      type: 'user',
      title: 'New user registration',
      description: 'John Doe registered as a citizen reporter',
      timestamp: '2 minutes ago'
    },
    {
      type: 'report',
      title: 'High priority report submitted',
      description: 'Tsunami warning report from Mumbai coast',
      timestamp: '5 minutes ago'
    },
    {
      type: 'alert',
      title: 'System alert generated',
      description: 'High risk level detected in Chennai region',
      timestamp: '8 minutes ago'
    },
    {
      type: 'system',
      title: 'Database backup completed',
      description: 'Daily backup successfully completed',
      timestamp: '1 hour ago'
    }
  ]

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <AnalyticsCard key={i} loading={true} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">Error loading dashboard: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  const reportData = analytics?.reports
  const socialData = analytics?.social

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive system overview and management</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          
          <button
            onClick={loadDashboardData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemStatus 
          status="online" 
          title="Database" 
          description="All systems operational" 
        />
        <SystemStatus 
          status="online" 
          title="API Services" 
          description="Response time: 120ms" 
        />
        <SystemStatus 
          status="warning" 
          title="Storage" 
          description="85% capacity used" 
        />
        <SystemStatus 
          status="online" 
          title="Analytics Engine" 
          description="Processing normally" 
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Users"
          value={reportData?.summary?.totalReports ? Math.floor(reportData.summary.totalReports * 1.5) : 0}
          icon={Users}
          color="blue"
          subtitle="Active users"
          trend={12}
        />
        <AnalyticsCard
          title="Total Reports"
          value={reportData?.summary?.totalReports || 0}
          icon={FileText}
          color="green"
          subtitle={`${reportData?.summary?.recentReports || 0} in last 24h`}
          trend={8}
        />
        <AnalyticsCard
          title="System Alerts"
          value={systemAlerts.filter(alert => alert.status === 'active').length}
          icon={Bell}
          color={systemAlerts.filter(alert => alert.status === 'active').length > 5 ? 'red' : 'orange'}
          subtitle="Active alerts"
          trend={-3}
        />
        <AnalyticsCard
          title="Risk Level"
          value={reportData?.riskAssessment?.level?.toUpperCase() || 'LOW'}
          icon={Target}
          color={reportData?.riskAssessment?.level === 'high' ? 'red' : 
                 reportData?.riskAssessment?.level === 'medium' ? 'orange' : 'green'}
          subtitle={`Score: ${reportData?.riskAssessment?.score || 0}`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Verification Rate"
          value={`${reportData?.summary?.verificationRate || 0}%`}
          icon={Shield}
          color="purple"
          subtitle="Report verification"
          trend={5}
        />
        <AnalyticsCard
          title="Social Activity"
          value={socialData?.totalPosts || 0}
          icon={Globe}
          color="indigo"
          subtitle="Social media posts"
          trend={15}
        />
        <AnalyticsCard
          title="Response Time"
          value={`${reportData?.performance?.avgResponseTime || 0}h`}
          icon={Clock}
          color="yellow"
          subtitle="Average response"
          trend={-2}
        />
        <AnalyticsCard
          title="Data Quality"
          value={`${reportData?.performance?.dataQuality || 0}%`}
          icon={Database}
          color="blue"
          subtitle="Data completeness"
          trend={3}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hazard Types Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Types Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie 
                  data={reportData?.hazardTypes ? Object.entries(reportData.hazardTypes).map(([name, value]) => ({ name, value })) : []} 
                  dataKey="value" 
                  nameKey="name" 
                  outerRadius={80} 
                  innerRadius={40} 
                  paddingAngle={2}
                >
                  {reportData?.hazardTypes ? Object.entries(reportData.hazardTypes).map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  )) : []}
                </Pie>
                <Tooltip />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports Over Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData?.timeTrends?.last7Days || []}>
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

      {/* System Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-500" />
            System Alerts
          </h3>
          <div className="space-y-3">
            {systemAlerts.filter(alert => alert.status === 'active' && !dismissedAlerts.has(alert.id)).slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                alert.severity === 'medium' ? 'border-orange-200 bg-orange-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="ml-3 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {systemAlerts.filter(alert => alert.status === 'active' && !dismissedAlerts.has(alert.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivities} />
      </div>

      {/* Geographic Distribution */}
      {reportData?.geoDistribution && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium text-gray-900">62%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disk Usage</span>
              <span className="text-sm font-medium text-gray-900">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network I/O</span>
              <span className="text-sm font-medium text-gray-900">1.2 MB/s</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium text-gray-900">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Registrations</span>
              <span className="text-sm font-medium text-gray-900">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mobile Users</span>
              <span className="text-sm font-medium text-gray-900">68%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Desktop Users</span>
              <span className="text-sm font-medium text-gray-900">32%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Complete Reports</span>
              <span className="text-sm font-medium text-gray-900">{reportData?.performance?.dataQuality || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Geotagged Reports</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData?.geoDistribution ? Math.round((reportData.geoDistribution.totalWithLocation / reportData.summary.totalReports) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Media Attachments</span>
              <span className="text-sm font-medium text-gray-900">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verified Reports</span>
              <span className="text-sm font-medium text-gray-900">{reportData?.summary?.verificationRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}