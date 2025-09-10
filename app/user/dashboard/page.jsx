// app/user/dashboard/page.jsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseServerClient } from '@/lib/supabaseServer'
import LogoutButton from '@/components/LogoutButton'
import BottomNav from '@/components/BottomNav'

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
    <div className='w-full h-screen p-4 flex flex-col gap-4'>
      <h1 className='font-extrabold text-2xl'>Home </h1>
      <button className='w-full px-4 py-2 rounded-3xl bg-blue-300 font-bold'>Report Hazard</button>
      <div className='flex gap-2'>
        <button className='w-full px-4 py-2 rounded-3xl bg-green-300 font-bold'>
          View Map
        </button>
        <button className='w-full px-4 py-2 rounded-3xl bg-green-300 font-bold'>
          View Map
        </button>
      </div>
      <div>
        <h2 className='font-bold text-lg'>Recent Reports</h2>
        <div className='w-full h-40 bg-gray-200 rounded-2xl flex justify-center items-center'>
          No Reports Yet
        </div>
      </div>
    

    </div>
  )
}
