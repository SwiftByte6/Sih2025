'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

const STATUSES = ['pending','reviewing','resolved']

export default function StatusSelect({ reportId, status }) {
  const { toast } = useToast()
  const [current, setCurrent] = useState(status)
  const [saving, setSaving] = useState(false)

  async function onChangeStatus(next) {
    setCurrent(next)
    setSaving(true)
    const { error } = await supabase.from('reports').update({ status: next }).eq('id', reportId)
    setSaving(false)
    if (error) {
      toast({ title: 'Failed to update status', description: error.message, variant: 'error' })
      setCurrent(status)
    } else {
      toast({ title: 'Status updated', variant: 'success' })
    }
  }

  return (
    <select value={current} onChange={(e)=>onChangeStatus(e.target.value)} disabled={saving} className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm capitalize">
      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}


