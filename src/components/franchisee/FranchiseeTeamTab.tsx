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
import { Button } from '@/components/ui/button'
import { User, Trash2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeTeamTab({ franchiseId }: { franchiseId: string }) {
  const { t } = useLanguage()
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeam() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('franchise_id', franchiseId)
      setTeam(data || [])
      setLoading(false)
    }
    loadTeam()
  }, [franchiseId])

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('franchisee.management.name')}</TableHead>
              <TableHead>{t('franchisee.management.email')}</TableHead>
              <TableHead>{t('franchisee.management.team_role')}</TableHead>
              <TableHead className="text-right">
                {t('franchisee.management.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {t('franchisee.management.loading')}
                </TableCell>
              </TableRow>
            ) : team.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-slate-500"
                >
                  {t('franchisee.management.no_team')}
                </TableCell>
              </TableRow>
            ) : (
              team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {member.name || t('franchisee.management.team_unknown')}
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {member.role || 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
