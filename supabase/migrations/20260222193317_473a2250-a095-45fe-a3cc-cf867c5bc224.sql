
-- Trigger function to enforce wardrobe item limits based on user's subscription plan
CREATE OR REPLACE FUNCTION public.check_wardrobe_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  item_limit INTEGER;
  current_count INTEGER;
BEGIN
  SELECT s.plan INTO user_plan
  FROM subscriptions s
  WHERE s.user_id = NEW.user_id AND s.status = 'active';

  user_plan := COALESCE(user_plan, 'free');

  SELECT pl.wardrobe_limit INTO item_limit
  FROM plan_limits pl
  WHERE pl.plan = user_plan;

  item_limit := COALESCE(item_limit, 30);

  SELECT COUNT(*) INTO current_count
  FROM wardrobe_items
  WHERE user_id = NEW.user_id;

  IF item_limit != -1 AND current_count >= item_limit THEN
    RAISE EXCEPTION 'Wardrobe limit of % items exceeded for plan %', item_limit, user_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_wardrobe_limit
  BEFORE INSERT ON wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_wardrobe_limit();

-- Trigger function to enforce looks limits based on user's subscription plan
CREATE OR REPLACE FUNCTION public.check_looks_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  item_limit INTEGER;
  current_count INTEGER;
BEGIN
  SELECT s.plan INTO user_plan
  FROM subscriptions s
  WHERE s.user_id = NEW.user_id AND s.status = 'active';

  user_plan := COALESCE(user_plan, 'free');

  SELECT pl.looks_limit INTO item_limit
  FROM plan_limits pl
  WHERE pl.plan = user_plan;

  item_limit := COALESCE(item_limit, 5);

  SELECT COUNT(*) INTO current_count
  FROM looks
  WHERE user_id = NEW.user_id;

  IF item_limit != -1 AND current_count >= item_limit THEN
    RAISE EXCEPTION 'Looks limit of % items exceeded for plan %', item_limit, user_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_looks_limit
  BEFORE INSERT ON looks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_looks_limit();
