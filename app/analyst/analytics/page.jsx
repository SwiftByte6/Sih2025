'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

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

  const pieColors = ['#93C5FD', '#10b981', '#6366f1', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-4">
      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-foreground/80 mb-2">Hazard Types Distribution</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={byType} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {byType.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-foreground/80 mb-2">Reports Over Time</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={overTime.map((p, i) => ({ index: i, value: p.y }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#93C5FD" strokeWidth={2} dot={false} />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 col-span-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-foreground/80 mb-2">Region-wise Spread (Heatmap)</div>
          <div className="h-64 grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-brand/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile carousel (simplified stacked for now) */}
      <div className="lg:hidden space-y-3">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="text-sm text-foreground/80 mb-2">Hazard Types Distribution</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={byType} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {byType.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="text-sm text-foreground/80 mb-2">Reports Over Time</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={overTime.map((p, i) => ({ index: i, value: p.y }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#93C5FD" strokeWidth={2} dot={false} />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="text-sm text-foreground/80 mb-2">Region-wise Spread (Heatmap)</div>
          <div className="h-56 grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-brand/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


