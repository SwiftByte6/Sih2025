import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'

export default async function Page() {
  const supabase = supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  const { data: notices } = await supabase
    .from('notices')
    .select('id, title, content, region, expiry, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-lg font-semibold mb-2">Notices</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {(notices||[]).map(n => (
            <div key={n.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{n.title}</div>
                <div className="text-xs text-gray-500">{n.expiry ? new Date(n.expiry).toLocaleString() : 'No expiry'}</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{n.content}</div>
              <div className="text-xs text-gray-500 mt-1">Region: {n.region || 'All'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


