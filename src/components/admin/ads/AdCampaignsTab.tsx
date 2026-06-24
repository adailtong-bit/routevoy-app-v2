import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { CampaignsManager } from '@/components/shared/CampaignsManager'
import { useLanguage } from '@/stores/LanguageContext'

export function AdCampaignsTab({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
}) {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [key, setKey] = useState(0)
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {t('admin.ad_manager.campaigns', 'Advertising Campaigns')}
        </h3>
        <Button
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('common.create_campaign', 'Create Campaign')}
        </Button>
      </div>

      <CampaignsManager
        key={key}
        franchiseId={franchiseId}
        companyId={companyId}
        affiliateId={affiliateId}
        onEdit={(data: any) => {
          setEditData(data)
          setOpen(true)
        }}
      />

      {open && (
        <CampaignFormDialog
          open={open}
          onOpenChange={setOpen}
          franchiseId={franchiseId}
          companyId={companyId}
          affiliateId={affiliateId}
          onSuccess={() => {
            setOpen(false)
            setKey((k) => k + 1)
          }}
          editData={editData}
        />
      )}
    </div>
  )
}
