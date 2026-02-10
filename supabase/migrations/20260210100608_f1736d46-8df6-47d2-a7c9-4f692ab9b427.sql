-- Make profiles bucket private
UPDATE storage.buckets SET public = false WHERE id = 'profiles';

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profile images" ON storage.objects;

-- Add owner-only SELECT policy
CREATE POLICY "Users can view their own profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);