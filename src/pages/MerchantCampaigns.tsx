import { useAuth } from '@/hooks/use-auth'
import { CommunicationCampaignsTab } from '@/components/admin/crm/CommunicationCampaignsTab'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Target, Megaphone } from 'lucide-react'

export default function MerchantCampaigns() {
  const { user } = useAuth()
  const companyId = user?.id

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" /> Minhas Campanhas
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Crie campanhas direcionadas e gerencie seus grupos alvo com
            integração total.
          </p>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6 inline-flex h-auto rounded-lg">
          <TabsTrigger
            value="campaigns"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" /> Campanhas
          </TabsTrigger>
          <TabsTrigger
            value="target_groups"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2 transition-all"
          >
            <Target className="w-4 h-4" /> Grupos Alvo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-0 outline-none">
          <CommunicationCampaignsTab companyId={companyId} />
        </TabsContent>
        <TabsContent value="target_groups" className="mt-0 outline-none">
          <TargetGroupsTab companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
