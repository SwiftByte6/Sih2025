'use client'
import { useState } from 'react'
import { X, Send, AlertCircle } from 'lucide-react'

export default function ForwardModal({ isOpen, onClose, report, onForward }) {
  const [forwardedTo, setForwardedTo] = useState('')
  const [forwardingReason, setForwardingReason] = useState('')
  const [forwardingNotes, setForwardingNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!forwardedTo.trim()) {
      setError('Please specify who to forward this report to')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/reports/forward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: report.id,
          forwardedTo: forwardedTo.trim(),
          forwardingReason: forwardingReason.trim() || null,
          forwardingNotes: forwardingNotes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to forward report')
      }

      // Call the parent callback
      onForward(report.id)
      
      // Reset form and close modal
      setForwardedTo('')
      setForwardingReason('')
      setForwardingNotes('')
      onClose()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setForwardedTo('')
      setForwardingReason('')
      setForwardingNotes('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Forward Report</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Report Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900">{report.title}</div>
            <div className="text-xs text-gray-500 capitalize mt-1">
              {report.type} • {report.status}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(report.created_at).toLocaleString()}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Forward To */}
            <div>
              <label htmlFor="forwardedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Forward to <span className="text-red-500">*</span>
              </label>
              <input
                id="forwardedTo"
                type="text"
                value={forwardedTo}
                onChange={(e) => setForwardedTo(e.target.value)}
                placeholder="e.g., Coastal Authority, Emergency Services, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                disabled={loading}
                required
              />
            </div>

            {/* Forwarding Reason */}
            <div>
              <label htmlFor="forwardingReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for forwarding
              </label>
              <select
                id="forwardingReason"
                value={forwardingReason}
                onChange={(e) => setForwardingReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                disabled={loading}
              >
                <option value="">Select a reason</option>
                <option value="requires_higher_authority">Requires Higher Authority</option>
                <option value="outside_jurisdiction">Outside Our Jurisdiction</option>
                <option value="specialized_expertise">Requires Specialized Expertise</option>
                <option value="emergency_response">Emergency Response Needed</option>
                <option value="follow_up_required">Follow-up Action Required</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Forwarding Notes */}
            <div>
              <label htmlFor="forwardingNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional notes
              </label>
              <textarea
                id="forwardingNotes"
                value={forwardingNotes}
                onChange={(e) => setForwardingNotes(e.target.value)}
                placeholder="Any additional information or instructions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !forwardedTo.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Forwarding...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Forward Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
