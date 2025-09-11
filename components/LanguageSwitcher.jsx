'use client'

import React from 'react'
import { useI18n } from '@/contexts/I18nContext'

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale, availableLocales } = useI18n()
  return (
    <select
      aria-label="Language"
      className={className}
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
    >
      {availableLocales.map((l) => (
        <option key={l} value={l}>
          {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : l}
        </option>
      ))}
    </select>
  )
}


