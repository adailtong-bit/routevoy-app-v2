import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Megaphone, MousePointerClick, Send } from 'lucide-react'
import { useCrmData } from '@/hooks/use-crm-data'

export function CRMPerformanceDashboard({
  companyId,
  franchiseId,
  affiliateId,
}: any) {
  const { t } = useLanguage()
  const { targetGroups, campaigns, loading } = useCrmData(
    franchiseId,
    companyId,
    affiliateId,
  )

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>
  }

  const totalLeads = targetGroups.reduce(
    (acc, g) => acc + (g.leadCount || 0),
    0,
  )
  const totalCampaigns = campaigns.length
  const totalSent = campaigns.filter((c) => c.status === 'sent').length
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.leads', 'Total de Leads')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.campaigns', 'Total de Campanhas')}
          </CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCampaigns}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.sent', 'Disparos Feitos')}
          </CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSent}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('crm.stats.clicks', 'Total de Cliques')}
          </CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClicks}</div>
        </CardContent>
      </Card>
    </div>
  )
}
