// app/page.jsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfileServer, getRedirectPath } from '@/lib/authServer'
import { supabaseServerClient } from '@/lib/supabaseServer'


export default async function Home() {
  const supabase = await supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await getUserProfileServer(user.id)
  if (!profile) redirect('/login')

  const role = profile.role
  const target = getRedirectPath(role)
  if (target !== '/user/dashboard') redirect(target)
  return (
    <main className="bg-[#F4FEFF] h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-between h-3/4 w-full px-6">
        
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome :)</h1>
          <p className="text-gray-700 text-xl  font-medium leading-snug">
           combining citizen reports and social media  <br/>
for faster responses to ocean hazards
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <Link href="/login" className="block">
            <button className="w-full bg-[#E0F2FE] border border-[#93C5FD] rounded-full py-3 text-xl font-bold text-gray-900 hover:bg-[#bae6fd] transition">
              Create Account
            </button>
          </Link>
          <Link href="/login" className="block">
            <button className="w-full border border-gray-300 rounded-full py-3 text-xl font-bold text-gray-800 hover:bg-gray-100 transition">
              Log In
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
