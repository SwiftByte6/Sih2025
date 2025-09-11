'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Filter, Search, X } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

function ReportRowActions({ report, onView, onVerify, onReject }) {
  return (
    <div className="flex gap-2 justify-end">
      <button className="px-4 py-1 text-md rounded-md border bg-[#FFD691]/70  hover:bg-yellow-300" onClick={() => onView(report)}>View</button>
      <button className="px-4 py-1 text-md rounded-md border bg-[#92FCBE]/70  hover:bg-emerald-300" onClick={() => onVerify(report)}>Verify</button>
      <button className="px-4 py-1 text-md rounded-md border bg-[#FD3D3D]/70  hover:bg-rose-300" onClick={() => onReject(report)}>Reject</button>
    </div>
  )
}

export default function AnalystReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ status: 'all', type: 'all', date: 'all' })
  const [drawerReport, setDrawerReport] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select('id,title,description,type,status,image_url,latitude,longitude,created_at')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) {
        toast({ title: 'Failed to load reports', description: error.message, variant: 'error' })
      }
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
    const { error } = await supabase.from('reports').update({ status }).eq('id', reportId)
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'error' })
    } else {
      toast({ title: `Marked ${status}`, variant: 'success' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm bg-gradient-to-r from-white to-surface">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-foreground/70 mt-1">Search, filter, and verify citizen reports.</p>
      </div>
      {/* Filters */}
      <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1 flex items-center gap-2">
            <Search size={16} className="text-foreground/60" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports..." className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"/>
          </div>
          <div className="flex gap-2 items-center text-sm">
            <Filter size={16} className="text-foreground/60" />
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="bg-white border border-border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="bg-white border border-border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30">
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
      <div className="hidden lg:block rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-surface text-foreground/80">
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
                <tr key={r.id} className="border-t border-border hover:bg-surface/60 transition-colors">
                <td className="px-4 py-2 text-foreground">{r.title ?? 'Untitled'}</td>
                <td className="px-4 py-2 capitalize text-foreground/80">{r.type ?? '-'}</td>
                <td className="px-4 py-2 capitalize text-foreground/80">{r.status}</td>
                <td className="px-4 py-2 text-foreground/80">{new Date(r.created_at).toLocaleString()}</td>
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
          <div key={r.id} className="rounded-xl border border-border bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-foreground">{r.title ?? 'Untitled'}</div>
                <div className="text-xs text-foreground/70 capitalize">{r.type ?? '-'} • {r.status}</div>
              </div>
              <button className="text-foreground/80 text-sm underline" onClick={() => setDrawerReport(r)}>Details</button>
            </div>
            {r.image_url && (
              <img src={r.image_url} alt="report" className="mt-2 rounded-md max-h-40 w-full object-cover" />
            )}
            <div className="mt-2 flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-md bg-emerald-600 text-white" onClick={() => updateStatus(r.id, 'verified')}>Verify</button>
              <button className="flex-1 px-3 py-2 rounded-md bg-rose-600 text-white" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* Right-side drawer */}
      {drawerReport && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerReport(null)} />
          <div className="absolute right-0 top-0 h-full w-full lg:w-[480px] bg-white border-l border-border p-4 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-foreground">Report Details</div>
              <button className="p-2 hover:bg-brand/10 rounded-md" onClick={() => setDrawerReport(null)}><X size={18} /></button>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <div><span className="text-foreground/60">Title: </span>{drawerReport.title ?? 'Untitled'}</div>
              <div className="capitalize"><span className="text-foreground/60">Type: </span>{drawerReport.type ?? '-'}</div>
              <div className="capitalize"><span className="text-foreground/60">Status: </span>{drawerReport.status}</div>
              <div><span className="text-foreground/60">Date: </span>{new Date(drawerReport.created_at).toLocaleString()}</div>
              <div>
                <div className="text-foreground/60">Description</div>
                <div className="mt-1 whitespace-pre-wrap">{drawerReport.description ?? '-'}</div>
              </div>
              {drawerReport.image_url && (
                <img src={drawerReport.image_url} alt="report" className="rounded-md w-full object-cover" />
              )}
              {typeof drawerReport.latitude === 'number' && typeof drawerReport.longitude === 'number' && (
                <iframe
                  title="map"
                  className="w-full h-56 rounded-md border border-border"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${drawerReport.longitude-0.02}%2C${drawerReport.latitude-0.02}%2C${drawerReport.longitude+0.02}%2C${drawerReport.latitude+0.02}&layer=mapnik&marker=${drawerReport.latitude}%2C${drawerReport.longitude}`}
                />
              )}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-3 py-2 rounded-md bg-emerald-600 text-white" onClick={() => updateStatus(drawerReport.id, 'verified')}>Verify</button>
                <button className="flex-1 px-3 py-2 rounded-md bg-rose-600 text-white" onClick={() => updateStatus(drawerReport.id, 'rejected')}>Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


