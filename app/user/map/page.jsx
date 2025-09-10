// app/user/dashboard/page.jsx
"use client"
import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { fetchRecentReports } from '@/lib/reportService'
import CitizenReportForm from '@/components/CitizenReportForm'

const MapWithSearch = dynamic(() => import('@/components/MapWithSearch'), { ssr: false })

export default function Page() {
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
    title: r.hazard_type,
    description: r.description,
  })), [reports])

  return (
    <div className='w-full min-h-screen p-4 flex flex-col gap-6 max-w-5xl mx-auto'>
  

      <div className='space-y-3'>
        <h2 className='font-bold text-lg'>Map (Search + Zoom)</h2>
        <div className='w-full h-[80vh] rounded-2xl overflow-hidden border border-gray-200'>
          <MapWithSearch markers={markers} />
        </div>
      </div>

    
    </div>
  )
}
