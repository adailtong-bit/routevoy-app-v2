import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'
import { CampaignsManager } from '@/components/shared/CampaignsManager'

export function AdCampaignsTab() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [key, setKey] = useState(0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">All Advertisement Campaigns</h3>
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

      <CampaignsManager
        key={key}
        onEdit={(data) => {
          setEditData(data)
          setOpen(true)
        }}
      />

      {open && (
        <CampaignFormDialog
          open={open}
          onOpenChange={setOpen}
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
