import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CrawlerSourcesTab, CrawlerLogsTab } from './FranchiseeCrawlerTabs'

export function FranchiseeCrawlerTab({ franchiseId }: { franchiseId: string }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Offers Crawler
        </h2>
        <p className="text-slate-500">
          Manage automated data collection for your region.
        </p>
      </div>
      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
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
