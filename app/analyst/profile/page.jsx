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
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm bg-gradient-to-r from-white to-surface mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-foreground/70 mt-1">Manage your account security and preferences.</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-4 space-y-3 shadow-sm">
        <div className="text-sm text-foreground/80">Account</div>
        <div className="text-sm"><span className="text-foreground/60">Email: </span>{email}</div>
        <form onSubmit={updatePassword} className="space-y-2">
          <div className="text-sm text-foreground/80">Change Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"/>
          <button className="rounded-md bg-brand hover:bg-brand/90 px-3 py-2 text-sm transition-colors">Update</button>
          {message && <div className="text-xs text-foreground/80">{message}</div>}
        </form>
      </div>
    </div>
  )
}


