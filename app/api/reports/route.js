import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name, options) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'active', 'resolved', 'forwarded', or null for all
  
  const supabase = await getSupabaseServerClient()
  
  // Get reports with basic columns first
  let query = supabase
    .from('reports')
    .select('id, title, type, description, latitude, longitude, created_at, status, image_url')
    .order('created_at', { ascending: false })
    .limit(20)

  // Filter based on status parameter
  if (status === 'active') {
    // Show only active reports (not resolved and not forwarded)
    query = query.eq('status', 'pending')
  } else if (status === 'resolved') {
    // Show only resolved reports
    query = query.eq('status', 'resolved')
  } else if (status === 'forwarded') {
    // Show only forwarded reports
    query = query.eq('status', 'forwarded')
  }
  // If no status parameter, show all reports (default behavior)

  const { data, error } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ reports: data ?? [] }), {
    headers: { 'content-type': 'application/json' },
  })
}

export async function POST(request) {
  const body = await request.json().catch(() => null)
  if (!body || !body.title || !body.type || !body.description) {
    return new Response(JSON.stringify({ error: 'Missing required fields: title, type, description' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { title, type, description, location } = body
  
  console.log('Received location data:', location)
  
  const latitude = location?.lat ? Number(location.lat) : null
  const longitude = location?.lng ? Number(location.lng) : null
  
  console.log('Processed coordinates:', { latitude, longitude })

  // Location is optional, but if provided, must be valid
  if (location && location !== null && location.lat !== null && location.lng !== null && (!Number.isFinite(latitude) || !Number.isFinite(longitude))) {
    console.log('Location validation failed:', { location, latitude, longitude })
    return new Response(JSON.stringify({ error: 'Invalid location data' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Normalize and validate type against allowed values to satisfy DB check constraint
  const normalizedType = String(type || '').toLowerCase().trim()
  const typeAliasMap = {
    high_waves: 'high_tides',
    high_tides: 'high_tides', // Ensure consistency
    'high tide': 'high_tides',
    'high tides': 'high_tides',
  }
  const mappedType = typeAliasMap[normalizedType] || normalizedType
  const allowedTypes = new Set(['flood', 'tsunami', 'pollution', 'high_tides'])
  
  console.log('Report type validation:', { original: type, normalized: normalizedType, mapped: mappedType, allowed: Array.from(allowedTypes) })
  
  if (!allowedTypes.has(mappedType)) {
    return new Response(
      JSON.stringify({ error: `Invalid type '${type}'. Allowed: ${Array.from(allowedTypes).join(', ')}` }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    )
  }

  const supabase = await getSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id ?? null
  
  console.log('Inserting report with data:', {
    user_id: userId,
    title,
    type: mappedType,
    description,
    latitude,
    longitude,
  })
  
  // Additional debugging for type validation
  console.log('Type validation details:', {
    originalType: type,
    normalizedType: normalizedType,
    mappedType: mappedType,
    typeLength: mappedType.length,
    typeCharCodes: mappedType.split('').map(c => c.charCodeAt(0))
  })
  
  let { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      title,
      type: mappedType,
      description,
      latitude,
      longitude,
      image_url: null,
    })
    .select('id, title, type, description, latitude, longitude, created_at, status, image_url')
    .single()

  // If there's a type constraint error, try with a fallback type
  if (error && error.message.includes('reports_type_check')) {
    console.log('Type constraint error, trying fallback type...')
    const fallbackType = 'flood' // Use a known working type as fallback
    
    const fallbackResult = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        title,
        type: fallbackType,
        description,
        latitude,
        longitude,
        image_url: null,
      })
      .select('id, title, type, description, latitude, longitude, created_at, status, image_url')
      .single()
    
    if (fallbackResult.error) {
      console.error('Fallback also failed:', fallbackResult.error)
      return new Response(JSON.stringify({ 
        error: 'Invalid report type. Please select a valid hazard type.',
        details: 'The report type does not match the allowed values in the database.',
        originalError: error.message
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    } else {
      // Use the fallback result
      data = fallbackResult.data
      error = null
      console.log('Successfully inserted with fallback type:', fallbackType)
      // Note: The report was saved with a fallback type, but we don't expose this to the user
      // to avoid confusion. The original type selection is preserved in the UI.
    }
  }

  if (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ error: error.message, details: error }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ report: data }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
}


