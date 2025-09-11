'use client'
import { useEffect, useState } from 'react'

export default function OfficialLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch('/api/logs', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load logs')
        const json = await res.json()
        return json.logs || []
      })
      .then((list) => { if (isMounted) setLogs(list) })
      .catch((e) => { if (isMounted) setError(e.message || 'Error loading logs') })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">System Logs</div>
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">Loading…</div>
      )}
      {!!error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {!loading && !error && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">Time</th>
                <th className="text-left text-sm font-medium px-4 py-2">Level</th>
                <th className="text-left text-sm font-medium px-4 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{l.level}</td>
                  <td className="px-4 py-2">{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


