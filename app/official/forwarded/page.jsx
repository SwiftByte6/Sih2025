'use client'
import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, User, Send } from 'lucide-react'

export default function ForwardedReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forwardedReports, setForwardedReports] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, acknowledged, in_progress, completed, rejected

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    fetch('/api/reports?status=forwarded', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load forwarded reports')
        const json = await res.json()
        return json.reports || []
      })
      .then((reports) => {
        if (isMounted) setForwardedReports(reports)
      })
      .catch((e) => {
        if (isMounted) setError(e.message || 'Error loading forwarded reports')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    
    return () => { isMounted = false }
  }, [])

  const filteredReports = forwardedReports.filter(report => 
    filter === 'all' || report.status === filter
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'forwarded':
        return <Send size={16} className="text-blue-600" />
      default:
        return <Clock size={16} className="text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'forwarded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Forwarded Reports History</h1>
            <p className="text-sm text-gray-600 mt-1">Track the status of reports you have forwarded to other authorities</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sky-600">{forwardedReports.length}</div>
            <div className="text-xs text-gray-500">Total Forwarded</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Forwarded' },
            { key: 'forwarded', label: 'Forwarded' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                filter === key
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="text-sm text-gray-700">Loading forwarded reports...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Reports List */}
      {!loading && !error && (
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <div className="text-gray-500">
                {filter === 'all' 
                  ? 'No reports have been forwarded yet.'
                  : `No ${filter} forwarded reports found.`
                }
              </div>
            </div>
          ) : (
            filteredReports.map((forwardedReport) => (
              <div key={forwardedReport.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Report Info */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {forwardedReport.title || 'Unknown Report'}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        Report ID: {forwardedReport.id} • 
                        Type: {forwardedReport.type || 'Unknown'} • 
                        Created: {formatDate(forwardedReport.created_at)}
                      </div>
                    </div>

                    {/* Description */}
                    {forwardedReport.description && (
                      <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {forwardedReport.description}
                      </div>
                    )}

                    {/* Forwarding Details */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">
                        Forwarded on: {formatDate(forwardedReport.updated_at || forwardedReport.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(forwardedReport.status)}`}>
                      {getStatusIcon(forwardedReport.status)}
                      {forwardedReport.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

