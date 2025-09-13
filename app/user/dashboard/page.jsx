// app/user/dashboard/page.jsx
import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer, getRedirectPath } from '@/lib/authServer'
import Link from 'next/link'
import Trans from '@/components/Trans'

export default async function Page() {
  const supabase = await supabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await getUserProfileServer(user.id)
  if (!profile) redirect('/login')

  const role = profile.role
  const target = getRedirectPath(role)
  if (target !== '/user/dashboard') redirect(target)

  // Load recent reports for this user
  const { data: reportsData } = await supabase
    .from('reports')
    .select('id,title,status,created_at,type,description')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  const reports = Array.isArray(reportsData) ? reportsData : []

  // Get report statistics
  const { data: allReportsData } = await supabase
    .from('reports')
    .select('status')
    .eq('user_id', user.id)
  
  const reportStats = {
    total: allReportsData?.length || 0,
    pending: allReportsData?.filter(r => r.status === 'pending').length || 0,
    verified: allReportsData?.filter(r => r.status === 'verified').length || 0,
    resolved: allReportsData?.filter(r => r.status === 'resolved').length || 0,
    rejected: allReportsData?.filter(r => r.status === 'rejected').length || 0
  }

  return (
    <div className="w-full min-h-screen p-4 flex flex-col gap-6  bg-[#F4FEFF]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-border">
        <img src="/Logo.png" alt="ShoreHelp" className="w-8 h-8" />
        <h1 className="font-bold text-xl text-foreground"><Trans k="user.dashboard">Dashboard</Trans></h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{reportStats.total}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{reportStats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{reportStats.verified}</div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="text-2xl font-bold text-emerald-600">{reportStats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Action Buttons */}
      <Link href="/user/report" className="w-full px-6 py-4 rounded-3xl border-2 border-brand bg-brand text-white font-bold text-center shadow-lg hover:bg-brand/90 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <Trans k="user.report">Report</Trans>
      </Link>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/user/map" className="px-4 py-4 rounded-3xl bg-background border-2 border-brand/30 font-bold text-center shadow-md hover:shadow-lg hover:border-brand transition-all duration-200 transform hover:scale-105">
          <div className="text-brand font-semibold ">
            <Trans k="user.map">Map</Trans>
          </div>
        </Link>
        <Link href="/user/profile" className="px-4 py-4 rounded-3xl bg-background border-2 border-brand/30 font-bold text-center shadow-md hover:shadow-lg hover:border-brand transition-all duration-200 transform hover:scale-105">
          <div className="text-brand font-semibold">
            <Trans k="user.history">History</Trans>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/user/analytics" className="px-4 py-4 rounded-3xl bg-background border-2 border-brand/30 font-bold text-center shadow-md hover:shadow-lg hover:border-brand transition-all duration-200 transform hover:scale-105">
          <div className="text-brand font-semibold">
            Analytics
          </div>
        </Link>
        <Link href="/user/notifications" className="px-4 py-4 rounded-3xl bg-background border-2 border-brand/30 font-bold text-center shadow-md hover:shadow-lg hover:border-brand transition-all duration-200 transform hover:scale-105">
          <div className="text-brand font-semibold">
            <Trans k="user.notifications">Alerts</Trans>
          </div>
        </Link>
      </div>

      {/* Recent Reports */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-foreground"><Trans k="user.recent_reports">Recent Reports</Trans></h2>

        {reports.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-lg hover:border-brand/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{report.title ?? 'Untitled'}</p>
                    <p className="text-sm text-foreground/70 capitalize">{report.type}</p>
                    <p className="text-sm text-foreground/70">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'verified' ? 'bg-green-100 text-green-800' :
                      report.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {reports.length >= 10 && (
              <Link href="/user/report" className="w-full text-center py-2 text-brand hover:text-brand/80 font-medium">
                View All Reports →
              </Link>
            )}
          </div>
        ) : (
          <div className="w-full h-40 bg-background border-2 border-brand/20 rounded-2xl flex justify-center items-center shadow-md">
            <div className="text-foreground/60 font-medium">
              <Trans k="user.no_reports">No Reports Yet</Trans>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
