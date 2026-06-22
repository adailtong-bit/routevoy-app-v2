CREATE OR REPLACE FUNCTION public.validate_promotion_by_code(p_code text)
RETURNS jsonb AS $$
DECLARE
  v_promo record;
  v_coupon record;
BEGIN
  -- 1. Check in discovered_promotions
  SELECT * INTO v_promo FROM public.discovered_promotions WHERE code = p_code LIMIT 1;
  IF FOUND THEN
    IF v_promo.status != 'active' AND v_promo.status != 'published' AND v_promo.status != 'approved' THEN
      RETURN jsonb_build_object('success', false, 'message', 'Voucher is not active');
    END IF;
    IF v_promo.end_date IS NOT NULL AND v_promo.end_date < now() THEN
      RETURN jsonb_build_object('success', false, 'message', 'Voucher has expired');
    END IF;
    RETURN jsonb_build_object(
      'success', true,
      'id', v_promo.id,
      'type', 'discovered_promotion',
      'title', v_promo.title,
      'description', v_promo.description,
      'discount', v_promo.discount,
      'discount_percentage', v_promo.discount_percentage,
      'original_price', v_promo.original_price,
      'store_name', v_promo.store_name
    );
  END IF;

  -- 2. Check in coupons
  SELECT * INTO v_coupon FROM public.coupons WHERE code = p_code LIMIT 1;
  IF FOUND THEN
    IF v_coupon.status != 'active' THEN
      RETURN jsonb_build_object('success', false, 'message', 'Voucher is not active');
    END IF;
    IF v_coupon.end_date IS NOT NULL AND v_coupon.end_date < now() THEN
      RETURN jsonb_build_object('success', false, 'message', 'Voucher has expired');
    END IF;
    RETURN jsonb_build_object(
      'success', true,
      'id', v_coupon.id,
      'type', 'coupon',
      'title', v_coupon.title,
      'description', v_coupon.description,
      'discount', v_coupon.discount,
      'original_price', v_coupon.original_price,
      'store_name', v_coupon.store_name
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'message', 'Voucher code not found');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.consume_promotion(p_promo_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  v_promo record;
  v_coupon record;
BEGIN
  -- Try discovered_promotions
  SELECT * INTO v_promo FROM public.discovered_promotions WHERE id = p_promo_id;
  IF FOUND THEN
    UPDATE public.discovered_promotions
    SET usage_count = COALESCE(usage_count, 0) + 1
    WHERE id = p_promo_id;
    
    IF p_user_id IS NOT NULL THEN
      INSERT INTO public.user_engagements (user_id, campaign_id, action_type)
      VALUES (p_user_id, p_promo_id, 'consume_promotion');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'message', 'Promotion consumed successfully');
  END IF;

  -- Try coupons
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_promo_id;
  IF FOUND THEN
    UPDATE public.coupons
    SET usage_count = COALESCE(usage_count, 0) + 1
    WHERE id = p_promo_id;
    
    IF p_user_id IS NOT NULL THEN
      INSERT INTO public.user_engagements (user_id, campaign_id, action_type)
      VALUES (p_user_id, p_promo_id, 'consume_coupon');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'message', 'Coupon consumed successfully');
  END IF;

  RETURN jsonb_build_object('success', false, 'message', 'Promotion not found');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
