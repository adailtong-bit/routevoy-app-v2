DO $$
BEGIN
  -- Drop FK on crm_campaigns referencing coupons to allow linking to ad_campaigns
  ALTER TABLE public.crm_campaigns DROP CONSTRAINT IF EXISTS crm_campaigns_linked_offer_id_fkey;
  
  -- Drop FK on user_engagements referencing discovered_promotions to allow linking to ad_campaigns
  ALTER TABLE public.user_engagements DROP CONSTRAINT IF EXISTS user_engagements_campaign_id_fkey;
END $$;
