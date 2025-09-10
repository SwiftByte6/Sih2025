'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Filter, Search, X } from 'lucide-react'

function ReportRowActions({ report, onView, onVerify, onReject }) {
  return (
    <div className="flex gap-2 justify-end">
      <button className="px-2 py-1 text-xs rounded-md bg-gray-800 hover:bg-gray-700" onClick={() => onView(report)}>View</button>
      <button className="px-2 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700" onClick={() => onVerify(report)}>Verify</button>
      <button className="px-2 py-1 text-xs rounded-md bg-rose-600 hover:bg-rose-700" onClick={() => onReject(report)}>Reject</button>
    </div>
  )
}

export default function AnalystReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ status: 'all', type: 'all', date: 'all' })
  const [drawerReport, setDrawerReport] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('reports')
        .select('id,title,description,type,status,image_url,latitude,longitude,created_at')
        .order('created_at', { ascending: false })
        .limit(200)
      if (!ignore) setReports(data || [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        load()
      })
      .subscribe()
    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    return (reports || []).filter(r => {
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || `${r.title ?? ''} ${r.description ?? ''}`.toLowerCase().includes(q)
      const matchesStatus = filters.status === 'all' || r.status === filters.status
      const matchesType = filters.type === 'all' || r.type === filters.type
      return matchesQuery && matchesStatus && matchesType
    })
  }, [reports, query, filters])

  async function updateStatus(reportId, status) {
    await supabase.from('reports').update({ status }).eq('id', reportId)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports..." className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm"/>
          </div>
          <div className="flex gap-2 items-center text-sm">
            <Filter size={16} className="text-gray-400" />
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="bg-gray-800/60 border border-gray-700 rounded-md px-2 py-2">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="bg-gray-800/60 border border-gray-700 rounded-md px-2 py-2">
              <option value="all">All Types</option>
              <option value="flood">Flood</option>
              <option value="cyclone">Cyclone</option>
              <option value="erosion">Erosion</option>
              <option value="pollution">Pollution</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-xl border border-gray-800 overflow-hidden">
        <table className="min-w-full bg-gray-900">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="text-left text-sm font-medium px-4 py-2">Title</th>
              <th className="text-left text-sm font-medium px-4 py-2">Type</th>
              <th className="text-left text-sm font-medium px-4 py-2">Status</th>
              <th className="text-left text-sm font-medium px-4 py-2">Date</th>
              <th className="text-right text-sm font-medium px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-800">
                <td className="px-4 py-2">{r.title ?? 'Untitled'}</td>
                <td className="px-4 py-2 capitalize">{r.type ?? '-'}</td>
                <td className="px-4 py-2 capitalize">{r.status}</td>
                <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <ReportRowActions
                    report={r}
                    onView={setDrawerReport}
                    onVerify={() => updateStatus(r.id, 'verified')}
                    onReject={() => updateStatus(r.id, 'rejected')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{r.title ?? 'Untitled'}</div>
                <div className="text-xs text-gray-400 capitalize">{r.type ?? '-'} • {r.status}</div>
              </div>
              <button className="text-gray-300 text-sm underline" onClick={() => setDrawerReport(r)}>Details</button>
            </div>
            {r.image_url && (
              <img src={r.image_url} alt="report" className="mt-2 rounded-md max-h-40 w-full object-cover" />
            )}
            <div className="mt-2 flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-md bg-emerald-600" onClick={() => updateStatus(r.id, 'verified')}>Verify</button>
              <button className="flex-1 px-3 py-2 rounded-md bg-rose-600" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* Right-side drawer */}
      {drawerReport && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerReport(null)} />
          <div className="absolute right-0 top-0 h-full w-full lg:w-[480px] bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Report Details</div>
              <button className="p-2 hover:bg-gray-800 rounded-md" onClick={() => setDrawerReport(null)}><X size={18} /></button>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <div><span className="text-gray-400">Title: </span>{drawerReport.title ?? 'Untitled'}</div>
              <div className="capitalize"><span className="text-gray-400">Type: </span>{drawerReport.type ?? '-'}</div>
              <div className="capitalize"><span className="text-gray-400">Status: </span>{drawerReport.status}</div>
              <div><span className="text-gray-400">Date: </span>{new Date(drawerReport.created_at).toLocaleString()}</div>
              <div>
                <div className="text-gray-400">Description</div>
                <div className="mt-1 whitespace-pre-wrap">{drawerReport.description ?? '-'}</div>
              </div>
              {drawerReport.image_url && (
                <img src={drawerReport.image_url} alt="report" className="rounded-md w-full object-cover" />
              )}
              {typeof drawerReport.latitude === 'number' && typeof drawerReport.longitude === 'number' && (
                <iframe
                  title="map"
                  className="w-full h-56 rounded-md border border-gray-800"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${drawerReport.longitude-0.02}%2C${drawerReport.latitude-0.02}%2C${drawerReport.longitude+0.02}%2C${drawerReport.latitude+0.02}&layer=mapnik&marker=${drawerReport.latitude}%2C${drawerReport.longitude}`}
                />
              )}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-3 py-2 rounded-md bg-emerald-600" onClick={() => updateStatus(drawerReport.id, 'verified')}>Verify</button>
                <button className="flex-1 px-3 py-2 rounded-md bg-rose-600" onClick={() => updateStatus(drawerReport.id, 'rejected')}>Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


