
-- Create outfit_logs table for daily outfit tracking
CREATE TABLE public.outfit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  wardrobe_item_ids UUID[] NOT NULL DEFAULT '{}',
  photo_url TEXT,
  occasion TEXT DEFAULT 'casual',
  weather_snapshot JSONB,
  from_ai_suggestion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one log per user per day
ALTER TABLE public.outfit_logs ADD CONSTRAINT outfit_logs_user_date_unique UNIQUE (user_id, date);

-- Enable RLS
ALTER TABLE public.outfit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own outfit logs"
ON public.outfit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfit logs"
ON public.outfit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit logs"
ON public.outfit_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit logs"
ON public.outfit_logs FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast date range queries
CREATE INDEX idx_outfit_logs_user_date ON public.outfit_logs (user_id, date);
