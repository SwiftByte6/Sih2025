import { supabaseServerClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { getUserProfileServer, getRedirectPath } from '@/lib/authServer'
import MapWidget from '@/components/MapWidget'
import { AlertTriangle, CheckCircle2, Clock, Megaphone } from 'lucide-react'

export default async function AnalystDashboardPage() {
  // Auth and role guard
  const supabase = await supabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await getUserProfileServer(user.id)
  if (!profile) redirect('/login')
  const role = profile.role
  if (role !== 'analyst') {
    const target = getRedirectPath(role)
    redirect(target)
  }

  // Data for cards
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
    { title: 'Total Reports Today', value: totalToday ?? 0, icon: AlertTriangle },
    { title: 'Pending Verifications', value: pending ?? 0, icon: Clock },
    { title: 'Verified Reports', value: verified ?? 0, icon: CheckCircle2 },
    { title: 'Alerts Sent', value: alertsSent ?? 0, icon: Megaphone },
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
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm bg-gradient-to-r from-white to-surface">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-600">Analyst Dashboard</h1>
        <p className="text-sm text-foreground mt-1">Key operational metrics and live situational awareness.</p>
      </div>

      <div className="hidden lg:grid grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={card.title} className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground/60">{card.title}</div>
              <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center">
                {card.icon ? <card.icon size={18} className="text-foreground/80" /> : null}
              </div>
            </div>
            <div className="mt-2 text-3xl font-semibold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="lg:hidden grid grid-cols-1 gap-3">
        {cards.map((card, idx) => (
          <div key={card.title} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground/60">{card.title}</div>
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                {card.icon ? <card.icon size={16} className="text-foreground/80" /> : null}
              </div>
            </div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div>
            <div className="text-sm text-foreground/80">Live Hazard Reports</div>
            <div className="text-xs text-foreground/60">Recent activity mapped for quick situational review.</div>
          </div>
          <div className="hidden lg:flex gap-2">
            <button className="px-3 py-1.5 text-xs rounded-md border border-border bg-surface hover:bg-brand/10 transition-colors">All</button>
            <button className="px-3 py-1.5 text-xs rounded-md border border-border bg-surface hover:bg-brand/10 transition-colors">Pending</button>
            <button className="px-3 py-1.5 text-xs rounded-md border border-border bg-surface hover:bg-brand/10 transition-colors">Verified</button>
          </div>
        </div>
        <div className="h-[320px] lg:h-[520px]">
          <MapWidget markers={markers} />
        </div>
      </div>
    </div>
  )
}
