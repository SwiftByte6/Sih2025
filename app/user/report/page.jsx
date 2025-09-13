'use client'
import CitizenReportForm from '@/components/CitizenReportForm'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'
import { Edit, Trash2, Eye, Plus, X, MapPin, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'

const UserReportPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('create') // 'create', 'list', 'edit'
  const [editingReport, setEditingReport] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Loaded reports:', data?.length || 0, 'reports')
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (report) => {
    setEditingReport(report)
    setView('edit')
  }

  const handleDelete = async (reportId) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      setReports(prev => prev.filter(r => r.id !== reportId))
      setShowDeleteConfirm(null)
      toast({ title: 'Success', description: 'Report deleted successfully', variant: 'success' })
    } catch (error) {
      console.error('Error deleting report:', error)
      toast({ title: 'Error', description: 'Failed to delete report', variant: 'error' })
    }
  }

  const handleReportCreated = () => {
    setIsCreating(true)
    // Add a small delay to ensure database has updated
    setTimeout(() => {
      loadReports().then(() => {
        setIsCreating(false)
        setView('list')
        toast({ 
          title: 'Report Created!', 
          description: 'Your report has been successfully added to the list.', 
          variant: 'success' 
        })
      })
    }, 500) // 0.5 second delay
  }

  const handleReportUpdated = () => {
    loadReports()
    setView('list')
    setEditingReport(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'verified': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'verified': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Filter reports based on search and status
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.type?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src="/Logo.png" alt="ShoreHelp" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Management</h1>
          <p className="text-gray-600">Create, view, and manage your hazard reports</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'create' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Report
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            My Reports ({reports.length})
          </button>
        </div>

        {/* Create/Edit Report Form */}
        {(view === 'create' || view === 'edit') && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {view === 'create' ? 'Create New Report' : 'Edit Report'}
                </h2>
                <button
                  onClick={() => {
                    setView('list')
                    setEditingReport(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <CitizenReportForm 
                editingReport={editingReport}
                onReportCreated={handleReportCreated}
                onReportUpdated={handleReportUpdated}
              />
            </div>
          </div>
        )}

        {/* Reports List */}
        {view === 'list' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                onClick={loadReports}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading reports...</p>
              </div>
            ) : isCreating ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Adding your new report...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {reports.length === 0 ? 'No Reports Yet' : 'No Matching Reports'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {reports.length === 0 
                    ? 'Start by creating your first hazard report'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {reports.length === 0 && (
                  <button
                    onClick={() => setView('create')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Report
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="capitalize">{report.type}</span>
                          <span>•</span>
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-700 line-clamp-2">{report.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(report)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit report"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(report.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {report.image_url && (
                      <div className="mb-4">
                        <img 
                          src={report.image_url} 
                          alt="Report" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {report.latitude && report.longitude && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Report</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserReportPage
