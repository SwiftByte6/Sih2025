import { redirect } from 'next/navigation'
import { supabaseServerClient } from '@/lib/supabaseServer'
import OfficialDashboardClient from '@/components/official/OfficialDashboardClient'

const dummyReports = []

export default async function Page() {
  const supabase = supabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'official') redirect('/login')

  // Fetch latest reports for dashboard and build summary dynamically
  const { data: reportsData } = await supabase
    .from('reports')
    .select('id, title, type, status, created_at, description')
    .order('created_at', { ascending: false })
    .limit(8)

  const reports = Array.isArray(reportsData) ? reportsData : []

  const counts = reports.reduce(
    (acc, r) => {
      const key = (r.status || 'pending')
      if (acc[key] !== undefined) acc[key] += 1
      return acc
    },
    { pending: 0, verified: 0, resolved: 0 }
  )

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekReports = reports.filter(r => new Date(r.created_at).getTime() >= weekAgo).length

  const summary = {
    total: counts,
    engagement: { weekReports },
  }

  return (
    <OfficialDashboardClient summary={summary} reports={reports} />
  )
}
