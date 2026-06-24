import { TargetGroupsTab } from './TargetGroupsTab'
import { CommunicationCampaignsTab } from './CommunicationCampaignsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminCRM({
  affiliateId,
  companyId,
  franchiseId,
  defaultTab = 'targets',
}: {
  affiliateId?: string
  companyId?: string
  franchiseId?: string
  defaultTab?: string
}) {
  const { t } = useLanguage()

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="targets">
            {t('admin.crm_tabs.target_groups_title', 'Grupos Alvo (Targets)')}
          </TabsTrigger>
          <TabsTrigger value="comms">
            {t('admin.crm_tabs.comms_title', 'Campanhas de Disparo')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="targets" className="mt-0">
          <TargetGroupsTab
            affiliateId={affiliateId}
            companyId={companyId}
            franchiseId={franchiseId}
          />
        </TabsContent>
        <TabsContent value="comms" className="mt-0">
          <CommunicationCampaignsTab
            affiliateId={affiliateId}
            companyId={companyId}
            franchiseId={franchiseId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
