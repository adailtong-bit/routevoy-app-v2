import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Store, Menu, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FranchiseeSidebar } from '@/components/franchisee/FranchiseeSidebar'
import { MerchantsTab } from '@/components/admin/hierarchy/MerchantsTab'
import { StaffTab } from '@/components/admin/hierarchy/StaffTab'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { FranchiseeOverviewTab } from '@/components/franchisee/FranchiseeOverviewTab'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import {
  FinanceTab,
  BillingTab,
  MonetizationTab,
  AdsRoyaltiesTab,
} from '@/components/franchisee/FinanceTabs'
import { InterestsTab } from '@/components/franchisee/OperationalTabs'
import { AdminSeasonalTab } from '@/components/admin/AdminSeasonalTab'

import { PromotionCrawler } from '@/components/admin/PromotionCrawler'
import { DataInsightsTab } from '@/components/admin/DataInsightsTab'
import { TestingSandboxTab } from '@/components/admin/TestingSandboxTab'
import { FranchiseeSettingsTab } from '@/components/franchisee/FranchiseeSettingsTab'
import { RegionalPreLaunchList } from '@/components/franchisee/RegionalPreLaunchList'
import { PartnerPoliciesTab } from '@/components/admin/PartnerPoliciesTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { useLanguage } from '@/stores/LanguageContext'

export default function FranchiseeDashboard() {
  const { franchises, companies, coupons: allCoupons } = useCouponStore()
  const { user, role, profile } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [isCheckingFranchise, setIsCheckingFranchise] = useState(true)
  const [dbFranchise, setDbFranchise] = useState<any>(null)

  const fetchFranchise = async (isMounted = true) => {
    if (!user?.email) {
      if (isMounted) setIsCheckingFranchise(false)
      return
    }
    if (isMounted) setIsCheckingFranchise(true)
    try {
      const { data } = await supabase
        .from('franchises')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
      if (data) {
        if (isMounted) setDbFranchise(data)
      } else {
        // Auto-heal logic
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (
          profile?.role === 'franchisee' ||
          profile?.role === 'admin' ||
          profile?.role === 'super_admin' ||
          user.email === 'adailtong@gmail.com'
        ) {
          const { data: newFranchise } = await supabase
            .from('franchises')
            .insert({
              id: crypto.randomUUID(),
              email: user.email,
              name:
                user.user_metadata?.name ||
                user.email.split('@')[0] + ' Franchise',
            })
            .select()
            .single()
          if (newFranchise && isMounted) setDbFranchise(newFranchise)
        }
      }
    } catch (err) {
      console.error('Error fetching franchise:', err)
    } finally {
      if (isMounted) setIsCheckingFranchise(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchFranchise(isMounted)
    return () => {
      isMounted = false
    }
  }, [user])

  const isSuperAdmin =
    role === 'super_admin' || user?.email === 'adailtong@gmail.com'

  const myFranchise =
    dbFranchise ||
    franchises.find(
      (f) =>
        f.ownerId === user?.id ||
        f.ownerId === user?.email ||
        f.email === user?.email ||
        f.contactEmail === user?.email ||
        f.id === profile?.franchiseId,
    )

  const mockFranchise = {
    id: 'mock-franchise-admin',
    name: 'Franquia Teste (Visão Admin)',
    addressCountry: 'USA',
  } as any

  // Fallback to first franchise for super admins testing the view
  const franchiseToUse =
    myFranchise || (isSuperAdmin ? franchises[0] || mockFranchise : null)

  if (isCheckingFranchise) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">
          {t('common.loading', 'Loading dashboard...')}
        </p>
      </div>
    )
  }

  if (!franchiseToUse) {
    return (
      <div className="container py-16 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {t('franchisee.no_franchise', 'No associated franchise found')}
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          {t(
            'franchisee.no_franchise_desc',
            'Your profile is configured as a Franchisee, but there is no regional unit linked to your email ({email}) yet. Contact the Administrator.',
          ).replace('{email}', user?.email || '')}
        </p>
        <div className="flex gap-4 mt-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="px-8 font-bold"
          >
            {t('common.back_home', 'Back to Home')}
          </Button>
          <Button
            onClick={() => fetchFranchise(true)}
            className="px-8 font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.sync_profile', 'Sync Profile')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 w-full relative z-0">
      <FranchiseeSidebar
        myFranchise={franchiseToUse}
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white shrink-0">
          <h1 className="font-bold text-lg truncate pr-4">
            {franchiseToUse.name}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar w-full relative pb-24 md:pb-6">
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <FranchiseeOverviewTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'campaigns' && (
            <div className="animate-fade-in-up">
              <VendorCampaignsTab
                coupons={allCoupons.filter(
                  (c) =>
                    c.source !== 'aggregated' &&
                    (isSuperAdmin ||
                      companies.some(
                        (comp) =>
                          comp.franchiseId === franchiseToUse.id &&
                          comp.id === c.companyId,
                      )),
                )}
                company={franchiseToUse}
              />
              <div className="mt-8 bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-slate-800">
                  Regional Pre-Launch Campaigns
                </h3>
                <RegionalPreLaunchList
                  franchiseId={franchiseToUse.id}
                  isSuperAdmin={isSuperAdmin}
                />
              </div>
            </div>
          )}
          {activeTab === 'merchants' && (
            <div className="animate-fade-in-up">
              <MerchantsTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'team' && (
            <div className="animate-fade-in-up">
              <StaffTab parentType="franchise" parentId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'crm' && (
            <div className="animate-fade-in-up bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-bold mb-4">
                {t('franchisee.crm_regional_title', 'Regional CRM')}
              </h2>
              <p className="text-slate-600 mb-4">
                {t(
                  'franchisee.crm_regional_desc',
                  'Manage audience groups for your entire franchise network.',
                )}
              </p>
              <TargetGroupsTab />
            </div>
          )}
          {activeTab === 'leads' && (
            <div className="animate-fade-in-up bg-white p-6 rounded-xl border shadow-sm">
              <AdminCRM franchiseId={franchiseToUse.id} />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="animate-fade-in-up">
              <FinanceTab />
            </div>
          )}
          {activeTab === 'billing' && (
            <div className="animate-fade-in-up">
              <BillingTab />
            </div>
          )}
          {activeTab === 'monetization' && (
            <div className="animate-fade-in-up">
              <MonetizationTab />
            </div>
          )}
          {activeTab === 'ads-royalties' && (
            <div className="animate-fade-in-up">
              <AdsRoyaltiesTab />
            </div>
          )}

          {activeTab === 'seasonal' && (
            <div className="animate-fade-in-up">
              <AdminSeasonalTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'categories' && (
            <div className="animate-fade-in-up">
              <AdminCategoriesTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'interests' && (
            <div className="animate-fade-in-up">
              <InterestsTab />
            </div>
          )}
          {activeTab === 'policies' && (
            <div className="animate-fade-in-up">
              <PartnerPoliciesTab franchiseId={franchiseToUse.id} />
            </div>
          )}

          {activeTab === 'crawler' && (
            <div className="animate-fade-in-up">
              <PromotionCrawler franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="animate-fade-in-up">
              <DataInsightsTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'sandbox' && (
            <div className="animate-fade-in-up">
              <TestingSandboxTab />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="animate-fade-in-up">
              <FranchiseeSettingsTab franchiseId={franchiseToUse.id} />
            </div>
          )}

          {/* Fallback for other tabs in development */}
          {![
            'overview',
            'campaigns',
            'merchants',
            'team',
            'crm',
            'leads',
            'finance',
            'billing',
            'monetization',
            'ads-royalties',
            'seasonal',
            'categories',
            'interests',
            'policies',
            'crawler',
            'insights',
            'sandbox',
            'settings',
          ].includes(activeTab) && (
            <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {t('franchisee.module_dev', 'Module in Development')}
              </h3>
              <p className="text-slate-500">
                {t(
                  'franchisee.module_dev_desc',
                  'The selected feature ({tab}) is currently being deployed to your dashboard.',
                ).replace('{tab}', activeTab)}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
