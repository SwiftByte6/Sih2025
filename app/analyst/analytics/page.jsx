'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Lightweight charts using native SVG for now; can swap to Recharts later
function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let cumulative = 0
  return (
    <svg viewBox="0 0 32 32" className="w-full h-56">
      {data.map((d, idx) => {
        const start = cumulative / total
        cumulative += d.value
        const end = cumulative / total
        const a = 2 * Math.PI * start
        const b = 2 * Math.PI * end
        const largeArc = end - start > 0.5 ? 1 : 0
        const x1 = 16 + 16 * Math.cos(a)
        const y1 = 16 + 16 * Math.sin(a)
        const x2 = 16 + 16 * Math.cos(b)
        const y2 = 16 + 16 * Math.sin(b)
        const path = `M16,16 L ${x1},${y1} A16,16 0 ${largeArc} 1 ${x2},${y2} Z`
        const colors = ['#38bdf8','#22c55e','#f59e0b','#ef4444','#a78bfa']
        return <path key={idx} d={path} fill={colors[idx % colors.length]} />
      })}
    </svg>
  )
}

function LineChart({ points }) {
  if (!points.length) return <div className="h-56"/>
  const maxY = Math.max(...points.map(p => p.y), 1)
  const minY = 0
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100
    const y = 100 - ((p.y - minY) / (maxY - minY)) * 100
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-56">
      <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2" />
    </svg>
  )
}

export default function AnalystAnalyticsPage() {
  const [byType, setByType] = useState([])
  const [overTime, setOverTime] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reports')
        .select('type, created_at')
        .order('created_at', { ascending: true })
        .limit(1000)
      const typeCounts = Object.entries((data || []).reduce((acc, r) => {
        const k = r.type || 'unknown'
        acc[k] = (acc[k] || 0) + 1
        return acc
      }, {})).map(([name, value]) => ({ name, value }))
      setByType(typeCounts)

      const byDay = (data || []).reduce((acc, r) => {
        const d = r.created_at?.slice(0, 10)
        if (!d) return acc
        acc[d] = (acc[d] || 0) + 1
        return acc
      }, {})
      const points = Object.keys(byDay).sort().map((d, i) => ({ x: i, y: byDay[d] }))
      setOverTime(points)
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-300 mb-2">Hazard Types Distribution</div>
          <PieChart data={byType} />
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 col-span-2">
          <div className="text-sm text-gray-300 mb-2">Reports Over Time</div>
          <LineChart points={overTime} />
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 col-span-3">
          <div className="text-sm text-gray-300 mb-2">Region-wise Spread (Heatmap)</div>
          <div className="h-64 grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="h-8 bg-sky-900/30" />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile carousel (simplified stacked for now) */}
      <div className="lg:hidden space-y-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-300 mb-2">Hazard Types Distribution</div>
          <PieChart data={byType} />
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-300 mb-2">Reports Over Time</div>
          <LineChart points={overTime} />
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-300 mb-2">Region-wise Spread (Heatmap)</div>
          <div className="h-56 grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="h-8 bg-sky-900/30" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


