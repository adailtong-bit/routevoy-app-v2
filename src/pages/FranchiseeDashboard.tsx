import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'
import { supabase } from '@/lib/supabase/client'
import { Store, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { FranchiseeSidebar } from '@/components/franchisee/FranchiseeSidebar'
import { FranchiseeOverviewTab } from '@/components/franchisee/FranchiseeOverviewTab'
import { FranchiseeCurrentAccountTab } from '@/components/franchisee/FranchiseeCurrentAccountTab'
import { FranchiseeAffiliatesTab } from '@/components/franchisee/FranchiseeAffiliatesTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { CampaignsManager } from '@/components/shared/CampaignsManager'
import { AdCampaignsTab } from '@/components/admin/ads/AdCampaignsTab'
import { FranchiseeAdsTab } from '@/components/franchisee/FranchiseeAdsTab'
import { FinanceTab, BillingTab } from '@/components/franchisee/FinanceTabs'
import { SeasonalTab } from '@/components/franchisee/OperationalTabs'
import { InsightsTab } from '@/components/franchisee/ExtraTabs'
import { FranchiseeHierarchyTab } from '@/components/franchisee/FranchiseeHierarchyTab'
import { FranchiseeApprovalsTab } from '@/components/franchisee/FranchiseeApprovalsTab'
import { FranchiseeCrawlerTab } from '@/components/franchisee/FranchiseeCrawlerTab'
import { FranchiseeMerchantsTab } from '@/components/franchisee/FranchiseeMerchantsTab'
import { FranchiseeAdvertisersTab } from '@/components/franchisee/FranchiseeAdvertisersTab'
import Profile from '@/pages/Profile'

export default function FranchiseeDashboard() {
  const { user, profile, franchiseId } = useAuth()
  const { coupons } = useCouponStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [franchise, setFranchise] = useState<any>(null)

  useEffect(() => {
    async function loadFranchise() {
      if (!user) return
      setIsLoading(true)

      const currentFranchiseId = franchiseId || profile?.franchise_id

      let foundFranchise = null

      if (currentFranchiseId) {
        const { data } = await supabase
          .from('franchises')
          .select('*')
          .eq('id', currentFranchiseId)
          .maybeSingle()
        foundFranchise = data
      }

      if (!foundFranchise && user?.email) {
        // Fallback email match
        const { data } = await supabase
          .from('franchises')
          .select('*')
          .ilike('email', user.email)
          .maybeSingle()
        foundFranchise = data
      }

      if (
        !foundFranchise &&
        (profile?.role === 'super_admin' ||
          profile?.role === 'admin' ||
          user?.email?.toLowerCase() === 'adailtong@gmail.com')
      ) {
        // Admin Master View
        const { data } = await supabase
          .from('franchises')
          .select('*')
          .limit(1)
          .maybeSingle()

        foundFranchise = data || {
          id: 'admin-franchise',
          name: 'Master Franchise',
        }
      }

      setFranchise(foundFranchise || { id: '', name: 'Not Linked' })
      setIsLoading(false)
    }
    loadFranchise()
  }, [user, franchiseId, profile])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    )
  }

  const franchiseCoupons = (coupons || []).filter(
    (c) => c?.franchiseId === franchise?.id,
  )

  return (
    <div className="flex min-h-screen bg-slate-50 w-full relative z-0">
      <FranchiseeSidebar
        franchise={franchise}
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white shrink-0">
          <h1 className="font-bold text-lg truncate pr-4">{franchise.name}</h1>
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
            <FranchiseeOverviewTab franchise={franchise} />
          )}
          {activeTab === 'current-account' && (
            <div className="animate-fade-in-up">
              <FranchiseeCurrentAccountTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'finance' && <FinanceTab franchiseId={franchise.id} />}
          {activeTab === 'merchants' && (
            <div className="animate-fade-in-up">
              <FranchiseeMerchantsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'advertisers' && (
            <div className="animate-fade-in-up">
              <FranchiseeAdvertisersTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'approvals' && (
            <FranchiseeApprovalsTab franchiseId={franchise.id} />
          )}
          {activeTab === 'monetization' && (
            <FranchiseeAdsTab franchiseId={franchise.id} />
          )}
          {activeTab === 'billing' && <BillingTab franchiseId={franchise.id} />}
          {activeTab === 'seasonal-offers' && (
            <div className="animate-fade-in-up">
              <SeasonalTab />
            </div>
          )}

          {activeTab === 'offers-management' && (
            <div className="animate-fade-in-up">
              <AdCampaignsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'crm-campaigns' && (
            <div className="animate-fade-in-up">
              <AdminCRM franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'offers-crawler' && (
            <FranchiseeCrawlerTab franchiseId={franchise.id} />
          )}

          {activeTab === 'advertising-ads' && (
            <div className="animate-fade-in-up">
              <FranchiseeAdsTab franchiseId={franchise.id} isNetwork={false} />
            </div>
          )}
          {activeTab === 'network-advertising' && (
            <div className="animate-fade-in-up">
              <FranchiseeAdsTab franchiseId={franchise.id} isNetwork={true} />
            </div>
          )}
          {activeTab === 'data-insights' && (
            <div className="animate-fade-in-up">
              <InsightsTab />
            </div>
          )}

          {activeTab === 'system-performance' && (
            <div className="animate-fade-in-up">
              <InsightsTab />
            </div>
          )}
          {activeTab === 'push-notifications' && (
            <div className="animate-fade-in-up">
              <AdminCRM franchiseId={franchise.id} defaultTab="comms" />
            </div>
          )}
          {activeTab === 'email-reports' && (
            <div className="animate-fade-in-up">
              <InsightsTab />
            </div>
          )}

          {activeTab === 'hierarchy-team' && (
            <FranchiseeHierarchyTab franchiseId={franchise.id} />
          )}
          {activeTab === 'affiliate-network' && (
            <div className="animate-fade-in-up">
              <FranchiseeAffiliatesTab franchiseId={franchise.id} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-fade-in-up">
              <Profile />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
