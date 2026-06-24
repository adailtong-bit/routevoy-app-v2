import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TargetGroupsTab } from './TargetGroupsTab'
import { CommunicationCampaignsTab } from './CommunicationCampaignsTab'
import { CRMPerformanceDashboard } from './CRMPerformanceDashboard'
import { useCrmData } from '@/hooks/use-crm-data'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminCRM({
  companyId,
  franchiseId,
  affiliateId,
  defaultTab = 'performance',
}: {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
  defaultTab?: string
}) {
  const { targetGroups, campaigns, engagements, refresh, loading } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )
  const { t } = useLanguage()

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3 bg-slate-100/50 p-1">
        <TabsTrigger
          value="performance"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          {t('crm.performance', 'Performance')}
        </TabsTrigger>
        <TabsTrigger
          value="groups"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          {t('crm.groups', 'Target Groups')}
        </TabsTrigger>
        <TabsTrigger
          value="campaigns"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          {t('crm.campaigns', 'Campaigns')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="performance" className="mt-0">
        <CRMPerformanceDashboard
          campaigns={campaigns}
          engagements={engagements}
          loading={loading}
        />
      </TabsContent>
      <TabsContent value="groups" className="mt-0">
        <TargetGroupsTab
          groups={targetGroups}
          refresh={refresh}
          loading={loading}
          companyId={companyId}
          franchiseId={franchiseId}
          affiliateId={affiliateId}
        />
      </TabsContent>
      <TabsContent value="campaigns" className="mt-0">
        <CommunicationCampaignsTab
          campaigns={campaigns}
          groups={targetGroups}
          refresh={refresh}
          loading={loading}
          companyId={companyId}
          franchiseId={franchiseId}
          affiliateId={affiliateId}
        />
      </TabsContent>
    </Tabs>
  )
}
