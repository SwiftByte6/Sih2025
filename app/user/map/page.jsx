// app/user/map/page.jsx
"use client"
import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useI18n } from '@/contexts/I18nContext'
import { fetchRecentReports } from '@/lib/reportService'

const MapWithSearch = dynamic(() => import('@/components/MapWithSearch'), { ssr: false })

export default function Page() {
  const { t } = useI18n()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    fetchRecentReports()
      .then((r) => { if (isMounted) setReports(r) })
      .catch((e) => { if (isMounted) setError(e.message) })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  const markers = useMemo(() => (reports || []).map(r => ({
    id: r.id,
    position: [r.latitude, r.longitude],
    title: r.title || r.type || 'No Title',
    description: r.description || 'No Description',
    status: r.status || 'pending'
  })), [reports])

  if (loading) {
    return (
      <div className='w-full min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Loading map...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full min-h-screen flex items-center justify-center'>
        <div className='text-lg text-red-600'>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen flex flex-col gap-6 max-w-5xl mx-auto'>
      <div className='space-y-3'>
        <div className="flex items-center justify-center gap-3 m-3">
          <img src="/Logo.png" alt="ShoreHelp" className="w-8 h-8" />
          <h2 className='font-bold text-2xl'>{t('user.map')}</h2>
        </div>
        <div className='w-full h-[80vh] overflow-hidden'>
          <MapWithSearch markers={markers} />
        </div>
      </div>
    </div>
  )
}
