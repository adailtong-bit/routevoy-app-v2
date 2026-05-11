DO $$
BEGIN
  -- Add code column to support direct code validation
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS code text;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS code text;
END $$;

-- Function to validate a promotion atomic status
CREATE OR REPLACE FUNCTION public.validate_promotion(p_promo_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo record;
BEGIN
  SELECT * INTO v_promo
  FROM public.discovered_promotions
  WHERE id = p_promo_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Promoção não encontrada no banco de dados.');
  END IF;

  IF v_promo.status NOT IN ('published', 'active', 'approved') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Esta promoção encontra-se inativa ou pendente.');
  END IF;

  IF v_promo.end_date IS NOT NULL AND v_promo.end_date < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Esta promoção já expirou.');
  END IF;

  IF v_promo.limit_type = 'limited' AND v_promo.total_limit IS NOT NULL THEN
    IF COALESCE(v_promo.usage_count, 0) >= v_promo.total_limit THEN
      RETURN jsonb_build_object('success', false, 'message', 'Promoção esgotada. O limite de resgates foi atingido.');
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Promoção válida.');
END;
$;

-- Function to validate by string code (PDV Scanner)
CREATE OR REPLACE FUNCTION public.validate_promotion_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo record;
BEGIN
  SELECT * INTO v_promo
  FROM public.discovered_promotions
  WHERE code = p_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código de voucher não encontrado no sistema.');
  END IF;

  RETURN public.validate_promotion(v_promo.id);
END;
$;

-- Function to consume a promotion atomically (avoids race conditions)
CREATE OR REPLACE FUNCTION public.consume_promotion(p_promo_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo record;
  v_usage_count int;
BEGIN
  -- Lock row for update to prevent race conditions during concurrent checkouts
  SELECT * INTO v_promo
  FROM public.discovered_promotions
  WHERE id = p_promo_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Promoção não encontrada.');
  END IF;

  IF v_promo.status NOT IN ('published', 'active', 'approved') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Promoção inativa.');
  END IF;

  IF v_promo.end_date IS NOT NULL AND v_promo.end_date < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Promoção expirada.');
  END IF;

  IF v_promo.limit_type = 'limited' AND v_promo.total_limit IS NOT NULL THEN
    IF COALESCE(v_promo.usage_count, 0) >= v_promo.total_limit THEN
      RETURN jsonb_build_object('success', false, 'message', 'Promoção esgotada. Limite máximo atingido.');
    END IF;
  END IF;

  -- Atomically increment usage
  UPDATE public.discovered_promotions
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = p_promo_id
  RETURNING usage_count INTO v_usage_count;

  -- Log the atomic consumption in the audit trail
  INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
  VALUES ('CONSUME_PROMO', 'promotion', p_promo_id::text, 'Promoção consumida atomicamente com trava transacional', p_user_id);

  RETURN jsonb_build_object('success', true, 'message', 'Voucher validado e consumo registrado com sucesso.', 'new_usage_count', v_usage_count);
END;
$;

-- Basic safeguard trigger setup for future expansion
CREATE OR REPLACE FUNCTION public.check_franchise_promo_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Safe hook for enforcing master franchise limits at the database level later
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trg_check_franchise_promo_limits ON public.discovered_promotions;
CREATE TRIGGER trg_check_franchise_promo_limits
  BEFORE INSERT OR UPDATE ON public.discovered_promotions
  FOR EACH ROW EXECUTE FUNCTION public.check_franchise_promo_limits();
