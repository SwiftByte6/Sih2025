// app/user/dashboard/page.jsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'
import Link from 'next/link'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = supabaseServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await getUserProfileServer(user.id, cookieStore)
  if (!profile) redirect('/login')

  const role = profile.role?.toLowerCase()

  if (role === 'admin') redirect('/admin/dashboard')
  if (role === 'analyst') redirect('/analyst/dashboard')
  if (role === 'official') redirect('/official/dashboard')

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
      <h1 className="font-bold text-xl border-b pb-4 border-border">Home</h1>

      {/* Action Buttons */}
      <Link href="/user/report" className="w-full px-4 py-4 rounded-3xl border border-border bg-brand/70 font-bold text-center">
        Report Hazard
      </Link>

      <div className="flex gap-4">
        <button className="flex-1 px-4 py-4 rounded-3xl bg-white/70 border border-border font-bold">
          View Map
        </button>
        <button className="flex-1 px-4 py-4 rounded-3xl bg-white/70 border border-border font-bold">
          View History
        </button>
      </div>

      {/* Recent Reports */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg">Recent Reports</h2>

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
            No Reports Yet
          </div>
        )}
      </div>
    </div>
  )
}
