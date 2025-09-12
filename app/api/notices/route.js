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

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, content, region, expiry, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ notices: data ?? [] }), {
    headers: { 'content-type': 'application/json' },
  })
}

export async function POST(request) {
  const body = await request.json().catch(() => null)
  if (!body || !body.title || !body.content) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const supabase = await getSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id ?? null

  const payload = {
    user_id: userId,
    title: body.title,
    content: body.content,
    region: body.region || null,
    expiry: body.expiry || null,
  }

  const { data, error } = await supabase
    .from('notices')
    .insert(payload)
    .select('id, title, content, region, expiry, created_at')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ notice: data }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
}


