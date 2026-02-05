-- Add UPDATE policy for look_items table to allow reordering items within looks
CREATE POLICY "Users can update items in their own looks"
ON public.look_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM looks
  WHERE looks.id = look_items.look_id
  AND looks.user_id = auth.uid()
));