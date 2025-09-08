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
  if (profile?.role !== 'analyst') redirect('/login')

  return (
    <div>
      <h1>Analyst</h1>
      <p>Welcome, analyst.</p>
      <LogoutButton/>
    </div>
  )
}
