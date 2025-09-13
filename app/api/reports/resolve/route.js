import { supabaseServerClient } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    const body = await request.json()
    const { reportId, resolutionNotes } = body

    if (!reportId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required field: reportId' 
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

    // Update the report status to resolved
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({ 
        status: 'resolved'
      })
      .eq('id', reportId)
      .select()
      .single()

    if (updateError) {
      console.error('Error resolving report:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to resolve report' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      report: updatedReport,
      message: 'Report resolved successfully' 
    }), {
      headers: { 'content-type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in resolve report API:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
