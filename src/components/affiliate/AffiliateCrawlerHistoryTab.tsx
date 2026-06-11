import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'

export function AffiliateCrawlerHistoryTab({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId: string | null
  companyId: string | null
  affiliateId: string | null
}) {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      let query = supabase
        .from('crawler_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (franchiseId) query = query.eq('franchise_id', franchiseId)
      else if (companyId) query = query.eq('company_id', companyId)
      else if (affiliateId) query = query.eq('affiliate_id', affiliateId)

      const { data } = await query
      setLogs(data || [])
      setLoading(false)
    }

    fetchLogs()
  }, [franchiseId, companyId, affiliateId])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">
          {t('affiliate.crawler.history_title', 'Execution History')}
        </h3>
        <p className="text-sm text-slate-500">
          {t(
            'affiliate.crawler.history_desc',
            'Recent crawler execution logs.',
          )}
        </p>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.date', 'Date')}</TableHead>
              <TableHead>
                {t('affiliate.crawler.items_found', 'Found')}
              </TableHead>
              <TableHead>
                {t('affiliate.crawler.items_imported', 'Imported')}
              </TableHead>
              <TableHead>{t('common.status', 'Status')}</TableHead>
              <TableHead>{t('common.error', 'Error / Details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t(
                    'affiliate.crawler.no_logs',
                    'No execution history found.',
                  )}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.items_found || 0}</TableCell>
                  <TableCell>{log.items_imported || 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'success'
                          ? 'default'
                          : log.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {log.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={log.error_message || ''}
                  >
                    {log.error_message || '-'}
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
