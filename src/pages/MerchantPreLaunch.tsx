import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { Button } from '@/components/ui/button'
import { Rocket, Plus } from 'lucide-react'
import { CommunicationCampaignsTab } from '@/components/admin/crm/CommunicationCampaignsTab'

export default function MerchantPreLaunch() {
  const { user } = useAuth()
  const companyId = user?.id

  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" /> Campanhas de
            Pré-lançamento
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Crie expectativa e capture leads antes do lançamento oficial
            utilizando o mesmo motor unificado de campanhas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCampaignDialogOpen(true)}
            className="font-bold shadow-md hover:-translate-y-0.5 transition-transform bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <CampaignFormDialog
        open={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
        companyId={companyId || 'admin-global'}
      />

      <CommunicationCampaignsTab companyId={companyId} />
    </div>
  )
}
