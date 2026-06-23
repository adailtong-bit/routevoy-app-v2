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
          Hierarquia e Equipe
        </h2>
        <p className="text-slate-500">
          Gerencie lojistas, membros da equipe regional e logs de auditoria.
        </p>
      </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="merchants">Lojistas</TabsTrigger>
          <TabsTrigger value="team">Gerenciar Equipe</TabsTrigger>
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
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
