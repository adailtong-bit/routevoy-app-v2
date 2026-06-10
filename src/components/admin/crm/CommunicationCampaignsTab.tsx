import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCrmData } from '@/hooks/use-crm-data'
import { CampaignTable } from './CampaignTable'
import { CampaignDialog } from './CampaignDialog'

export function CommunicationCampaignsTab({
  franchiseId,
  companyId,
}: {
  franchiseId?: string
  companyId?: string
}) {
  const { t } = useLanguage()
  const { campaigns, targetGroups, profiles, engagements, refresh, loading } =
    useCrmData(franchiseId, companyId)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null)

  const handleOpenDialog = (camp?: any) => {
    setEditingCampaign(camp || null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {t('admin.crm_tabs.comms_title', 'Dispatches & Campaigns')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.crm_tabs.comms_desc',
                'Create multichannel campaigns linked to target groups.',
              )}
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('admin.crm_tabs.new_comm', 'New Dispatch')}
          </Button>
        </CardHeader>
        <CardContent>
          <CampaignTable
            campaigns={campaigns}
            targetGroups={targetGroups}
            loading={loading}
            onEdit={handleOpenDialog}
            onRefresh={refresh}
          />
        </CardContent>
      </Card>

      {isDialogOpen && (
        <CampaignDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCampaign={editingCampaign}
          targetGroups={targetGroups}
          profiles={profiles}
          engagements={engagements}
          companyId={companyId}
          franchiseId={franchiseId}
          onSaved={refresh}
        />
      )}
    </div>
  )
}
