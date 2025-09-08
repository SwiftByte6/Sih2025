import { createClient } from "@supabase/supabase-js"

export function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "Supabase server environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    )
  }

  return createClient(supabaseUrl || "", serviceRoleKey || "")
}


