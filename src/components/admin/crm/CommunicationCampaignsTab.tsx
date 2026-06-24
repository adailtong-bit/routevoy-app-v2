import { useState } from 'react'
import { useCrmData } from '@/hooks/use-crm-data'
import { CampaignTable } from './CampaignTable'
import { CampaignDialog } from './CampaignDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function CommunicationCampaignsTab({
  affiliateId,
  companyId,
  franchiseId,
}: any) {
  const { t } = useLanguage()
  const { campaigns, targetGroups, loading, refresh } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">
            {t('crm.campaigns.title', 'Campanhas de Disparo')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('crm.campaigns.desc', 'Gerencie suas campanhas de comunicação.')}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCampaign(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.campaigns.add', 'Nova Campanha')}
        </Button>
      </div>

      <CampaignTable
        campaigns={campaigns || []}
        targetGroups={targetGroups || []}
        loading={loading}
        onRefresh={refresh}
        onEdit={(camp: any) => {
          setEditingCampaign(camp)
          setDialogOpen(true)
        }}
      />

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        targetGroups={targetGroups || []}
        onSuccess={refresh}
        affiliateId={affiliateId}
        companyId={companyId}
        franchiseId={franchiseId}
      />
    </div>
  )
}
