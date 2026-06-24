-- Fix "permission denied for table users" by updating functions that query auth.users
-- to use SECURITY DEFINER and fixing RLS policies on affiliate_partners and profiles

-- 1. Redefine check_hierarchy_access as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.check_hierarchy_access(
  p_target_table text,
  p_franchise_id text DEFAULT NULL,
  p_company_id text DEFAULT NULL,
  p_affiliate_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  v_user_role text;
  v_user_franchise_id text;
  v_user_company_id text;
  v_user_email text;
BEGIN
  -- Always allow master email safely
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  IF v_user_email = 'adailtong@gmail.com' THEN
    RETURN true;
  END IF;

  SELECT role, franchise_id, company_id 
  INTO v_user_role, v_user_franchise_id, v_user_company_id
  FROM public.profiles 
  WHERE id = p_user_id;

  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN true;
  END IF;

  IF v_user_role = 'franchisee' AND p_franchise_id IS NOT NULL THEN
    RETURN v_user_franchise_id = p_franchise_id;
  END IF;

  IF v_user_role IN ('merchant', 'shopkeeper') AND p_company_id IS NOT NULL THEN
    RETURN v_user_company_id = p_company_id;
  END IF;

  -- Default deny
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_hierarchy_access(
  p_target_table text,
  p_franchise_id uuid,
  p_company_id uuid,
  p_affiliate_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  RETURN public.check_hierarchy_access(
    p_target_table, 
    p_franchise_id::text, 
    p_company_id::text, 
    p_affiliate_id, 
    p_user_id
  );
END;
$function$;

-- 2. Clean up affiliate_partners policies and recreate
DROP POLICY IF EXISTS "admin_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "admin_insert_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_insert_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_own_update" ON public.affiliate_partners;
DROP POLICY IF EXISTS "affiliate_update_own" ON public.affiliate_partners;
DROP POLICY IF EXISTS "auth_read_own_affiliate" ON public.affiliate_partners;
DROP POLICY IF EXISTS "authenticated_insert_affiliate_partners" ON public.affiliate_partners;
DROP POLICY IF EXISTS "authenticated_update_affiliate_partners" ON public.affiliate_partners;
DROP POLICY IF EXISTS "ensure_hierarchy_select_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "franchisee_all_affiliates" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_all" ON public.affiliate_partners;
DROP POLICY IF EXISTS "hierarchy_affiliates_select" ON public.affiliate_partners;
DROP POLICY IF EXISTS "master_bypass_affiliate_partners" ON public.affiliate_partners;

-- Clean, non-recursive, safely checkable policies for affiliate_partners
CREATE POLICY "affiliates_read_access" ON public.affiliate_partners
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role IN ('admin', 'super_admin') 
        OR profiles.email = 'adailtong@gmail.com'
        OR (profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id)
      )
    )
  );

CREATE POLICY "affiliates_insert_access" ON public.affiliate_partners
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role IN ('admin', 'super_admin') 
        OR profiles.email = 'adailtong@gmail.com'
      )
    )
  );

CREATE POLICY "affiliates_update_access" ON public.affiliate_partners
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role IN ('admin', 'super_admin') 
        OR profiles.email = 'adailtong@gmail.com'
        OR (profiles.role = 'franchisee' AND profiles.franchise_id = affiliate_partners.franchise_id)
      )
    )
  );

CREATE POLICY "affiliates_delete_access" ON public.affiliate_partners
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.role IN ('admin', 'super_admin') 
        OR profiles.email = 'adailtong@gmail.com'
      )
    )
  );

-- 3. Fix profiles policies to prevent recursion
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() 
    OR email = 'adailtong@gmail.com'
  );

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    id = auth.uid() 
    OR email = 'adailtong@gmail.com'
  );

-- 4. Create missing basic RLS for users fetching self data
CREATE OR REPLACE FUNCTION public.get_auth_user_affiliate_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.affiliate_partners WHERE user_id = auth.uid() LIMIT 1;
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_auth_user_company_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  v_id text;
BEGIN
  SELECT company_id INTO v_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_auth_user_franchise_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  v_id text;
BEGIN
  SELECT franchise_id INTO v_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN v_id;
END;
$function$;
