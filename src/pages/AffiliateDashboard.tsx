import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import {
  LayoutDashboard,
  Link2,
  DollarSign,
  Activity,
  Settings,
} from 'lucide-react'
import { AffiliateExtractionDashboard } from '@/components/affiliate/AffiliateExtractionDashboard'
import { AffiliateExtractedOffers } from '@/components/affiliate/AffiliateExtractedOffers'
import { AffiliateCrawlerHistoryTab } from '@/components/affiliate/AffiliateCrawlerHistoryTab'
import { AffiliateCrawlerSourcesTab } from '@/components/affiliate/AffiliateCrawlerSourcesTab'

export default function AffiliateDashboard() {
  // Correctly fetching `profile` from useAuth to prevent ReferenceError
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            {t('affiliate.dashboard_title', 'Painel do Afiliado')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('affiliate.dashboard_desc', 'Bem-vindo,')}{' '}
            {profile?.name || user?.email}
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <TabsList className="bg-slate-100 border border-slate-200 w-max md:w-auto h-auto p-1">
            <TabsTrigger value="overview" className="py-2.5 px-4 rounded-md">
              <Activity className="w-4 h-4 mr-2" />
              {t('affiliate.tabs.overview', 'Visão Geral')}
            </TabsTrigger>
            <TabsTrigger value="extraction" className="py-2.5 px-4 rounded-md">
              <Link2 className="w-4 h-4 mr-2" />
              {t('affiliate.tabs.extraction', 'Captura de Ofertas')}
            </TabsTrigger>
            <TabsTrigger value="offers" className="py-2.5 px-4 rounded-md">
              <DollarSign className="w-4 h-4 mr-2" />
              {t('affiliate.tabs.offers', 'Ofertas Capturadas')}
            </TabsTrigger>
            <TabsTrigger value="sources" className="py-2.5 px-4 rounded-md">
              <Settings className="w-4 h-4 mr-2" />
              {t('affiliate.tabs.sources', 'Fontes de Captura')}
            </TabsTrigger>
            <TabsTrigger value="history" className="py-2.5 px-4 rounded-md">
              <Activity className="w-4 h-4 mr-2" />
              {t('affiliate.tabs.history', 'Histórico de Varredura')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">
                  {t('affiliate.stats.status', 'Status da Conta')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${profile?.status === 'approved' || profile?.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}
                  ></div>
                  <span className="text-2xl font-bold capitalize">
                    {profile?.status || 'Pendente'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">
                  {t('affiliate.stats.region', 'Região de Atuação')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">
                  {profile?.city && profile?.state
                    ? `${profile.city}, ${profile.state}`
                    : t('common.all_regions', 'Todas as Regiões')}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase">
                  {t('affiliate.stats.commissions', 'Comissões (Este Mês)')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">R$ 0,00</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 shadow-sm mt-6 bg-white">
            <CardHeader>
              <CardTitle>
                {t('affiliate.welcome', 'Bem-vindo ao Painel de Afiliados')}
              </CardTitle>
              <CardDescription>
                {t(
                  'affiliate.welcome_desc',
                  'Aqui você pode gerenciar suas fontes de captura, ofertas extraídas e monitorar seus ganhos. Navegue pelas abas acima para começar.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setActiveTab('extraction')}
                className="font-bold"
              >
                {t('affiliate.start_extraction', 'Começar a Capturar Ofertas')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extraction">
          <AffiliateExtractionDashboard
            franchiseId={profile?.franchise_id || null}
            companyId={profile?.company_id || null}
            affiliateId={profile?.id || null}
          />
        </TabsContent>

        <TabsContent value="offers">
          <AffiliateExtractedOffers
            franchiseId={profile?.franchise_id || null}
            companyId={profile?.company_id || null}
            affiliateId={profile?.id || null}
          />
        </TabsContent>

        <TabsContent value="sources">
          <AffiliateCrawlerSourcesTab
            franchiseId={profile?.franchise_id || null}
            companyId={profile?.company_id || null}
            affiliateId={profile?.id || null}
          />
        </TabsContent>

        <TabsContent value="history">
          <AffiliateCrawlerHistoryTab
            franchiseId={profile?.franchise_id || null}
            companyId={profile?.company_id || null}
            affiliateId={profile?.id || null}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
