'use client'
import { useEffect, useMemo, useState } from 'react'
import ReportCard from '@/components/official/ReportCard'
import dynamic from 'next/dynamic'

const MapWidget = dynamic(() => import('@/components/MapWidget'), { ssr: false })

export default function OfficialReportsPage() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState('table') // table | map (placeholder)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState([])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch('/api/reports', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load reports')
        const json = await res.json()
        return json.reports || []
      })
      .then((reports) => {
        if (isMounted) setData(reports)
      })
      .catch((e) => {
        if (isMounted) setError(e.message || 'Error loading reports')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  const filtered = useMemo(() => data.filter(r => (r.title||'').toLowerCase().includes(query.toLowerCase())), [data, query])
  const markers = useMemo(() => filtered
    .filter(r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
    .map(r => ({
      id: r.id,
      position: [r.latitude, r.longitude],
      title: r.title,
      description: r.description || '',
    })), [filtered])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-3 flex flex-col sm:flex-row gap-2 sm:items-center">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm"/>
        <div className="flex gap-2">
          <button onClick={()=>setView('table')} className={`rounded-md px-3 py-2 text-sm ${view==='table'?'bg-sky-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Table</button>
          <button onClick={()=>setView('map')} className={`rounded-md px-3 py-2 text-sm ${view==='map'?'bg-sky-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Map</button>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">Loading reports…</div>
      )}
      {!!error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Desktop table */}
      {!loading && !error && view==='table' && (
        <div className="hidden lg:block rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">ID</th>
                <th className="text-left text-sm font-medium px-4 py-2">Title</th>
                <th className="text-left text-sm font-medium px-4 py-2">Type</th>
                <th className="text-left text-sm font-medium px-4 py-2">Status</th>
                <th className="text-left text-sm font-medium px-4 py-2">Date</th>
                <th className="text-right text-sm font-medium px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2 capitalize">{r.type}</td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                  <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="px-2 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 text-white">Resolve</button>
                      <button className="px-2 py-1 text-xs rounded-md bg-sky-600 hover:bg-sky-700 text-white">Forward</button>
                      <button className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200">Remark</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile list */}
      {!loading && !error && view==='table' && (
        <div className="lg:hidden space-y-3">
          {filtered.map(r => (
            <ReportCard key={r.id} report={r} onResolve={()=>{}} onForward={()=>{}} onRemark={()=>{}} />
          ))}
        </div>
      )}

      {/* Map placeholder */}
      {!loading && !error && view==='map' && (
        <div className="h[540px] rounded-xl border border-gray-200 overflow-hidden bg-white">
          <MapWidget markers={markers} />
        </div>
      )}
    </div>
  )
}


