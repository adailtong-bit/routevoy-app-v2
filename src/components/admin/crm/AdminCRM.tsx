import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommunicationCampaignsTab } from './CommunicationCampaignsTab'
import { TargetGroupsTab } from './TargetGroupsTab'
import { LeadsProfileTab } from './LeadsProfileTab'

export function AdminCRM() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          CRM & Communications
        </h2>
        <p className="text-muted-foreground">
          Manage customer relationships, segments, and CRM campaigns.
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">CRM Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Target Groups</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <CommunicationCampaignsTab />
        </TabsContent>

        <TabsContent value="segments">
          <TargetGroupsTab />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
