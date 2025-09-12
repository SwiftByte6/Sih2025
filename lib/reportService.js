import { supabase } from "@/lib/supabaseClient";

export async function uploadMediaAndCreateReport({ userId, title, description, type, file, latitude, longitude }) {
  try {
    let imageUrl = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("reports-media") // bucket name must match Supabase storage
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("reports-media")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // Insert into reports table
    const { data, error } = await supabase.from("reports").insert([
      {
        user_id: userId,
        title,
        description,
        type,          // must be one of: flood, cyclone, erosion, pollution, other
        image_url: imageUrl,
        latitude,
        longitude,
      },
    ]);

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("uploadMediaAndCreateReport error:", err.message);
    throw err;
  }
}
