'use client'

import React from 'react'
import { useI18n } from '@/contexts/I18nContext'

export default function Trans({ k, children }) {
  const { t } = useI18n()
  const fallback = typeof children === 'string' ? children : ''
  const translated = t(k) || fallback
  return <>{translated}</>
}


