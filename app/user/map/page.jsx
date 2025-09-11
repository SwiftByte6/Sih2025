// app/user/dashboard/page.jsx
"use client"
import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useI18n } from '@/contexts/I18nContext'
import { fetchRecentReports } from '@/lib/reportService'
import CitizenReportForm from '@/components/CitizenReportForm'

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
    title: r.hazard_type || 'No Title',  // fallback if hazard_type is missing
    description: r.description || 'No Description',
    status: r.status || 'pending'       // add status for verified/pending
  })), [reports])

  return (
    <div className='w-full min-h-screen flex flex-col gap-6 max-w-5xl mx-auto'>
      <div className='space-y-3'>
        <h2 className='font-bold text-2xl m-3 text-center'>{t('user.map')}</h2>
        <div className='w-full h-[80vh] overflow-hidden'>
          <MapWithSearch markers={markers} />
        </div>
      </div>
    </div>
  )
}
