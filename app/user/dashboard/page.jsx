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
    <div className="w-full min-h-screen p-4 flex flex-col gap-6  bg-[]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-border">
        <img src="/Logo.png" alt="ShoreHelp" className="w-8 h-8" />
        <h1 className="font-bold text-xl text-foreground"><Trans k="user.dashboard">Dashboard</Trans></h1>
      </div>

      {/* Action Buttons */}
      <Link href="/user/report" className="w-full px-6 py-4 rounded-3xl border-2 border-brand bg-brand text-white font-bold text-center shadow-lg hover:bg-brand/90 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <Trans k="user.report">Report</Trans>
      </Link>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/user/map" className="px-4 py-4 rounded-3xl bg-background border-2 border-brand/30 font-bold text-center shadow-md hover:shadow-lg hover:border-brand transition-all duration-200 transform hover:scale-105">
          <div className="text-brand font-semibold">
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
                className="w-full bg-background border-2 border-brand/20 h-20 rounded-2xl flex flex-col justify-center px-4 shadow-md hover:shadow-lg hover:border-brand/40 transition-all duration-200"
              >
                <p className="font-bold text-foreground">{report.title ?? 'Untitled'}</p>
                <p className="text-sm text-foreground/70">
                  {new Date(report.created_at).toLocaleString()} • {report.status}
                </p>
              </div>
            ))}
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
