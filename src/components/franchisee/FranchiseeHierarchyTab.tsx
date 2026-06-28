import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FranchiseeMerchantsTab } from './FranchiseeMerchantsTab'
import { FranchiseeTeamTab } from './FranchiseeTeamTab'
import { FranchiseeAuditLogsTab } from './FranchiseeAuditLogsTab'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeHierarchyTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          {t('franchisee.management.hierarchy_title')}
        </h2>
        <p className="text-slate-500">
          {t('franchisee.management.hierarchy_desc')}
        </p>
      </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="merchants">
            {t('franchisee.management.hierarchy_merchants_tab')}
          </TabsTrigger>
          <TabsTrigger value="team">
            {t('franchisee.management.hierarchy_team_tab')}
          </TabsTrigger>
          <TabsTrigger value="audit">
            {t('franchisee.management.hierarchy_audit_tab')}
          </TabsTrigger>
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
