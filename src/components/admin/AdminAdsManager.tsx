import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdPricingTab } from './ads/AdPricingTab'
import { AdvertisersTab } from './ads/AdvertisersTab'
import { AdCampaignsTab } from './ads/AdCampaignsTab'
import { AdBillingTab } from './ads/AdBillingTab'
import { LayoutDashboard, Users, DollarSign, FileText } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/hooks/use-auth'

export function AdminAdsManager() {
  const { t } = useLanguage()
  const { role } = useAuth()

  const isAdmin = role === 'admin' || role === 'super_admin'

  return (
    <div className="space-y-6 animate-fade-in-up w-full">
      <div>
        <h2 className="text-2xl font-bold">
          {t('admin.ads', 'Publicidade & Anúncios')}
        </h2>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Gerencie campanhas de anúncios, preços e anunciantes globais.'
            : 'Gerencie suas campanhas de anúncios e faturas.'}
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="campaigns">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Campanhas
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="advertisers">
              <Users className="h-4 w-4 mr-2" /> Anunciantes
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" /> Configuração de Preços
            </TabsTrigger>
          )}
          <TabsTrigger value="billing">
            <FileText className="h-4 w-4 mr-2" />{' '}
            {isAdmin ? 'Faturamento de Anúncios' : 'Minhas Faturas'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="animate-in fade-in-50">
          <ErrorBoundary>
            <AdCampaignsTab />
          </ErrorBoundary>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="advertisers" className="animate-in fade-in-50">
            <ErrorBoundary>
              <AdvertisersTab />
            </ErrorBoundary>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="pricing" className="animate-in fade-in-50">
            <ErrorBoundary>
              <AdPricingTab />
            </ErrorBoundary>
          </TabsContent>
        )}

        <TabsContent value="billing" className="animate-in fade-in-50">
          <ErrorBoundary>
            <AdBillingTab />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
