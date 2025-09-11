'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

const ROLES = ['user','analyst','official','admin']

export default function RoleSelect({ userId, role }) {
  const { toast } = useToast()
  const [currentRole, setCurrentRole] = useState(role)
  const [saving, setSaving] = useState(false)

  async function onChangeRole(next) {
    setCurrentRole(next)
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ role: next }).eq('id', userId)
    setSaving(false)
    if (error) {
      toast({ title: 'Failed to update role', description: error.message, variant: 'error' })
      setCurrentRole(role)
    } else {
      toast({ title: 'Role updated', variant: 'success' })
    }
  }

  return (
    <select value={currentRole} onChange={(e)=>onChangeRole(e.target.value)} disabled={saving} className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm">
      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}


