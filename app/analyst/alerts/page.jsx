'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus } from 'lucide-react'

export default function AnalystAlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'general', severity: 'medium', region: '', expiry: '' })

  async function load() {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(200)
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
    await supabase.from('alerts').insert({
      title: form.title,
      type: form.type,
      severity: form.severity,
      region: form.region,
      expiry: form.expiry ? new Date(form.expiry).toISOString() : null,
    })
    setOpen(false)
    setForm({ title: '', type: 'general', severity: 'medium', region: '', expiry: '' })
  }

  return (
    <div className="space-y-4">
      {/* Desktop form + table */}
      <div className="hidden lg:grid grid-cols-3 gap-4">
        <form onSubmit={createAlert} className="col-span-1 rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
          <div className="text-sm text-gray-300">Create Alert</div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm" required/>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm">
              <option value="general">General</option>
              <option value="cyclone">Cyclone</option>
              <option value="flood">Flood</option>
              <option value="erosion">Erosion</option>
              <option value="pollution">Pollution</option>
            </select>
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm" />
          <input type="datetime-local" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm" />
          <button className="w-full rounded-md bg-sky-600 hover:bg-sky-700 px-3 py-2 text-sm">Create Alert</button>
        </form>
        <div className="col-span-2 rounded-xl border border-gray-800 overflow-hidden">
          <table className="min-w-full bg-gray-900">
            <thead className="bg-gray-800 text-gray-300">
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
                <tr key={a.id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{a.title}</td>
                  <td className="px-4 py-2 capitalize">{a.type}</td>
                  <td className="px-4 py-2 capitalize">{a.severity}</td>
                  <td className="px-4 py-2">{a.region || '-'}</td>
                  <td className="px-4 py-2">{a.expiry ? new Date(a.expiry).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: FAB + list */}
      <div className="lg:hidden space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-gray-400 capitalize">{a.type} • {a.severity}</div>
            <div className="text-xs text-gray-400">{a.region || '-'} • {a.expiry ? new Date(a.expiry).toLocaleString() : '-'}</div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed bottom-20 right-4 z-30 rounded-full bg-sky-600 p-4 shadow-xl">
        <Plus />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <form onSubmit={createAlert} className="absolute bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 p-4 space-y-3">
            <div className="text-sm text-gray-300">Create Alert</div>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm" required/>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm">
                <option value="general">General</option>
                <option value="cyclone">Cyclone</option>
                <option value="flood">Flood</option>
                <option value="erosion">Erosion</option>
                <option value="pollution">Pollution</option>
              </select>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="button" className="flex-1 rounded-md bg-gray-800 px-3 py-2" onClick={() => setOpen(false)}>Cancel</button>
              <button className="flex-1 rounded-md bg-sky-600 px-3 py-2">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}


