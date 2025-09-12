# Supabase Setup for Media Storage

## Storage Bucket Setup

To enable image and video uploads, you need to create a storage bucket in your Supabase project:

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create a new bucket"
4. Name: `media`
5. Make it public: **Yes** (so uploaded images/videos can be accessed)
6. File size limit: 10MB (or adjust as needed)
7. Allowed MIME types: `image/*,video/*`

### 2. Set Bucket Policies

Create the following RLS policies for the `media` bucket:

#### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Allow authenticated users to upload media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media');
```

#### Policy 2: Allow public read access
```sql
CREATE POLICY "Allow public read access to media" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'media');
```

#### Policy 3: Allow users to delete their own uploads
```sql
CREATE POLICY "Allow users to delete their own media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test Upload

After setup, test the upload functionality by:
1. Going to the report form
2. Selecting an image or video file
3. Submitting the form
4. Check the Supabase Storage dashboard to see if the file was uploaded

## File Structure

Uploaded files will be stored in the following structure:
```
media/
  reports/
    1703123456789-abc123def456.jpg
    1703123456790-xyz789uvw012.mp4
```

The filename format is: `{timestamp}-{randomString}.{extension}`

## Supported File Types

- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, QuickTime
- **Max Size**: 10MB per file

## Troubleshooting

### Upload fails with 403 error
- Check that the bucket is public
- Verify RLS policies are correctly set
- Ensure the user is authenticated

### Files not accessible
- Verify the bucket is public
- Check the public read policy is in place
- Ensure the file URL is correctly generated

### Large file uploads fail
- Check the file size limit in bucket settings
- Verify the 10MB limit in the upload API
- Consider implementing chunked uploads for larger files
