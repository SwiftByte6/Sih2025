'use client'
import ReportCard from '@/components/official/ReportCard'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

export default function OfficialDashboardClient({ summary, reports }) {
  const { toast } = useToast()

  const handleResolve = async (report) => {
    const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', report.id)
    if (error) {
      toast({ title: 'Failed to resolve', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Report marked resolved', variant: 'success' })
    }
  }

  const handleForward = async (report) => {
    // Optional: insert into report_forwards table if available
    toast({ title: 'Forwarded to department', variant: 'success' })
  }

  const handleRemark = async (report) => {
    // Optional: open modal; for now acknowledge
    toast({ title: 'Remark added', description: 'Feature coming soon', variant: 'success' })
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-3xl font-semibold">{summary.total.pending}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Verified</div>
          <div className="text-3xl font-semibold">{summary.total.verified}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Resolved</div>
          <div className="text-3xl font-semibold">{summary.total.resolved}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Reports this week</div>
          <div className="text-3xl font-semibold">{summary.engagement.weekReports}</div>
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="lg:hidden grid grid-cols-1 gap-3">
        <details className="rounded-xl border border-gray-200 bg-white p-3" open>
          <summary className="cursor-pointer text-sm text-gray-700">Reports Summary</summary>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div><div className="text-xs text-gray-500">Pending</div><div className="text-xl font-semibold">{summary.total.pending}</div></div>
            <div><div className="text-xs text-gray-500">Verified</div><div className="text-xl font-semibold">{summary.total.verified}</div></div>
            <div><div className="text-xs text-gray-500">Resolved</div><div className="text-xl font-semibold">{summary.total.resolved}</div></div>
          </div>
        </details>
        <details className="rounded-xl border border-gray-200 bg-white p-3">
          <summary className="cursor-pointer text-sm text-gray-700">Citizen Engagement</summary>
          <div className="mt-2 text-2xl font-semibold">{summary.engagement.weekReports}</div>
        </details>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button className="rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-3 text-sm font-medium text-white">Create Response Notice</button>
        <button className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-3 text-sm font-medium">Forward to Department</button>
        <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-medium text-white">Mark Resolved</button>
      </div>

      {/* Recent Reports */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-sm text-gray-700 mb-2">Recent Reports</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onResolve={handleResolve}
              onForward={handleForward}
              onRemark={handleRemark}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


