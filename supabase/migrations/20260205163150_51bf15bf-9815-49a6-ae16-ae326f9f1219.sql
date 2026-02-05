-- Add season field to wardrobe_items (nullable)
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS season TEXT 
CHECK (season IS NULL OR season IN ('winter', 'summer', 'demi', 'all'));

COMMENT ON COLUMN wardrobe_items.season IS 
  'Сезонность: winter, summer, demi (демисезон), all (универсальная). NULL = не указано, определяется AI визуально';