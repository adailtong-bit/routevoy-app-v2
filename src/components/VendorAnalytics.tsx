import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
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

export function VendorAnalytics() {
  const { t } = useLanguage()

  const activityData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const hours = ['Manhã', 'Tarde', 'Noite']
    const data = []

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 3; h++) {
        data.push({
          day: days[d],
          hour: hours[h],
          value: Math.floor(Math.random() * 100),
        })
      }
    }
    return data
  }, [])

  const barData = useMemo(() => {
    const data = []
    for (let i = 1; i <= 7; i++) {
      data.push({
        name: `Dia ${i}`,
        clicks: Math.floor(Math.random() * 500) + 100,
        conversions: Math.floor(Math.random() * 50) + 10,
      })
    }
    return data
  }, [])

  const getColor = (value: number) => {
    if (value < 20) return 'bg-emerald-100 text-emerald-800'
    if (value < 50) return 'bg-emerald-300 text-emerald-900'
    if (value < 80) return 'bg-emerald-500 text-white'
    return 'bg-emerald-700 text-white'
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('vendor.analytics.trend', 'Tendência de Conversões')}
          </CardTitle>
          <CardDescription>
            {t(
              'vendor.analytics.trend_desc',
              'Cliques vs Resgates nos últimos 7 dias',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{
                clicks: {
                  label: t('vendor.analytics.clicks', 'Cliques'),
                  color: 'hsl(var(--primary))',
                },
                conversions: {
                  label: t('vendor.analytics.conversions', 'Conversões'),
                  color: 'hsl(var(--emerald-500))',
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="clicks"
                    fill="var(--color-clicks)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="conversions"
                    fill="var(--color-conversions)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('vendor.analytics.heatmap', 'Heatmap de Engajamento')}
          </CardTitle>
          <CardDescription>
            {t(
              'vendor.analytics.heatmap_desc',
              'Intensidade de acessos por dia e período',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-1 text-xs text-center text-slate-500 mb-2">
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
                      className={`h-8 rounded-md ${getColor(cell.value)} flex items-center justify-center text-[10px] font-bold shadow-sm transition-transform hover:scale-105`}
                      title={`${cell.value} interações`}
                    >
                      {cell.value > 0 ? cell.value : ''}
                    </div>
                  ))}
              </div>
            ))}
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-500">
              <span>Menos</span>
              <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
              <span>Mais</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
