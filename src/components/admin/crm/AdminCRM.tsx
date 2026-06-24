import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CRMPerformanceDashboard } from './CRMPerformanceDashboard'
import { TargetGroupsTab } from './TargetGroupsTab'
import { CommunicationCampaignsTab } from './CommunicationCampaignsTab'
import { Button } from '@/components/ui/button'
import { Plus, BarChart2, Users, Megaphone } from 'lucide-react'
import { CRMCampaignDialog } from '@/components/merchant/CRMCampaignDialog'
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
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {t('crm.title', 'CRM & Analytics')}
          </h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            {t(
              'crm.desc',
              'Analyze performance and trigger targeted campaigns to your audience.',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            {t('crm.create_campaign', 'Create New Campaign')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white p-2 rounded-lg border inline-block mb-6 overflow-x-auto max-w-full">
          <TabsList className="bg-transparent h-auto p-0 flex gap-2 w-max">
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary px-4 py-2 rounded-md transition-colors"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              {t('crm.tabs.performance', 'Performance')}
            </TabsTrigger>
            <TabsTrigger
              value="targets"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary px-4 py-2 rounded-md transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('crm.tabs.targets', 'Target Groups')}
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary px-4 py-2 rounded-md transition-colors"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              {t('crm.tabs.campaigns', 'Campaigns')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="performance" className="mt-0 outline-none">
          <CRMPerformanceDashboard
            companyId={companyId}
            franchiseId={franchiseId}
            affiliateId={affiliateId}
          />
        </TabsContent>
        <TabsContent value="targets" className="mt-0 outline-none">
          <TargetGroupsTab
            companyId={companyId}
            franchiseId={franchiseId}
            affiliateId={affiliateId}
          />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-0 outline-none">
          <CommunicationCampaignsTab
            companyId={companyId}
            franchiseId={franchiseId}
            affiliateId={affiliateId}
          />
        </TabsContent>
      </Tabs>

      <CRMCampaignDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        companyId={companyId}
        franchiseId={franchiseId}
        affiliateId={affiliateId}
        onSuccess={() => {
          setActiveTab('campaigns')
        }}
      />
    </div>
  )
}
