'use client'

import { supabase } from '@/lib/supabaseClient'
import { useI18n } from '@/contexts/I18nContext'

export default function LogoutButton() {
  const { t } = useI18n()
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      // Clear session & redirect
      window.location.href = '/login'
    } else {
      console.error('Logout failed:', error.message)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-300 border border-red-500 px-4 py-2 rounded-2xl hover:bg-red-100"
    >
      {t('auth.logout')}
    </button>
  )
}
