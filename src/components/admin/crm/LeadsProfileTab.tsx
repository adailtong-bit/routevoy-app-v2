import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Crown, ActivitySquare, Ban } from 'lucide-react'
import { useCrmData } from '@/hooks/use-crm-data'

export function LeadsProfileTab({
  franchiseId,
  companyId,
  affiliateId,
}: {
  franchiseId?: string
  companyId?: string
  affiliateId?: string
}) {
  const { t } = useLanguage()
  const { profiles, engagements, loading } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )
  const [searchQuery, setSearchQuery] = useState('')

  const userStats = useMemo(() => {
    return profiles.map((user) => {
      const userEngs = engagements.filter((e: any) => e.user_id === user.id)

      const tags: string[] = []
      if (userEngs.length >= 5) tags.push('Frequent Buyer')
      else if (userEngs.length > 0) tags.push('Occasional')
      else tags.push('Inactive')

      if (user.role === 'vip' || userEngs.length > 10) tags.push('High Value')

      return {
        ...user,
        totalRedemptions: userEngs.length,
        profileTags: tags,
      }
    })
  }, [profiles, engagements])

  const filteredUsers = userStats.filter(
    (u) =>
      !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getTagIcon = (tag: string) => {
    if (tag === 'High Value')
      return <Crown className="w-3 h-3 mr-1 text-amber-500" />
    if (tag === 'Frequent Buyer')
      return <ActivitySquare className="w-3 h-3 mr-1 text-emerald-500" />
    if (tag === 'Inactive')
      return <Ban className="w-3 h-3 mr-1 text-slate-400" />
    return null
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle>
            {t('franchisee.leads.profile_tab_title', 'Consumption Profiles')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.leads.profile_tab_desc',
              'View purchasing behavior and identify best profiles.',
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('franchisee.crm.search', 'Search users...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando leads...
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário / Local</TableHead>
                  <TableHead>Perfil de Consumo</TableHead>
                  <TableHead>Resgates / Engajamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name || u.email}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span>{u.email}</span>
                        {u.state && (
                          <span className="bg-slate-100 px-1 rounded">
                            {u.state} {u.city ? `- ${u.city}` : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.profileTags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-slate-50 border-slate-200 text-xs font-medium"
                          >
                            {getTagIcon(tag)}
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {u.totalRedemptions}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
