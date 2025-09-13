'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Calendar, User } from 'lucide-react'

export default function ResolvedReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvedReports, setResolvedReports] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    fetch('/api/reports?status=resolved', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load resolved reports')
        const json = await res.json()
        return json.reports || []
      })
      .then((reports) => {
        if (isMounted) setResolvedReports(reports)
      })
      .catch((e) => {
        if (isMounted) setError(e.message || 'Error loading resolved reports')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    
    return () => { isMounted = false }
  }, [])

  const filteredReports = resolvedReports.filter(report => 
    (report.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (report.type || '').toLowerCase().includes(query.toLowerCase()) ||
    (report.description || '').toLowerCase().includes(query.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Resolved Reports</h1>
            <p className="text-sm text-gray-600 mt-1">Reports that have been successfully resolved</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{resolvedReports.length}</div>
            <div className="text-xs text-gray-500">Total Resolved</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <input 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search resolved reports..." 
          className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <div className="text-sm text-gray-700">Loading resolved reports...</div>
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
                {query ? 'No resolved reports match your search.' : 'No reports have been resolved yet.'}
              </div>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Report Info */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {report.title}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        Report ID: {report.id} • 
                        Type: {report.type || 'Unknown'} • 
                        Created: {formatDate(report.created_at)}
                      </div>
                    </div>

                    {/* Description */}
                    {report.description && (
                      <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {report.description}
                      </div>
                    )}

                    {/* Location */}
                    {report.latitude && report.longitude && (
                      <div className="text-xs text-gray-500 mb-2">
                        Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-700">Resolved</span>
                      <span className="text-xs text-gray-500">
                        • Resolved on: {formatDate(report.updated_at || report.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} />
                      Resolved
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
