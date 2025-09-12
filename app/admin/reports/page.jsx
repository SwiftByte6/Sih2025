import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'
import StatusSelect from '@/components/admin/StatusSelect'

export default async function Page() {
  const supabase = await supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  const { data: reports } = await supabase
    .from('reports')
    .select('id, title, type, status, created_at, description')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-lg font-semibold mb-2">Reports</div>
        <div className="overflow-auto rounded-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">ID</th>
                <th className="text-left text-sm font-medium px-4 py-2">Title</th>
                <th className="text-left text-sm font-medium px-4 py-2">Type</th>
                <th className="text-left text-sm font-medium px-4 py-2">Status</th>
                <th className="text-left text-sm font-medium px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {(reports||[]).map((r) => (
                <tr key={r.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2 capitalize">{r.type}</td>
                  <td className="px-4 py-2"><StatusSelect reportId={r.id} status={r.status} /></td>
                  <td className="px-4 py-2 text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


