import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import { getUserProfileServer } from '@/lib/authServer'
import LogoutButton from '@/components/LogoutButton'

export default async function Page() {
  const supabase = supabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const profile = await getUserProfileServer(user.id)
  if (profile?.role !== 'admin') redirect('/login')

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, admin.</p>
      <LogoutButton/>
    </div>
  )
}
