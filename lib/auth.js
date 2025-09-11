import { supabase } from './supabaseClient'

// Cache for user profiles to avoid repeated database calls
const profileCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getUserProfile(userId) {
  if (!userId) return null
  
  // Check cache first
  const cached = profileCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    const profile = { id: userId, ...data }
    
    // Cache the result
    profileCache.set(userId, {
      data: profile,
      timestamp: Date.now()
    })
    
    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export function clearProfileCache(userId) {
  if (userId) {
    profileCache.delete(userId)
  } else {
    profileCache.clear()
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
