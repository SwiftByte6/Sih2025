import { supabaseServerClient } from './supabaseServer'

// Server-side cache for user profiles (in-memory, resets on server restart)
const serverProfileCache = new Map()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for server-side cache

export async function getUserProfileServer(userId, cookieStore = null) {
  if (!userId) return null
  
  // Check cache first
  const cached = serverProfileCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  try {
    const supabase = supabaseServerClient(cookieStore)
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    const profile = { id: userId, ...data }
    
    // Cache the result
    serverProfileCache.set(userId, {
      data: profile,
      timestamp: Date.now()
    })
    
    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export function clearServerProfileCache(userId) {
  if (userId) {
    serverProfileCache.delete(userId)
  } else {
    serverProfileCache.clear()
  }
}

export function getRedirectPath(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'analyst':
      return '/analyst/dashboard'
    case 'official':
      return '/official/dashboard'
    default:
      return '/user/dashboard'
  }
}

