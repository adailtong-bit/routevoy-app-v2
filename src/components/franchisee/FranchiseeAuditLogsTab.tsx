import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
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

export function FranchiseeAuditLogsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      const { data: team } = await supabase
        .from('profiles')
        .select('email')
        .eq('franchise_id', franchiseId)
      const userEmails = team?.map((tm: any) => tm.email) || []

      if (userEmails.length > 0) {
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .in('user_email', userEmails)
          .order('created_at', { ascending: false })
          .limit(50)
        setLogs(data || [])
      } else {
        setLogs([])
      }
      setLoading(false)
    }
    loadLogs()
  }, [franchiseId])

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('franchisee.management.audit_date')}</TableHead>
              <TableHead>{t('franchisee.management.audit_user')}</TableHead>
              <TableHead>{t('franchisee.management.audit_action')}</TableHead>
              <TableHead>{t('franchisee.management.audit_details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {t('franchisee.management.loading')}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-slate-500"
                >
                  {t('franchisee.management.no_logs')}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {log.user_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 truncate max-w-xs">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
