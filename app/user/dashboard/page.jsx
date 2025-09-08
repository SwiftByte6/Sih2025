// app/user/dashboard/page.jsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseServerClient } from '@/lib/supabaseServer'
import LogoutButton from '@/components/LogoutButton'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = supabaseServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.toLowerCase()

  if (role === 'admin') redirect('/admin/dashboard')
  if (role === 'analyst') redirect('/analyst/dashboard')
  if (role === 'official') redirect('/official/dashboard')

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, user.</p>
      <LogoutButton />
    </div>
  )
}
