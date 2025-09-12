import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'

export default async function Page() {
  const supabase = await supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  const { data: alerts } = await supabase
    .from('alerts')
    .select('id, title, type, severity, region, expiry, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-lg font-semibold mb-2">Alerts</div>
        <div className="overflow-auto rounded-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-2">Title</th>
                <th className="text-left text-sm font-medium px-4 py-2">Type</th>
                <th className="text-left text-sm font-medium px-4 py-2">Severity</th>
                <th className="text-left text-sm font-medium px-4 py-2">Region</th>
                <th className="text-left text-sm font-medium px-4 py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {(alerts||[]).map((a) => (
                <tr key={a.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{a.title}</td>
                  <td className="px-4 py-2 capitalize">{a.type}</td>
                  <td className="px-4 py-2 capitalize">{a.severity}</td>
                  <td className="px-4 py-2">{a.region || 'All'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{a.expiry ? new Date(a.expiry).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


