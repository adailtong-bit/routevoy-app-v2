import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CrawlerSourcesTab, CrawlerLogsTab } from './FranchiseeCrawlerTabs'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeCrawlerTab({ franchiseId }: { franchiseId: string }) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          {t('franchisee.management.crawler_title')}
        </h2>
        <p className="text-slate-500">
          {t('franchisee.management.crawler_desc')}
        </p>
      </div>
      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sources">
            {t('franchisee.management.crawler_sources_tab')}
          </TabsTrigger>
          <TabsTrigger value="logs">
            {t('franchisee.management.crawler_logs_tab')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sources">
          <CrawlerSourcesTab franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent value="logs">
          <CrawlerLogsTab franchiseId={franchiseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
