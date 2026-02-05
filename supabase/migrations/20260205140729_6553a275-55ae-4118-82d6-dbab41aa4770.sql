-- Add ownership status to wardrobe_items table
-- 'owned' = real items in physical wardrobe
-- 'saved' = wishlist/saved items from Pinterest, websites, screenshots

ALTER TABLE public.wardrobe_items 
ADD COLUMN ownership_status text NOT NULL DEFAULT 'owned';

-- Add constraint to ensure valid values
ALTER TABLE public.wardrobe_items
ADD CONSTRAINT wardrobe_items_ownership_status_check 
CHECK (ownership_status IN ('owned', 'saved'));

-- Add index for filtering by ownership status
CREATE INDEX idx_wardrobe_items_ownership_status ON public.wardrobe_items(ownership_status);

-- Add source_url column for saved items (Pinterest link, website URL, etc.)
ALTER TABLE public.wardrobe_items 
ADD COLUMN source_url text;