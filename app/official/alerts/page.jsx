'use client'
import { useEffect, useMemo, useState } from 'react'
import AlertCard from '@/components/official/AlertCard'
import { useToast } from '@/components/ToastProvider'

export default function OfficialAlertsPage() {
  const [severity, setSeverity] = useState('all')
  const [region, setRegion] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch('/api/alerts', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load alerts')
        const json = await res.json()
        return json.alerts || []
      })
      .then((alerts) => { if (isMounted) setData(alerts) })
      .catch((e) => { if (isMounted) { setError(e.message || 'Error loading alerts'); toast({ title: 'Failed to load alerts', description: e.message, variant: 'error' }) } })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const filtered = useMemo(() => data.filter(a => (severity==='all' || a.severity===severity) && (!region || (a.region||'').toLowerCase().includes(region.toLowerCase()))), [data, severity, region])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-3 flex flex-col sm:flex-row gap-2 sm:items-center">
        <select value={severity} onChange={e=>setSeverity(e.target.value)} className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="Filter by region" className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm"/>
      </div>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">Loading alerts…</div>
      )}
      {!!error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(a => (
            <AlertCard key={a.id} alert={a} onAck={()=> toast({ title: 'Acknowledged', variant: 'success' })} onCirculate={()=> toast({ title: 'Notice circulation queued', variant: 'success' })} />
          ))}
        </div>
      )}
    </div>
  )
}


