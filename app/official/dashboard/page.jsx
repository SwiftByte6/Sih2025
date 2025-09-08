import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'

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
  if (profile?.role !== 'official') redirect('/login')

  return (
    <div>
      <h1>Official Page</h1>
      <p>Welcome, official.</p>
    </div>
  )
}
