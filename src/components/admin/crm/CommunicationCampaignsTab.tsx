import { useState } from 'react'
import { useCrmData } from '@/hooks/use-crm-data'
import { CampaignTable } from './CampaignTable'
import { CampaignDialog } from './CampaignDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function CommunicationCampaignsTab({
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  const { t } = useLanguage()
  const { campaigns, targetGroups, loading, refresh } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-800">
            {t('crm.campaigns.title', 'Campanhas de Comunicação')}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'crm.campaigns.desc',
              'Dispare campanhas para seus grupos de clientes.',
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('crm.campaigns.create', 'Criar Campanha')}
        </Button>
      </div>

      <CampaignTable
        campaigns={campaigns}
        targetGroups={targetGroups}
        loading={loading}
        onEdit={(c: any) => {
          setEditData(c)
          setOpen(true)
        }}
        onRefresh={refresh}
      />

      {open && (
        <CampaignDialog
          open={open}
          onOpenChange={setOpen}
          companyId={companyId}
          franchiseId={franchiseId}
          affiliateId={affiliateId}
          editData={editData}
          onSuccess={refresh}
          targetGroups={targetGroups}
        />
      )}
    </div>
  )
}
