'use client'
import ReportCard from '@/components/official/ReportCard'

export default function OfficialDashboardClient({ summary, reports }) {
  const handleResolve = (report) => {
    // TODO: Implement resolve logic (API call)
    console.log('Resolve', report.id)
  }

  const handleForward = (report) => {
    // TODO: Implement forward logic (API call)
    console.log('Forward', report.id)
  }

  const handleRemark = (report) => {
    // TODO: Implement remark logic (open modal / form)
    console.log('Remark', report.id)
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Pending</div>
          <div className="text-3xl font-semibold">{summary.total.pending}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Verified</div>
          <div className="text-3xl font-semibold">{summary.total.verified}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Resolved</div>
          <div className="text-3xl font-semibold">{summary.total.resolved}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Reports this week</div>
          <div className="text-3xl font-semibold">{summary.engagement.weekReports}</div>
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="lg:hidden grid grid-cols-1 gap-3">
        <details className="rounded-xl border border-gray-800 bg-gray-900 p-3" open>
          <summary className="cursor-pointer text-sm text-gray-300">Reports Summary</summary>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div><div className="text-xs text-gray-400">Pending</div><div className="text-xl font-semibold">{summary.total.pending}</div></div>
            <div><div className="text-xs text-gray-400">Verified</div><div className="text-xl font-semibold">{summary.total.verified}</div></div>
            <div><div className="text-xs text-gray-400">Resolved</div><div className="text-xl font-semibold">{summary.total.resolved}</div></div>
          </div>
        </details>
        <details className="rounded-xl border border-gray-800 bg-gray-900 p-3">
          <summary className="cursor-pointer text-sm text-gray-300">Citizen Engagement</summary>
          <div className="mt-2 text-2xl font-semibold">{summary.engagement.weekReports}</div>
        </details>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button className="rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-3 text-sm font-medium">Create Response Notice</button>
        <button className="rounded-xl bg-gray-800 hover:bg-gray-700 px-4 py-3 text-sm font-medium">Forward to Department</button>
        <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-medium">Mark Resolved</button>
      </div>

      {/* Recent Reports */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="text-sm text-gray-300 mb-2">Recent Reports</div>
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


