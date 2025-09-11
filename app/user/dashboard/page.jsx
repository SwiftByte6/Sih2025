// app/user/dashboard/page.jsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'

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

  // Toggle simulation for reports
  const isReportAvailable = true // set false to test "No Reports Yet"
  const reports = [
    { id: 1, title: 'Fallen Tree on Road', date: '2025-09-11', status: 'Pending' },
    { id: 2, title: 'Flooded Area', date: '2025-09-10', status: 'Resolved' },
  ]

  return (
    <div className="w-full min-h-screen p-4 flex flex-col gap-6 bg-[#F4FEFF]">
      {/* Header */}
      <h1 className="font-bold text-xl border-b pb-4 border-gray-400">Home</h1>

      {/* Action Buttons */}
      <button className="w-full px-4 py-4 rounded-3xl border border-gray-600/80 bg-[#93C5FD]/70 font-bold">
        Report Hazard
      </button>

      <div className="flex gap-4">
        <button className="flex-1 px-4 py-4 rounded-3xl bg-white/70 border border-gray-400 font-bold">
          View Map
        </button>
        <button className="flex-1 px-4 py-4 rounded-3xl bg-white/70 border border-gray-400 font-bold">
          View History
        </button>
      </div>

      {/* Recent Reports */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg">Recent Reports</h2>

        {isReportAvailable ? (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="w-full bg-[#93C5FD]/70 h-20 rounded-2xl border border-gray-400 flex flex-col justify-center px-4"
              >
                <p className="font-bold">{report.title}</p>
                <p className="text-sm text-gray-700">
                  {report.date} • {report.status}
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
