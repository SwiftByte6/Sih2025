import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'

export default async function Page() {
  const supabase = supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  const { data: logs } = await supabase
    .from('system_logs')
    .select('id, message, level, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">System Logs</div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left text-sm font-medium px-4 py-2">Time</th>
              <th className="text-left text-sm font-medium px-4 py-2">Level</th>
              <th className="text-left text-sm font-medium px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {(logs||[]).map(l => (
              <tr key={l.id} className="border-t border-gray-200">
                <td className="px-4 py-2 text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{l.level}</td>
                <td className="px-4 py-2">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


