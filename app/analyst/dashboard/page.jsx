import { supabaseServerClient } from '@/lib/supabaseServer'
import MapWidget from '@/components/MapWidget'

export default async function AnalystDashboardPage() {
  // Data for cards
  const supabase = supabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)
  const { count: totalToday } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)
  const { count: pending } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  const { count: verified } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'verified')
  const { count: alertsSent } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })

  const cards = [
    { title: 'Total Reports Today', value: totalToday ?? 0 },
    { title: 'Pending Verifications', value: pending ?? 0 },
    { title: 'Verified Reports', value: verified ?? 0 },
    { title: 'Alerts Sent', value: alertsSent ?? 0 },
  ]

  const { data: liveReports } = await supabase
    .from('reports')
    .select('id,title,description,latitude,longitude,status')
    .limit(50)
    .order('created_at', { ascending: false })

  const markers = (liveReports || [])
    .filter(r => typeof r.latitude === 'number' && typeof r.longitude === 'number')
    .map(r => ({ id: r.id, title: r.title ?? r.status, description: r.description ?? '', position: [r.latitude, r.longitude] }))

  return (
    <div className="space-y-4">
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.title} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="text-sm text-gray-400">{card.title}</div>
            <div className="mt-2 text-3xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="lg:hidden grid grid-cols-1 gap-3">
        {cards.map(card => (
          <div key={card.title} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="text-sm text-gray-400">{card.title}</div>
            <div className="mt-1 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          <div className="text-sm text-gray-300">Live Hazard Reports</div>
          {/* Mobile toggle could be wired to collapse map if needed */}
        </div>
        <div className="h-[320px] lg:h-[520px]">
          <MapWidget markers={markers} />
        </div>
      </div>
    </div>
  )
}
