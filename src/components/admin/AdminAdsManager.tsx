import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Megaphone, Building2, Receipt, Settings, Percent } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

import { AdvertisersTab } from './ads/AdvertisersTab'
import { AdCampaignsTab } from './ads/AdCampaignsTab'
import { AdPricingTab } from './ads/AdPricingTab'
import { AdBillingTab } from './ads/AdBillingTab'
import { CommissionRulesManager } from '@/components/admin/CommissionRulesManager'

export function AdminAdsManager() {
  const { user, role } = useAuth()
  const { franchises, companies } = useCouponStore()
  const { t } = useLanguage()

  const isFranchisee = role === 'franchisee'
  const isAdmin = role === 'admin' || role === 'super_admin'
  const myFranchise = franchises.find(
    (f) => f.ownerId === user?.id || f.email === user?.email,
  )
  const environment =
    isFranchisee && myFranchise ? myFranchise.id : 'production'

  const [myCompanyId, setMyCompanyId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const resolveCompany = async () => {
      if (!user) return
      const found = companies.find((c) => c.ownerId === user.id)
      if (found) {
        setMyCompanyId(found.id)
        return
      }
      if (user?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()
        if (data) setMyCompanyId(data.id)
      }
    }
    if (role === 'merchant' || role === 'shopkeeper') {
      resolveCompany()
    }
  }, [user, companies, role])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
            <Megaphone className="w-6 h-6 text-primary" />
            {t('admin.ad_manager.title', 'Publicidade & Anúncios')}
          </h2>
          <p className="text-slate-500">
            {t(
              'admin.ad_manager.desc',
              'Gerencie campanhas, preços e anúncios locais e globais.',
            )}
          </p>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="bg-white border mb-6 flex-wrap h-auto w-full sm:w-auto overflow-x-auto justify-start shadow-sm">
          <TabsTrigger value="campaigns" className="gap-2">
            <Megaphone className="w-4 h-4" />{' '}
            {t('admin.ad_manager.campaigns', 'Campanhas')}
          </TabsTrigger>
          <TabsTrigger value="advertisers" className="gap-2">
            <Building2 className="w-4 h-4" />{' '}
            {t('admin.ad_manager.advertisers', 'Anunciantes')}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <Settings className="w-4 h-4" />{' '}
            {t('admin.ad_manager.pricing', 'Configuração de Preços')}
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <Receipt className="w-4 h-4" />{' '}
            {t('admin.ad_manager.billing', 'Faturamento de Anúncios')}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="commissions" className="gap-2">
              <Percent className="w-4 h-4" />{' '}
              {t('admin.ad_manager.commissions', 'Comissões')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="campaigns">
          <AdCampaignsTab environment={environment} companyId={myCompanyId} />
        </TabsContent>

        <TabsContent value="advertisers">
          <AdvertisersTab environment={environment} />
        </TabsContent>

        <TabsContent value="pricing">
          <AdPricingTab environment={environment} />
        </TabsContent>

        <TabsContent value="billing">
          <AdBillingTab environment={environment} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="commissions">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
              <CommissionRulesManager />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
