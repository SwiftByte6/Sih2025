import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'

export default async function Page() {
  const supabase = await supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  const { data: notifications } = await supabase
    .from('user_notifications')
    .select('id, user_id, title, message, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-lg font-semibold mb-2">User Notifications</div>
        <div className="overflow-auto rounded-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">User</th>
                <th className="text-left text-sm font-medium px-4 py-2">Title</th>
                <th className="text-left text-sm font-medium px-4 py-2">Message</th>
                <th className="text-left text-sm font-medium px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {(notifications||[]).map((n) => (
                <tr key={n.id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-xs">{n.user_id}</td>
                  <td className="px-4 py-2">{n.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{n.message}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{n.created_at ? new Date(n.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


