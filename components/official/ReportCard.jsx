'use client'
import { CheckCircle2, Send, MessageSquare } from 'lucide-react'

export default function ReportCard({ report, onResolve, onForward, onRemark }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{report.title}</div>
          <div className="text-xs text-gray-500 capitalize">{report.type} • {report.status}</div>
          <div className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md ${report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{report.status}</span>
      </div>
      <div className="text-sm text-gray-700 line-clamp-3">{report.description}</div>
      <div className="flex gap-2 pt-2">
        <button onClick={() => onResolve(report)} className="flex-1 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm inline-flex items-center justify-center gap-2 text-white"><CheckCircle2 size={16}/>Resolve</button>
        <button onClick={() => onForward(report)} className="flex-1 rounded-md bg-sky-600 hover:bg-sky-700 px-3 py-2 text-sm inline-flex items-center justify-center gap-2 text-white"><Send size={16}/>Forward</button>
        <button onClick={() => onRemark(report)} className="flex-1 rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm inline-flex items-center justify-center gap-2"><MessageSquare size={16}/>Remark</button>
      </div>
    </div>
  )
}


