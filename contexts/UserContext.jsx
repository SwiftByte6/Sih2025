'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null
    
    // Return cached data if available
    if (userProfile?.id === userId) return userProfile
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      const profile = { id: userId, ...data }
      setUserProfile(profile)
      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [userProfile])

  const clearUserProfile = useCallback(() => {
    setUserProfile(null)
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearUserProfile()
        setIsLoading(false)
      } else if (session?.user) {
        await fetchUserProfile(session.user.id)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile, clearUserProfile])

  return (
    <UserContext.Provider value={{ 
      userProfile, 
      fetchUserProfile, 
      clearUserProfile,
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
