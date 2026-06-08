import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DollarSign, TrendingUp, Users, Activity, Radar } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { AdPricingManager } from '@/components/admin/AdPricingManager'
import { CommissionRulesManager } from '@/components/admin/CommissionRulesManager'

const dummyData = [
  { partner: 'Sabor', coupons: 145, credits: 1250, margin: 350 },
  { partner: 'Paraíso', coupons: 89, credits: 3400, margin: 850 },
  { partner: 'Radical', coupons: 210, credits: 1890, margin: 420 },
  { partner: 'Café', coupons: 340, credits: 850, margin: 170 },
]

const timelineData = [
  { date: '01/10', revenue: 450, coupons: 120 },
  { date: '05/10', revenue: 680, coupons: 180 },
  { date: '10/10', revenue: 850, coupons: 240 },
  { date: '15/10', revenue: 1200, coupons: 310 },
  { date: '20/10', revenue: 1450, coupons: 420 },
  { date: '25/10', revenue: 1890, coupons: 580 },
]

export function AdminMonetizationTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { t } = useLanguage()
  const { role, user } = useAuth()
  const isAdmin =
    role === 'admin' ||
    role === 'super_admin' ||
    user?.email === 'adailtong@gmail.com'
  const { franchises, platformSettings, updatePlatformSettings } =
    useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatNumber } = useRegionFormatting(
    franchise?.region,
  )
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const totals = useMemo(() => {
    return dummyData.reduce(
      (acc, curr) => ({
        coupons: acc.coupons + curr.coupons,
        credits: acc.credits + curr.credits,
        margin: acc.margin + curr.margin,
      }),
      { coupons: 0, credits: 0, margin: 0 },
    )
  }, [])

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">
              {t('admin.margins')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold truncate">
              {formatCurrency(totals.margin)}
            </div>
            <p className="text-xs text-muted-foreground">+12%</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">
              {t('admin.totalCredits')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold truncate">
              {formatCurrency(totals.credits)}
            </div>
            <p className="text-xs text-muted-foreground">+8%</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">
              {t('admin.volume')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold truncate">
              {formatNumber(totals.coupons)}
            </div>
            <p className="text-xs text-muted-foreground">+24%</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate">
              {t('admin.partnerStores')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold truncate">
              {formatNumber(dummyData.length)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {t('franchisee.monetization.active_plural', 'Ativos')}
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <div className="grid gap-6 grid-cols-1 mb-6 animate-fade-in-up">
          <Card className="min-w-0 overflow-hidden shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="flex items-center gap-2 truncate text-base sm:text-lg">
                <DollarSign className="h-5 w-5 text-primary shrink-0" />
                Regras de Comissão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CommissionRulesManager />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 mb-6 animate-fade-in-up">
        <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 truncate text-base sm:text-lg">
              <TrendingUp className="h-5 w-5 text-primary shrink-0" />
              Tabela de Preços (Publicidade e Impulsionamento)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdPricingManager />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 min-w-0">
        <Card className="lg:col-span-2 border-slate-200 min-w-0 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 truncate text-base sm:text-lg">
              <Radar className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">
                Configurações Globais da Plataforma
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 min-w-0 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm gap-4 min-w-0">
              <div className="space-y-1 min-w-0">
                <Label className="text-sm sm:text-base font-semibold text-slate-800 block truncate">
                  Master Switch de Alertas de Proximidade
                </Label>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 sm:line-clamp-none">
                  Habilita ou desativa a tecnologia de Geofencing e Radar para
                  toda a base de usuários e lojistas simultaneamente.
                </p>
              </div>
              <Switch
                checked={
                  platformSettings.globalProximityAlertsEnabled !== false
                }
                onCheckedChange={(c) =>
                  updatePlatformSettings({ globalProximityAlertsEnabled: c })
                }
                className="data-[state=checked]:bg-primary shrink-0"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border border-indigo-200 shadow-sm gap-4 min-w-0 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              <div className="space-y-1 min-w-0 pl-2">
                <Label className="text-sm sm:text-base font-semibold text-indigo-900 block truncate flex items-center gap-2">
                  Motor de Afiliados (Ranking Inteligente)
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    Novo
                  </Badge>
                </Label>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 sm:line-clamp-none">
                  Ativa a rota paralela de monetização. Quando o usuário
                  realizar uma busca, o sistema injetará ofertas patrocinadas
                  usando o algoritmo de pontuação (Desconto + Comissão).
                </p>
              </div>
              <Switch
                checked={true}
                className="data-[state=checked]:bg-indigo-600 shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="truncate">
              {t(
                'franchisee.monetization.performance',
                'Desempenho por Parceiro',
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 p-2 sm:p-6 sm:pt-0">
            <div className="h-[300px] w-full min-w-0 overflow-hidden">
              <ChartContainer
                config={{
                  margin: {
                    label: t('admin.margins'),
                    color: 'hsl(var(--primary))',
                  },
                  credits: {
                    label: t('admin.totalCredits'),
                    color: 'hsl(var(--secondary))',
                  },
                }}
              >
                <BarChart data={dummyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="partner"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="credits"
                    fill="var(--color-credits)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="margin"
                    fill="var(--color-margin)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="truncate">
              {t(
                'franchisee.monetization.evolution',
                'Evolução de Uso e Receita',
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 p-2 sm:p-6 sm:pt-0">
            <div className="h-[300px] w-full min-w-0 overflow-hidden">
              <ChartContainer
                config={{
                  revenue: {
                    label: t('admin.estRevenue'),
                    color: 'hsl(var(--primary))',
                  },
                  coupons: {
                    label: t('admin.volume'),
                    color: 'hsl(var(--destructive))',
                  },
                }}
              >
                <LineChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="coupons"
                    stroke="var(--color-coupons)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
