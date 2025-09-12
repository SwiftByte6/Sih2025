import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function supabaseServerClient(cookieStoreArg) {
  const cookieStore = cookieStoreArg ?? (await cookies())
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Silently fail if we can't set cookies (e.g., in Server Components)
          // This is expected behavior when used in Server Components
          console.warn('Cannot set cookie in current context:', error.message)
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Silently fail if we can't remove cookies (e.g., in Server Components)
          // This is expected behavior when used in Server Components
          console.warn('Cannot remove cookie in current context:', error.message)
        }
      },
    },
  })
}
