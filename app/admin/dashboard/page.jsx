import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import LogoutButton from '@/components/LogoutButton'

export default async function Page() {
  const supabase = supabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/login')

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, admin.</p>
      <LogoutButton/>
    </div>
  )
}
