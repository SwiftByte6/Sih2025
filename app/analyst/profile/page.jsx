'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AnalystProfilePage() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setEmail(data.user?.email || '')
    })
  }, [])

  async function updatePassword(e) {
    e.preventDefault()
    setMessage('')
    if (!password || password.length < 6) return setMessage('Password too short')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else setMessage('Password updated')
    setPassword('')
  }

  return (
    <div className="max-w-xl">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
        <div className="text-sm text-gray-300">Profile</div>
        <div className="text-sm"><span className="text-gray-400">Email: </span>{email}</div>
        <form onSubmit={updatePassword} className="space-y-2">
          <div className="text-sm text-gray-300">Change Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2 text-sm"/>
          <button className="rounded-md bg-sky-600 hover:bg-sky-700 px-3 py-2 text-sm">Update</button>
          {message && <div className="text-xs text-gray-300">{message}</div>}
        </form>
      </div>
    </div>
  )
}


