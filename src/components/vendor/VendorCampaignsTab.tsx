import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { CampaignsManager } from '@/components/shared/CampaignsManager'

export function VendorCampaignsTab() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [key, setKey] = useState(0)

  const handleSuccess = () => {
    setOpen(false)
    setEditData(null)
    setKey((k) => k + 1)
  }

  const handleEdit = (data: any) => {
    setEditData(data)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Advertisement Campaigns
          </h2>
          <p className="text-muted-foreground">
            Manage your vouchers and coupons using the interactive editor.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <CampaignsManager key={key} onEdit={handleEdit} />

      {open && (
        <CampaignFormDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={handleSuccess}
          editData={editData}
        />
      )}
    </div>
  )
}
