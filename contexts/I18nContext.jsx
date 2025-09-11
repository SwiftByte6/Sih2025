"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Lazy imports so server bundles stay light; paths are static for bundlers
import en from '@/locales/en.json'
import hi from '@/locales/hi.json'

const SUPPORTED_LOCALES = {
  en,
  hi,
}

const DEFAULT_LOCALE = 'en'
const STORAGE_KEY = 'app.locale'

const I18nContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: (_l) => {},
  t: (key, vars) => key,
  availableLocales: ['en', 'hi'],
})

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE)

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (stored && SUPPORTED_LOCALES[stored]) setLocaleState(stored)
    } catch (_) {}
  }, [])

  const setLocale = useCallback((newLocale) => {
    if (!SUPPORTED_LOCALES[newLocale]) return
    setLocaleState(newLocale)
    try { localStorage.setItem(STORAGE_KEY, newLocale) } catch (_) {}
  }, [])

  const messages = useMemo(() => SUPPORTED_LOCALES[locale] || {}, [locale])

  const interpolate = (str, vars) => {
    if (!vars) return str
    return Object.keys(vars).reduce((acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])), str)
  }

  const t = useCallback((key, vars) => {
    const value = key.split('.').reduce((obj, part) => (obj && obj[part] != null ? obj[part] : undefined), messages)
    const str = typeof value === 'string' ? value : key
    return interpolate(str, vars)
  }, [messages])

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    availableLocales: Object.keys(SUPPORTED_LOCALES),
  }), [locale, setLocale, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}


