import { useLanguage } from '@/stores/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, History } from 'lucide-react'
import { AffiliateCrawlerSourcesTab } from './AffiliateCrawlerSourcesTab'
import { AffiliateCrawlerHistoryTab } from './AffiliateCrawlerHistoryTab'

export function AffiliateExtractionDashboard({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId: string | null
  companyId: string | null
  affiliateId: string | null
}) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">
          {t('affiliate.tabs.crawler_dashboard', 'Extraction Dashboard')}
        </h2>
        <p className="text-sm text-slate-500">
          {t(
            'affiliate.crawler_dashboard.desc',
            'Configure data sources and track the extraction history for your network.',
          )}
        </p>
      </div>

      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sources" className="gap-2">
            <Globe className="w-4 h-4" />{' '}
            {t('affiliate.tabs.sources', 'Data Sources')}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />{' '}
            {t('affiliate.tabs.history', 'History (Logs)')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sources">
          <AffiliateCrawlerSourcesTab
            franchiseId={franchiseId}
            companyId={companyId}
            affiliateId={affiliateId}
          />
        </TabsContent>
        <TabsContent value="history">
          <AffiliateCrawlerHistoryTab
            franchiseId={franchiseId}
            companyId={companyId}
            affiliateId={affiliateId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
