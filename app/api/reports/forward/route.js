import { supabaseServerClient } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    const body = await request.json()
    const { reportId, forwardedTo, forwardingReason, forwardingNotes } = body

    if (!reportId || !forwardedTo) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: reportId, forwardedTo' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const supabase = await supabaseServerClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }

    // Check if the report exists
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, title, status')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      })
    }

    // For now, just update the report status to indicate it's been forwarded
    // We'll use a custom status to indicate forwarding
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({ 
        status: 'forwarded',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating report status:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to forward report' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      report: updatedReport,
      message: 'Report forwarded successfully' 
    }), {
      headers: { 'content-type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in forward report API:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export async function GET(request) {
  try {
    const supabase = await supabaseServerClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }

    // For now, get reports with status 'forwarded'
    const { data: forwardedReports, error } = await supabase
      .from('reports')
      .select('id, title, type, description, created_at, status, updated_at')
      .eq('status', 'forwarded')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching forwarded reports:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch forwarded reports' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ forwardedReports: forwardedReports || [] }), {
      headers: { 'content-type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in get forwarded reports API:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
