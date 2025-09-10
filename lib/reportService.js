// Minimal service using the app's own API routes
export async function uploadMediaAndCreateReport({ title, type, description, location }) {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title, type, description, location }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || 'Failed to create report')
  }
  const data = await res.json()
  return data.report
}

export async function fetchRecentReports() {
  const res = await fetch('/api/reports', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch reports')
  const data = await res.json()
  return data.reports || []
}


