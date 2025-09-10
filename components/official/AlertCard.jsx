'use client'
import { Bell, Check } from 'lucide-react'

export default function AlertCard({ alert, onAck, onCirculate }) {
  const color = alert.severity === 'critical' ? 'text-red-300 bg-red-900/40' : alert.severity === 'high' ? 'text-orange-300 bg-orange-900/40' : alert.severity === 'medium' ? 'text-yellow-300 bg-yellow-900/40' : 'text-emerald-300 bg-emerald-900/40'
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold flex items-center gap-2"><Bell size={16}/>{alert.title}</div>
        <span className={`text-xs px-2 py-1 rounded-md capitalize ${color}`}>{alert.severity}</span>
      </div>
      <div className="text-xs text-gray-400">{alert.region || 'All regions'} • {alert.expiry ? new Date(alert.expiry).toLocaleString() : 'No expiry'}</div>
      <div className="flex gap-2 pt-2">
        <button onClick={() => onAck(alert)} className="flex-1 rounded-md bg-gray-800 hover:bg-gray-700 px-3 py-2 text-sm inline-flex items-center justify-center gap-2"><Check size={16}/>Acknowledge</button>
        <button onClick={() => onCirculate(alert)} className="flex-1 rounded-md bg-sky-600 hover:bg-sky-700 px-3 py-2 text-sm">Circulate Notice</button>
      </div>
    </div>
  )
}


