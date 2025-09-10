
'use client'
import { useEffect, useState } from 'react'
import NoticeForm from '@/components/official/NoticeForm'

export default function OfficialNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch('/api/notices', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load notices')
        const json = await res.json()
        return json.notices || []
      })
      .then((list) => { if (isMounted) setNotices(list) })
      .catch((e) => { if (isMounted) setError(e.message || 'Error loading notices') })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  async function addNotice(n) {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(n),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data?.error || 'Failed to create notice')
      return
    }
    const data = await res.json()
    setNotices(prev => [data.notice, ...prev])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <NoticeForm onSubmit={addNotice} />
      </div>
      <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
        <div className="text-sm text-gray-300">Previous Notices</div>
        {loading && (
          <div className="text-sm text-gray-400">Loading…</div>
        )}
        {!!error && (
          <div className="text-sm text-red-300">{error}</div>
        )}
        {!loading && !error && notices.map(n => (
          <div key={n.id} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{n.title}</div>
              <div className="text-xs text-gray-400">{n.expiry ? new Date(n.expiry).toLocaleString() : 'No expiry'}</div>
            </div>
            <div className="text-sm text-gray-300 mt-1">{n.content}</div>
            <div className="text-xs text-gray-400 mt-1">Region: {n.region || 'All'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


