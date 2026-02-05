-- Create looks table
CREATE TABLE public.looks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT NOT NULL DEFAULT 'casual',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for look items (many-to-many relationship)
CREATE TABLE public.look_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  look_id UUID NOT NULL REFERENCES public.looks(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(look_id, wardrobe_item_id)
);

-- Enable RLS on looks
ALTER TABLE public.looks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for looks
CREATE POLICY "Users can view their own looks"
  ON public.looks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own looks"
  ON public.looks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own looks"
  ON public.looks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own looks"
  ON public.looks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on look_items
ALTER TABLE public.look_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for look_items (based on look ownership)
CREATE POLICY "Users can view items of their own looks"
  ON public.look_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.looks
      WHERE looks.id = look_items.look_id
      AND looks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to their own looks"
  ON public.look_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.looks
      WHERE looks.id = look_items.look_id
      AND looks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their own looks"
  ON public.look_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.looks
      WHERE looks.id = look_items.look_id
      AND looks.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_looks_user_id ON public.looks(user_id);
CREATE INDEX idx_looks_occasion ON public.looks(occasion);
CREATE INDEX idx_looks_is_favorite ON public.looks(is_favorite);
CREATE INDEX idx_look_items_look_id ON public.look_items(look_id);
CREATE INDEX idx_look_items_wardrobe_item_id ON public.look_items(wardrobe_item_id);

-- Add trigger for updated_at
CREATE TRIGGER update_looks_updated_at
  BEFORE UPDATE ON public.looks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();