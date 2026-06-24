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
import { Badge } from '@/components/ui/badge'

export function CommunicationCampaignsTab({
  companyId,
  franchiseId,
  affiliateId,
}: {
  companyId?: string
  franchiseId?: string
  affiliateId?: string
}) {
  const { t } = useLanguage()
  const { campaigns, loading } = useCrmData(franchiseId, companyId, affiliateId)

  return (
    <div className="bg-white rounded-xl border p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {t('crm.campaigns.title', 'Campanhas de CRM')}
      </h3>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('crm.campaigns.name', 'Nome')}</TableHead>
              <TableHead>{t('crm.campaigns.channel', 'Canal')}</TableHead>
              <TableHead>{t('crm.campaigns.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('crm.campaigns.clicks', 'Cliques')}
              </TableHead>
              <TableHead className="text-right">
                {t('crm.campaigns.conversions', 'Conversões')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Skeleton className="h-6 w-full max-w-[200px] mx-auto" />
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-slate-500 font-medium"
                >
                  {t('common.none', 'Nenhuma campanha encontrada.')}
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((camp) => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium text-slate-800">
                    {camp.name}
                  </TableCell>
                  <TableCell className="text-slate-600 uppercase">
                    {camp.channel}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        camp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 text-slate-600'
                      }
                    >
                      {camp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-blue-600 font-medium">
                    {camp.clicks || 0}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 font-bold">
                    {camp.redemptions || 0}
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
