-- ============================================
-- SUPABASE STORAGE BUCKET SETUP FOR MEDIA UPLOADS
-- ============================================

-- 1. Create the media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,  -- Make it public so uploaded files can be accessed
  10485760,  -- 10MB file size limit (in bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- 2. Enable Row Level Security (RLS) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow authenticated users to upload files to media bucket
CREATE POLICY "Allow authenticated users to upload media" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 4. Create policy to allow public read access to media files
CREATE POLICY "Allow public read access to media" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'media');

-- 5. Create policy to allow users to delete their own uploaded files
CREATE POLICY "Allow users to delete their own media" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Create policy to allow users to update their own uploaded files
CREATE POLICY "Allow users to update their own media" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- ALTERNATIVE: If you want to allow anonymous uploads
-- ============================================

-- Uncomment the following if you want to allow anonymous users to upload
-- (Not recommended for production, but useful for testing)

/*
-- Allow anonymous users to upload
CREATE POLICY "Allow anonymous uploads to media" 
ON storage.objects
FOR INSERT 
TO anon
WITH CHECK (bucket_id = 'media');

-- Allow anonymous users to read
CREATE POLICY "Allow anonymous read access to media" 
ON storage.objects
FOR SELECT 
TO anon
USING (bucket_id = 'media');
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'media';

-- Check all policies on storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- CLEANUP QUERIES (if needed)
-- ============================================

-- To remove all policies (run these if you need to reset):
/*
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous read access to media" ON storage.objects;
*/

-- To delete the bucket (run this if you need to start over):
/*
DELETE FROM storage.buckets WHERE id = 'media';
*/
