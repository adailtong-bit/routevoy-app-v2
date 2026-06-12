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
import { FranchiseeAdsTab } from '@/components/franchisee/FranchiseeAdsTab'
import { FinanceTab, BillingTab } from '@/components/franchisee/FinanceTabs'
import { SeasonalTab } from '@/components/franchisee/OperationalTabs'
import { InsightsTab } from '@/components/franchisee/ExtraTabs'
import { FranchiseeHierarchyTab } from '@/components/franchisee/FranchiseeHierarchyTab'
import { FranchiseeApprovalsTab } from '@/components/franchisee/FranchiseeApprovalsTab'
import { FranchiseeCrawlerTab } from '@/components/franchisee/FranchiseeCrawlerTab'

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

      if (currentFranchiseId) {
        const { data } = await supabase
          .from('franchises')
          .select('*')
          .eq('id', currentFranchiseId)
          .maybeSingle()
        setFranchise(data)
      }
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

  if (!franchise) {
    return (
      <div className="container py-16 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Franchise Profile Not Found
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Please contact the administrator to link your account to a franchise.
        </p>
        <div className="flex gap-4 mt-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="px-8 font-bold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const franchiseCoupons = coupons.filter((c) => c.franchiseId === franchise.id)

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
              <VendorCampaignsTab
                coupons={franchiseCoupons}
                company={{ id: franchise.id, franchiseId: franchise.id }}
              />
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
              <FranchiseeAdsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'network-advertising' && (
            <div className="animate-fade-in-up">
              <FranchiseeAdsTab franchiseId={franchise.id} />
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
        </div>
      </main>
    </div>
  )
}
