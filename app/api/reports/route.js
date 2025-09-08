import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServerClient"

const REPORTS_TABLE = "reports"
const STORAGE_BUCKET = "reports-media"

export async function POST(request) {
  try {
    const supabaseServer = getSupabaseServer()
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
    }

    const form = await request.formData()
    const hazardType = form.get("hazardType")
    const description = form.get("description")
    const latitude = form.get("latitude")
    const longitude = form.get("longitude")
    const media = form.get("media")

    if (!hazardType || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let mediaUrl = null
    if (media && typeof media === "object" && "arrayBuffer" in media) {
      const fileName = media.name || `upload_${Date.now()}`
      const fileExt = fileName.includes(".") ? fileName.split(".").pop() : "bin"
      const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`

      const arrayBuffer = await media.arrayBuffer()
      const fileBytes = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await supabaseServer.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileBytes, {
          contentType: media.type || "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        })
      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 })
      }

      const { data: publicUrlData } = supabaseServer.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
      mediaUrl = publicUrlData?.publicUrl || null
    }

    const { data, error } = await supabaseServer
      .from(REPORTS_TABLE)
      .insert([
        {
          hazard_type: hazardType,
          description,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          media_url: mediaUrl,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ report: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}


