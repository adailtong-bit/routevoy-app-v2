# Hierarchical Access Control & Defensive Rendering Report

## Modified Components

1. **`src/hooks/use-auth.tsx`**
   - Added `HierarchyContext` to expose `isMaster`, `isFranchisee`, `isMerchant`, `isAffiliate` booleans.
   - Provided helper functions `canAccessFranchise`, `canAccessCompany`, `canAccessAffiliate` to validate UI components before rendering.
   - Refined the `profile` loading and synchronization logic.

2. **`src/App.tsx`**
   - Updated `RequireAuth` to use the new `hierarchy` object from `use-auth.tsx`.
   - Replaced basic role checks with strict prefix-based path checks (`/franchisee`, `/merchant`, `/affiliate`) validating against `hierarchy.isFranchisee`, `hierarchy.isMerchant`, etc.
   - Added fallback empty arrays (`roles || []`) to avoid `.includes()` on undefined.

3. **`src/pages/Index.tsx`**
   - Added a safe wrapper around the `user` object (`safeUser`).
   - Reinforced the `loading` guard.

4. **`src/components/MobileHeader.tsx` & `src/components/DesktopHeader.tsx`**
   - Implemented defensive array checks `(CATEGORIES || []).filter(c => c?.id && ...)` to prevent runtime errors like `TypeError: Cannot read properties of undefined (reading 'filter')`.
   - Verified that `user.role` is defined before calling `.includes(user.role)`.

## Database & RLS Migration

1. **`supabase/migrations/20260613161000_update_rls_hierarchy.sql`**
   - **Data Cleanup:** An initial `DO $` block finds and nullifies `franchise_id` and `company_id` in `public.profiles` if they reference non-existent records in `public.franchises` or `public.merchants`.
   - **`check_hierarchy_access` Function:** This Postgres function receives `target_table`, `p_franchise_id`, `p_company_id`, `p_affiliate_id`, and `p_user_id`.
     - It bypasses checks for `adailtong@gmail.com` or `super_admin`/`admin`.
     - For `franchisee`, it validates if the user's `franchise_id` matches the target's `franchise_id`.
     - For `merchant`/`shopkeeper`, it validates if the user's `company_id` matches the target's `company_id`.
     - For `affiliate`, it fetches the `affiliate_partners.id` and validates against `p_affiliate_id`.
     - For end users, it validates `p_user_id` against `auth.uid()`.
   - **RLS Policies Applied:**
     - `coupons`
     - `ad_campaigns`
     - `merchants`
     - `profiles`
     - `affiliate_partners`
