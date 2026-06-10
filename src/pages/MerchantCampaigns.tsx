import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { CommunicationCampaignsTab } from '@/components/admin/crm/CommunicationCampaignsTab'
import { CRMPerformanceDashboard } from '@/components/admin/crm/CRMPerformanceDashboard'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart2, Send, Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'

export default function MerchantCampaigns() {
  const { user } = useAuth()
  const companyId = user?.id

  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            CRM & Analytics
          </h2>
          <p className="text-slate-500 text-sm">
            Analise o desempenho e dispare campanhas direcionadas para a sua
            audiência.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCampaignDialogOpen(true)}
            className="font-bold shadow-md hover:-translate-y-0.5 transition-transform"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova Campanha
          </Button>
        </div>
      </div>

      <CampaignFormDialog
        open={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
        companyId={companyId || 'admin-global'}
      />

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-4 flex-wrap h-auto justify-start">
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart2 className="w-4 h-4 mr-2" /> Desempenho
          </TabsTrigger>
          <TabsTrigger
            value="target_groups"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Target className="w-4 h-4 mr-2" /> Grupos Alvo
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Send className="w-4 h-4 mr-2" /> Campanhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-0 outline-none">
          {/* @ts-expect-error */}
          <CRMPerformanceDashboard companyId={companyId} />
        </TabsContent>
        <TabsContent value="target_groups" className="mt-0 outline-none">
          <TargetGroupsTab companyId={companyId} />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-0 outline-none">
          <CommunicationCampaignsTab companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
