import { supabase } from "@/lib/supabaseClient";
import { storeReportOffline, isOnline } from "./offlineService";

export async function fetchRecentReports(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, title, type, description, latitude, longitude, created_at, status, image_url')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("fetchRecentReports error:", err.message);
    throw err;
  }
}

export async function uploadMediaAndCreateReport({ userId, title, description, type, file, latitude, longitude }) {
  try {
    // Check if we're online
    if (!isOnline()) {
      console.log("Device is offline, storing report locally")
      const offlineReport = {
        userId,
        title,
        description,
        type,
        latitude,
        longitude,
        mediaFile: file
      }
      
      const offlineId = await storeReportOffline(offlineReport)
      return { id: offlineId, status: 'offline', message: 'Report stored offline and will be synced when connection is restored' }
    }

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
    ]).select();

    if (error) throw error;

    console.log('Report inserted successfully:', data);
    return data;
  } catch (err) {
    console.error("uploadMediaAndCreateReport error:", err.message);
    
    // If online but upload failed, try to store offline as fallback
    if (isOnline()) {
      console.log("Upload failed, attempting to store offline as fallback")
      try {
        const offlineReport = {
          userId,
          title,
          description,
          type,
          latitude,
          longitude,
          mediaFile: file
        }
        
        const offlineId = await storeReportOffline(offlineReport)
        return { id: offlineId, status: 'offline_fallback', message: 'Upload failed, report stored offline for retry' }
      } catch (offlineErr) {
        console.error("Offline storage also failed:", offlineErr)
      }
    }
    
    throw err;
  }
}
