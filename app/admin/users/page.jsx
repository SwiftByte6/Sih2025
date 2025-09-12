import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'
import RoleSelect from '@/components/admin/RoleSelect'

export default async function Page() {
  const supabase = await supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-lg font-semibold mb-2">Users</div>
        <div className="overflow-auto rounded-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">Name</th>
                <th className="text-left text-sm font-medium px-4 py-2">Email</th>
                <th className="text-left text-sm font-medium px-4 py-2">Role</th>
                <th className="text-left text-sm font-medium px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(profiles||[]).map((p) => (
                <tr key={p.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{p.full_name || '—'}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2"><RoleSelect userId={p.id} role={p.role||'user'} /></td>
                  <td className="px-4 py-2 text-sm text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


