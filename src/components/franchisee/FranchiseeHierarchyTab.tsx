import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FranchiseeMerchantsTab } from './FranchiseeMerchantsTab'
import { FranchiseeTeamTab } from './FranchiseeTeamTab'
import { FranchiseeAuditLogsTab } from './FranchiseeAuditLogsTab'

export function FranchiseeHierarchyTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Hierarchy & Team
        </h2>
        <p className="text-slate-500">
          Manage merchants, regional team members, and audit logs.
        </p>
      </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="team">Manage Team</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="merchants">
          <FranchiseeMerchantsTab franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent value="team">
          <FranchiseeTeamTab franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent value="audit">
          <FranchiseeAuditLogsTab franchiseId={franchiseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
