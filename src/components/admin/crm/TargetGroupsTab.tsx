import { useLanguage } from '@/stores/LanguageContext'
import { useCrmData } from '@/hooks/use-crm-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function TargetGroupsTab({
  companyId,
  franchiseId,
  affiliateId,
}: {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}) {
  const { t } = useLanguage()
  const { targetGroups, loading } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )

  return (
    <div className="bg-white rounded-xl border p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {t('crm.targets.title', 'Grupos Alvo')}
      </h3>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('crm.targets.name', 'Nome')}</TableHead>
              <TableHead>{t('crm.targets.description', 'Descrição')}</TableHead>
              <TableHead className="text-right">
                {t('crm.targets.leads', 'Leads')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <Skeleton className="h-6 w-full max-w-[200px] mx-auto" />
                </TableCell>
              </TableRow>
            ) : targetGroups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-slate-500 font-medium"
                >
                  {t('common.none', 'Nenhum grupo alvo encontrado.')}
                </TableCell>
              </TableRow>
            ) : (
              targetGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium text-slate-800">
                    {group.name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {group.description || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {group.leadCount || 0}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
