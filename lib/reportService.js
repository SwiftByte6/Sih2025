import { supabase } from "./supabaseClient"

const REPORTS_TABLE = "reports"

export async function uploadMediaAndCreateReport({ hazardType, description, location }) {
  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .insert([
      {
        hazard_type: hazardType,
        description,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        media_url: null,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}


