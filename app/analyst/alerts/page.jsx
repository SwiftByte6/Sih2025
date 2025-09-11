'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function AnalystAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'general', severity: 'medium', region: '', expiry: '' })
  const { toast } = useToast()

  async function load() {
    const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(200)
    if (error) {
      toast({ title: 'Failed to load alerts', description: error.message, variant: 'error' })
    }
    setAlerts(data || [])
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function createAlert(e) {
    e.preventDefault()
    const { error } = await supabase.from('alerts').insert({
      title: form.title,
      type: form.type,
      severity: form.severity,
      region: form.region,
      expiry: form.expiry ? new Date(form.expiry).toISOString() : null,
    })
    if (error) {
      toast({ title: 'Alert creation failed', description: error.message, variant: 'error' })
      return
    }
    toast({ title: 'Alert created', variant: 'success' })
    setOpen(false)
    setForm({ title: '', type: 'general', severity: 'medium', region: '', expiry: '' })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm bg-gradient-to-r from-white to-surface">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-foreground/70 mt-1">Create and manage public safety alerts.</p>
      </div>
      {/* Desktop form + table */}
      <div className="hidden lg:grid grid-cols-3 gap-4">
        <form onSubmit={createAlert} className="col-span-1 rounded-xl border border-border bg-white p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-foreground/80">Create Alert</div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" required/>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
              <option value="general">General</option>
              <option value="cyclone">Cyclone</option>
              <option value="flood">Flood</option>
              <option value="erosion">Erosion</option>
              <option value="pollution">Pollution</option>
            </select>
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <input type="datetime-local" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <button className="w-full rounded-md bg-brand hover:bg-brand/90 px-3 py-2 text-sm">Create Alert</button>
        </form>
        <div className="col-span-2 rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-surface text-foreground/80">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">Title</th>
                <th className="text-left text-sm font-medium px-4 py-2">Type</th>
                <th className="text-left text-sm font-medium px-4 py-2">Severity</th>
                <th className="text-left text-sm font-medium px-4 py-2">Region</th>
                <th className="text-left text-sm font-medium px-4 py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-2 text-foreground">{a.title}</td>
                  <td className="px-4 py-2 capitalize text-foreground/80">{a.type}</td>
                  <td className="px-4 py-2 capitalize text-foreground/80">{a.severity}</td>
                  <td className="px-4 py-2 text-foreground/80">{a.region || '-'}</td>
                  <td className="px-4 py-2 text-foreground/80">{a.expiry ? new Date(a.expiry).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: FAB + list */}
      <div className="lg:hidden space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-white p-3">
            <div className="font-medium text-foreground">{a.title}</div>
            <div className="text-xs text-foreground/70 capitalize">{a.type} • {a.severity}</div>
            <div className="text-xs text-foreground/70">{a.region || '-'} • {a.expiry ? new Date(a.expiry).toLocaleString() : '-'}</div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed bottom-20 right-4 z-30 rounded-full bg-brand p-4 shadow-xl">
        <Plus />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <form onSubmit={createAlert} className="absolute bottom-0 inset-x-0 bg-white border-t border-border p-4 space-y-3">
            <div className="text-sm text-foreground/80">Create Alert</div>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm" required/>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="bg-white border border-border rounded-md px-3 py-2 text-sm">
                <option value="general">General</option>
                <option value="cyclone">Cyclone</option>
                <option value="flood">Flood</option>
                <option value="erosion">Erosion</option>
                <option value="pollution">Pollution</option>
              </select>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="bg-white border border-border rounded-md px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="button" className="flex-1 rounded-md bg-surface px-3 py-2 border border-border" onClick={() => setOpen(false)}>Cancel</button>
              <button className="flex-1 rounded-md bg-brand px-3 py-2">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}


