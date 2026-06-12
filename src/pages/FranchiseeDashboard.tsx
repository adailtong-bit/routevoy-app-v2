import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'
import { supabase } from '@/lib/supabase/client'
import { Store, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { FranchiseeSidebar } from '@/components/franchisee/FranchiseeSidebar'
import { FranchiseeOverviewTab } from '@/components/franchisee/FranchiseeOverviewTab'
import { FranchiseeMerchantsTab } from '@/components/franchisee/FranchiseeMerchantsTab'
import { FranchiseeAffiliatesTab } from '@/components/franchisee/FranchiseeAffiliatesTab'
import { FranchiseeSettingsTab } from '@/components/franchisee/FranchiseeSettingsTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { FranchiseeAdsTab } from '@/components/franchisee/FranchiseeAdsTab'
import {
  CrawlerSourcesTab,
  CrawlerLogsTab,
} from '@/components/franchisee/FranchiseeCrawlerTabs'
import { FinanceTab, BillingTab } from '@/components/franchisee/FinanceTabs'

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
            <div className="animate-fade-in-up">
              <FranchiseeOverviewTab franchise={franchise} />
            </div>
          )}
          {activeTab === 'merchant-management' && (
            <div className="animate-fade-in-up">
              <FranchiseeMerchantsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'affiliate-partners' && (
            <div className="animate-fade-in-up">
              <FranchiseeAffiliatesTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="animate-fade-in-up">
              <FranchiseeSettingsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'customers-leads' && (
            <div className="animate-fade-in-up">
              <AdminCRM franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'coupons-promos' && (
            <div className="animate-fade-in-up">
              <VendorCampaignsTab
                coupons={franchiseCoupons}
                company={{ id: franchise.id, franchiseId: franchise.id }}
              />
            </div>
          )}
          {activeTab === 'marketing-campaigns' && (
            <div className="animate-fade-in-up">
              <AdminCRM franchiseId={franchise.id} defaultTab="comms" />
            </div>
          )}
          {activeTab === 'ad-campaigns' && (
            <div className="animate-fade-in-up">
              <FranchiseeAdsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'crawler-sources' && (
            <div className="animate-fade-in-up">
              <CrawlerSourcesTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'crawler-logs' && (
            <div className="animate-fade-in-up">
              <CrawlerLogsTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'revenue-share' && (
            <div className="animate-fade-in-up">
              <FinanceTab franchiseId={franchise.id} />
            </div>
          )}
          {activeTab === 'invoices-billing' && (
            <div className="animate-fade-in-up">
              <BillingTab franchiseId={franchise.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
