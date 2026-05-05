import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function DataInsightsTab({ franchiseId }: { franchiseId?: string }) {
  const { validationLogs, users, adInvoices, companies, franchises } =
    useCouponStore()
  const { t } = useLanguage()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatNumber } = useRegionFormatting(
    franchise?.region,
  )

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const displayLogs = franchiseId
    ? validationLogs.filter(
        (l) => l.companyId && companyIds.includes(l.companyId),
      )
    : validationLogs

  const userIds = new Set(displayLogs.map((l) => l.userId))
  const displayUsers = franchiseId
    ? users.filter((u) => userIds.has(u.id))
    : users

  // Calculate stats based on logs and users
  const totalCommissions = displayLogs.reduce(
    (sum, log) => sum + (log.commissionAmount || 0),
    0,
  )
  const totalCashbackDistributed = displayLogs.reduce(
    (sum, log) => sum + (log.cashbackAmount || 0),
    0,
  )

  const activeSubscriptions = displayUsers.filter(
    (u) => u.subscriptionTier && u.subscriptionTier !== 'free',
  ).length
  const premiumUsers = displayUsers.filter(
    (u) => u.subscriptionTier === 'premium',
  ).length
  const vipUsers = displayUsers.filter(
    (u) => u.subscriptionTier === 'vip',
  ).length

  const displayInvoices = franchiseId
    ? adInvoices.filter((i) => i.status === 'paid') // Ideally filter by franchise if adInvoices had it
    : adInvoices.filter((i) => i.status === 'paid')

  const adRevenue = displayInvoices.reduce((sum, i) => sum + i.amount, 0)

  // Mock referral payouts for demo
  const referralPayouts = totalCashbackDistributed * 0.15

  const activityData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const hours = ['Manhã', 'Tarde', 'Noite']
    const data = []

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 3; h++) {
        data.push({
          day: days[d],
          hour: hours[h],
          value:
            Math.floor(Math.random() * 80) + (d === 5 || d === 6 ? 40 : 10), // Mais aos fds
        })
      }
    }
    return data
  }, [])

  const trendData = useMemo(() => {
    return [
      { name: 'Alimentação', value: 450 },
      { name: 'Eletrônicos', value: 320 },
      { name: 'Moda', value: 280 },
      { name: 'Beleza', value: 190 },
      { name: 'Viagens', value: 150 },
    ]
  }, [])

  const getColor = (value: number) => {
    if (value < 30) return 'bg-blue-100 text-blue-800'
    if (value < 60) return 'bg-blue-300 text-blue-900'
    if (value < 90) return 'bg-blue-500 text-white'
    return 'bg-blue-700 text-white'
  }

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600 shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('franchisee.insights.total_commissions', 'Comissões Totais')}
            </p>
            <h3 className="text-2xl font-bold truncate">
              {formatCurrency(totalCommissions)}
            </h3>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1 truncate">
              <TrendingUp className="h-3 w-3 shrink-0" />{' '}
              <span className="truncate">
                {t('franchisee.insights.this_month', '+12% este mês')}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 shrink-0">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('franchisee.insights.active_subs', 'Assinaturas Ativas')}
            </p>
            <h3 className="text-2xl font-bold truncate">
              {formatNumber(activeSubscriptions)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t(
                'franchisee.insights.premium_vip',
                '{premium} Premium, {vip} VIP',
              )
                .replace('{premium}', String(premiumUsers))
                .replace('{vip}', String(vipUsers))}
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600 shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('franchisee.insights.ad_revenue', 'Receita de Anúncios')}
            </p>
            <h3 className="text-2xl font-bold truncate">
              {formatCurrency(adRevenue)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t('franchisee.insights.ad_desc', 'De campanhas internas')}
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600 shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('franchisee.insights.referral', 'Pagamentos de Indicação')}
            </p>
            <h3 className="text-2xl font-bold truncate">
              {formatCurrency(referralPayouts)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t(
                'franchisee.insights.referral_desc',
                'Distribuído aos indicadores',
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <Card className="min-w-0 w-full overflow-hidden">
          <CardHeader>
            <CardTitle>
              {t(
                'franchisee.insights.chart_consumption',
                'Tendências de Consumo (Por Categoria)',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.insights.chart_consumption_desc',
                'Categorias mais acessadas na região',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ChartContainer
                config={{
                  value: {
                    label: t('franchisee.insights.interactions', 'Interações'),
                    color: 'hsl(var(--primary))',
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 w-full overflow-hidden">
          <CardHeader>
            <CardTitle>
              {t(
                'franchisee.insights.heatmap',
                'Heatmap de Acessos (Dias x Horários)',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.insights.heatmap_desc',
                'Picos de engajamento do público',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 gap-1 text-xs text-center text-slate-500 mb-1">
                <div></div>
                <div>Manhã</div>
                <div>Tarde</div>
                <div>Noite</div>
              </div>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="grid grid-cols-4 gap-1 items-center">
                  <div className="text-xs font-medium text-slate-600 text-right pr-2">
                    {day}
                  </div>
                  {activityData
                    .filter((d) => d.day === day)
                    .map((cell, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded-md ${getColor(cell.value)} flex items-center justify-center text-[10px] font-bold shadow-sm transition-all hover:ring-2 ring-primary ring-offset-1`}
                        title={`${cell.value} acessos`}
                      >
                        {cell.value}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
