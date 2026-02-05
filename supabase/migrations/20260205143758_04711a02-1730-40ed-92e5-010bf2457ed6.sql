-- Make wardrobe bucket private for user privacy
-- 1. Remove public access policy
DROP POLICY IF EXISTS "Public can view wardrobe images" ON storage.objects;

-- 2. Update bucket to private
UPDATE storage.buckets SET public = false WHERE id = 'wardrobe';

-- 3. Ensure authenticated users can still access their own images
-- (These policies should already exist, but let's make sure)
DROP POLICY IF EXISTS "Users can view their own wardrobe images" ON storage.objects;
CREATE POLICY "Users can view their own wardrobe images"
ON storage.objects FOR SELECT
USING (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);