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
    .select('id,title,status,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  const reports = Array.isArray(reportsData) ? reportsData : []

  return (
    <div className="w-full min-h-screen p-4 flex flex-col gap-6 bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-border">
        <img src="/Logo.png" alt="ShoreHelp" className="w-8 h-8" />
        <h1 className="font-bold text-xl"><Trans k="user.dashboard">Dashboard</Trans></h1>
      </div>

      {/* Action Buttons */}
      <Link href="/user/report" className="w-full px-4 py-4 rounded-3xl border border-border bg-brand/70 font-bold text-center">
        <Trans k="user.report">Report</Trans>
      </Link>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/user/map" className="px-4 py-4 rounded-3xl bg-white/70 border border-border font-bold text-center">
          <Trans k="user.map">Map</Trans>
        </Link>
        <Link href="/user/profile" className="px-4 py-4 rounded-3xl bg-white/70 border border-border font-bold text-center">
          <Trans k="user.history">History</Trans>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/user/analytics" className="px-4 py-4 rounded-3xl bg-white/70 border border-border font-bold text-center">
          Analytics
        </Link>
        <Link href="/user/notifications" className="px-4 py-4 rounded-3xl bg-white/70 border border-border font-bold text-center">
          <Trans k="user.notifications">Alerts</Trans>
        </Link>
      </div>

      {/* Recent Reports */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg"><Trans k="user.recent_reports">Recent Reports</Trans></h2>

        {reports.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="w-full bg-brand/70 h-20 rounded-2xl border border-border flex flex-col justify-center px-4"
              >
                <p className="font-bold">{report.title ?? 'Untitled'}</p>
                <p className="text-sm text-gray-700">
                  {new Date(report.created_at).toLocaleString()} • {report.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-200 rounded-2xl flex justify-center items-center">
            <Trans k="user.no_reports">No Reports Yet</Trans>
          </div>
        )}
      </div>
    </div>
  )
}
