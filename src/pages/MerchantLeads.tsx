import { useAuth } from '@/hooks/use-auth'
import { LeadsProfileTab } from '@/components/admin/crm/LeadsProfileTab'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Target, Megaphone } from 'lucide-react'
import { CRMCampaignsTab } from '@/components/merchant/CRMCampaignsTab'

export default function MerchantLeads() {
  const { user } = useAuth()
  const companyId = user?.id

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Leads e CRM
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Analise o perfil de consumo, gerencie seus grupos alvo e crie
          campanhas direcionadas exclusivas.
        </p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6 inline-flex h-auto rounded-lg flex-wrap gap-1">
          <TabsTrigger
            value="leads"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-4 py-2 flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Captados
          </TabsTrigger>
          <TabsTrigger
            value="target_groups"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-4 py-2 flex items-center gap-2"
          >
            <Target className="w-4 h-4" /> Grupos Alvo
          </TabsTrigger>
          <TabsTrigger
            value="crm_campaigns"
            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-4 py-2 flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" /> Campanhas Direcionadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-0 outline-none">
          <LeadsProfileTab companyId={companyId} />
        </TabsContent>
        <TabsContent value="target_groups" className="mt-0 outline-none">
          <TargetGroupsTab companyId={companyId} />
        </TabsContent>
        <TabsContent value="crm_campaigns" className="mt-0 outline-none">
          <CRMCampaignsTab companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
