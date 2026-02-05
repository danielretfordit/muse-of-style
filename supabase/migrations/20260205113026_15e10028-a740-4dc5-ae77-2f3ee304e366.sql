-- Extend profiles table with style preferences and measurements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS body_type text,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS weight integer,
ADD COLUMN IF NOT EXISTS chest integer,
ADD COLUMN IF NOT EXISTS waist integer,
ADD COLUMN IF NOT EXISTS hips integer,
ADD COLUMN IF NOT EXISTS shoe_size text,
ADD COLUMN IF NOT EXISTS preferred_styles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite_colors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS disliked_colors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_brands text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_min integer,
ADD COLUMN IF NOT EXISTS budget_max integer,
ADD COLUMN IF NOT EXISTS occasion_preferences jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_country text,
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS style_avatars jsonb DEFAULT '[]';

-- Create storage bucket for profile photos/avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile bucket
CREATE POLICY "Users can view all profile images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);