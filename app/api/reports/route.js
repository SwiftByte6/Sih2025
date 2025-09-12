import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseServerClient() {
  const cookieStore = cookies()
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

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, type, description, latitude, longitude, created_at, status')
    .order('created_at', { ascending: false })
    .limit(20)

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
  if (!body || !body.title || !body.type || !body.description || !body.location) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { title, type, description, location } = body
  const latitude = Number(location?.lat)
  const longitude = Number(location?.lng)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return new Response(JSON.stringify({ error: 'Invalid location' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Normalize and validate type against allowed values to satisfy DB check constraint
  const normalizedType = String(type || '').toLowerCase()
  const typeAliasMap = {
    high_waves: 'high_tides',
  }
  const mappedType = typeAliasMap[normalizedType] || normalizedType
  const allowedTypes = new Set(['flood', 'tsunami', 'pollution', 'high_tides'])
  if (!allowedTypes.has(mappedType)) {
    return new Response(
      JSON.stringify({ error: `Invalid type. Allowed: ${Array.from(allowedTypes).join(', ')}` }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    )
  }

  const supabase = getSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id ?? null
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      title,
      type: mappedType,
      description,
      latitude,
      longitude,
    })
    .select('id, title, type, description, latitude, longitude, created_at, status')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ report: data }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
}


