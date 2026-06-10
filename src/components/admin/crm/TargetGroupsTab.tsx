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
import { TargetGroupTable } from './TargetGroupTable'
import { TargetGroupDialog } from './TargetGroupDialog'
import { useCrmData } from '@/hooks/use-crm-data'

export function TargetGroupsTab({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
}) {
  const { t } = useLanguage()
  const { targetGroups, profiles, engagements, categories, refresh, loading } =
    useCrmData(franchiseId, companyId, affiliateId)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any | null>(null)

  const handleOpenDialog = (group?: any) => {
    setEditingGroup(group || null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {t(
                'admin.crm_tabs.target_groups_title',
                'Target Groups (Segments)',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.crm_tabs.target_groups_desc',
                'Create segments based on demographic and consumption data.',
              )}
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('admin.crm_tabs.new_group', 'New Group')}
          </Button>
        </CardHeader>
        <CardContent>
          <TargetGroupTable
            groups={targetGroups}
            loading={loading}
            onEdit={handleOpenDialog}
            onRefresh={refresh}
          />
        </CardContent>
      </Card>

      {isDialogOpen && (
        <TargetGroupDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingGroup={editingGroup}
          profiles={profiles}
          engagements={engagements}
          categories={categories}
          companyId={companyId}
          franchiseId={franchiseId}
          affiliateId={affiliateId}
          onSaved={refresh}
        />
      )}
    </div>
  )
}
