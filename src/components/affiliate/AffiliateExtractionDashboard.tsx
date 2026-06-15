import { useState } from 'react'
import { AffiliateCrawlerSourcesTab } from './AffiliateCrawlerSourcesTab'
import { AffiliateCrawlerHistoryTab } from './AffiliateCrawlerHistoryTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'

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
  const [activeTab, setActiveTab] = useState('sources')

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <CardTitle>
          {t('affiliate.crawler.dashboard_title', 'Extraction Dashboard')}
        </CardTitle>
        <CardDescription>
          {t(
            'affiliate.crawler.dashboard_desc',
            'Manage your crawler sources and view extraction history.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sources">
              {t('affiliate.crawler.sources', 'Sources')}
            </TabsTrigger>
            <TabsTrigger value="history">
              {t('affiliate.crawler.history', 'History')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-0">
            <AffiliateCrawlerSourcesTab
              franchiseId={franchiseId}
              companyId={companyId}
              affiliateId={affiliateId}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <AffiliateCrawlerHistoryTab
              franchiseId={franchiseId}
              companyId={companyId}
              affiliateId={affiliateId}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
