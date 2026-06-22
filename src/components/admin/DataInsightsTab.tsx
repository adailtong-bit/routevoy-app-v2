import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { GoogleMap } from '@/components/GoogleMap'

export function DataInsightsTab({
  franchiseId,
}: {
  franchiseId?: string | null
}) {
  const { t } = useLanguage()
  const [roiData, setRoiData] = useState<any[]>([])
  const [markers, setMarkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        let query = supabase.from('ad_campaigns').select('id, title, budget')
        if (franchiseId) {
          query = query.eq('franchise_id', franchiseId)
        }
        const { data: campaigns } = await query.limit(10)

        if (campaigns) {
          const formattedData = await Promise.all(
            campaigns.map(async (camp) => {
              const { data: sales } = await supabase
                .from('affiliate_transactions')
                .select('sale_amount')
                .ilike('product_name', `%${camp.title}%`)

              const totalSales =
                sales?.reduce(
                  (acc, s) => acc + Number(s.sale_amount || 0),
                  0,
                ) || 0

              return {
                name: camp.title.substring(0, 15),
                budget: camp.budget || 0,
                sales: totalSales,
              }
            }),
          )
          setRoiData(formattedData)
        }

        let merchQuery = supabase
          .from('merchants')
          .select('id, name, latitude, longitude')
        if (franchiseId) {
          merchQuery = merchQuery.eq('franchise_id', franchiseId)
        }
        const { data: merchants } = await merchQuery.limit(50)

        if (merchants) {
          const mapMarkers = merchants
            .filter((m) => m.latitude && m.longitude)
            .map((m) => ({
              id: m.id,
              lat: m.latitude!,
              lng: m.longitude!,
              title: m.name || '',
            }))
          setMarkers(mapMarkers)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [franchiseId])

  if (loading) {
    return (
      <div className="p-8 text-center">{t('common.loading', 'Loading...')}</div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {t('admin.insights', 'Data Insights')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ROI por Campanha</CardTitle>
            <CardDescription>
              Comparativo de Orçamento vs Vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  budget: { color: 'hsl(var(--primary))', label: 'Orçamento' },
                  sales: { color: 'hsl(var(--chart-2))', label: 'Vendas' },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roiData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="budget"
                      name="Orçamento"
                      fill="var(--color-budget)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="sales"
                      name="Vendas Geradas"
                      fill="var(--color-sales)"
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
            <CardTitle>Mapa de Calor (Transações/Lojas)</CardTitle>
            <CardDescription>
              Distribuição geográfica das atividades
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="h-[300px] w-full relative">
              {markers.length > 0 ? (
                <GoogleMap
                  center={{
                    lat: markers[0]?.lat || -23.55,
                    lng: markers[0]?.lng || -46.63,
                  }}
                  zoom={10}
                  markers={markers}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50">
                  Sem dados geográficos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
