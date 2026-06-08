ALTER TABLE public.discovered_promotions
ADD COLUMN IF NOT EXISTS engagement_threshold integer,
ADD COLUMN IF NOT EXISTS reward_type text,
ADD COLUMN IF NOT EXISTS reward_value numeric,
ADD COLUMN IF NOT EXISTS reward_description text,
ADD COLUMN IF NOT EXISTS reward_scope text;

DO $$
BEGIN
  CREATE OR REPLACE FUNCTION public.check_engagement_reward()
  RETURNS trigger AS $func$
  DECLARE
    v_promo record;
    v_count integer;
    v_coupon_id uuid;
    v_company record;
  BEGIN
    -- Only process social shares
    IF NEW.action_type != 'social_share' THEN
      RETURN NEW;
    END IF;

    -- Get promotion
    SELECT * INTO v_promo FROM public.discovered_promotions WHERE id = NEW.campaign_id;
    IF NOT FOUND OR v_promo.engagement_threshold IS NULL OR v_promo.engagement_threshold <= 0 THEN
      RETURN NEW;
    END IF;

    -- Count user shares
    SELECT count(*) INTO v_count FROM public.user_engagements 
    WHERE campaign_id = NEW.campaign_id AND user_id = NEW.user_id AND action_type = 'social_share';

    -- Check if threshold just met
    IF v_count = v_promo.engagement_threshold THEN
      -- Get company info
      SELECT * INTO v_company FROM public.merchants WHERE id = v_promo.company_id;
      
      -- Generate coupon
      v_coupon_id := gen_random_uuid();
      INSERT INTO public.coupons (
        id, title, description, discount, price, original_price, 
        image_url, store_name, start_date, end_date, 
        status, environment, user_id, is_featured
      ) VALUES (
        v_coupon_id,
        COALESCE(v_promo.reward_description, 'Engagement Reward'),
        'Reward for engaging with ' || v_promo.title,
        CASE 
          WHEN v_promo.reward_type = 'Compound Discount' THEN v_promo.reward_value::text || '% + ' || v_promo.discount
          WHEN v_promo.reward_type = 'Standard Discount' THEN v_promo.reward_value::text || '%'
          WHEN v_promo.reward_type = 'Store Credit (Fixed Value)' THEN '$' || v_promo.reward_value::text
          ELSE 'Free Item'
        END,
        0,
        v_promo.reward_value,
        v_promo.image_url,
        COALESCE(v_company.name, v_promo.store_name),
        now(),
        now() + interval '30 days',
        'active',
        v_promo.environment,
        NEW.user_id,
        false
      );

      -- Notify user
      INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
      VALUES ('REWARD_EARNED', 'coupon', v_coupon_id::text, 'Engagement reward generated for campaign ' || v_promo.id::text, NEW.user_id);
    END IF;

    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS trg_check_engagement_reward ON public.user_engagements;
  CREATE TRIGGER trg_check_engagement_reward
  AFTER INSERT ON public.user_engagements
  FOR EACH ROW EXECUTE FUNCTION public.check_engagement_reward();
END $$;
