import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Download,
  Activity,
  TrendingUp,
  Tag,
  Users,
  Filter,
  BarChart3,
  Store,
} from 'lucide-react'
import { exportToCSV } from '@/lib/exportUtils'
import { formatCurrency } from '@/lib/utils'

export function AdminPerformanceTab() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)

  // Data states
  const [validations, setValidations] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [franchises, setFranchises] = useState<any[]>([])
  const [engagements, setEngagements] = useState<any[]>([])

  // Filter states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedFranchise, setSelectedFranchise] = useState('all')
  const [selectedMerchant, setSelectedMerchant] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [
        { data: valData },
        { data: camData },
        { data: merData },
        { data: fraData },
        { data: engData },
      ] = await Promise.all([
        supabase
          .from('merchant_validations')
          .select('id, company_id, promotion_id, discount_amount, created_at'),
        supabase
          .from('ad_campaigns')
          .select(
            'id, title, company_id, region, promotion_model, franchise_id',
          ),
        supabase.from('merchants').select('id, name, region, franchise_id'),
        supabase.from('franchises').select('id, name, region'),
        supabase
          .from('user_engagements')
          .select('id, campaign_id, action_type, created_at'),
      ])

      setValidations(valData || [])
      setCampaigns(camData || [])
      setMerchants(merData || [])
      setFranchises(fraData || [])
      setEngagements(engData || [])
    } catch (error) {
      console.error('Error fetching BI data', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate unique regions
  const regions = useMemo(() => {
    const r = new Set<string>()
    franchises.forEach((f) => f.region && r.add(f.region))
    merchants.forEach((m) => m.region && r.add(m.region))
    return Array.from(r).sort()
  }, [franchises, merchants])

  // Filtered Options
  const availableFranchises = useMemo(() => {
    if (selectedRegion === 'all') return franchises
    return franchises.filter((f) => f.region === selectedRegion)
  }, [franchises, selectedRegion])

  const availableMerchants = useMemo(() => {
    let m = merchants
    if (selectedRegion !== 'all')
      m = m.filter((x) => x.region === selectedRegion)
    if (selectedFranchise !== 'all')
      m = m.filter((x) => x.franchise_id === selectedFranchise)
    return m
  }, [merchants, selectedRegion, selectedFranchise])

  // Filtered Data
  const filteredData = useMemo(() => {
    let fValidations = validations
    let fEngagements = engagements

    if (startDate) {
      const start = new Date(startDate).getTime()
      fValidations = fValidations.filter(
        (v) => new Date(v.created_at).getTime() >= start,
      )
      fEngagements = fEngagements.filter(
        (e) => new Date(e.created_at).getTime() >= start,
      )
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000 // end of day
      fValidations = fValidations.filter(
        (v) => new Date(v.created_at).getTime() <= end,
      )
      fEngagements = fEngagements.filter(
        (e) => new Date(e.created_at).getTime() <= end,
      )
    }

    if (selectedMerchant !== 'all') {
      fValidations = fValidations.filter(
        (v) => v.company_id === selectedMerchant,
      )
      const merchantCampaigns = campaigns
        .filter((c) => c.company_id === selectedMerchant)
        .map((c) => c.id)
      fEngagements = fEngagements.filter((e) =>
        merchantCampaigns.includes(e.campaign_id),
      )
    } else if (selectedFranchise !== 'all') {
      const franchiseMerchants = merchants
        .filter((m) => m.franchise_id === selectedFranchise)
        .map((m) => m.id)
      fValidations = fValidations.filter((v) =>
        franchiseMerchants.includes(v.company_id),
      )
      const franchiseCampaigns = campaigns
        .filter(
          (c) =>
            c.franchise_id === selectedFranchise ||
            franchiseMerchants.includes(c.company_id),
        )
        .map((c) => c.id)
      fEngagements = fEngagements.filter((e) =>
        franchiseCampaigns.includes(e.campaign_id),
      )
    } else if (selectedRegion !== 'all') {
      const regionMerchants = merchants
        .filter((m) => m.region === selectedRegion)
        .map((m) => m.id)
      fValidations = fValidations.filter((v) =>
        regionMerchants.includes(v.company_id),
      )
      const regionCampaigns = campaigns
        .filter(
          (c) =>
            c.region === selectedRegion ||
            regionMerchants.includes(c.company_id),
        )
        .map((c) => c.id)
      fEngagements = fEngagements.filter((e) =>
        regionCampaigns.includes(e.campaign_id),
      )
    }

    return { fValidations, fEngagements }
  }, [
    validations,
    engagements,
    campaigns,
    merchants,
    startDate,
    endDate,
    selectedRegion,
    selectedFranchise,
    selectedMerchant,
  ])

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const { fValidations, fEngagements } = filteredData
    const totalValidations = fValidations.length
    const totalDiscount = fValidations.reduce(
      (sum, v) => sum + (Number(v.discount_amount) || 0),
      0,
    )
    const totalEngagements = fEngagements.length
    const conversionRate =
      totalEngagements > 0 ? (totalValidations / totalEngagements) * 100 : 0

    return { totalValidations, totalDiscount, totalEngagements, conversionRate }
  }, [filteredData])

  // Promotion Models Performance
  const modelsChartData = useMemo(() => {
    const { fValidations, fEngagements } = filteredData

    // Group campaigns by model
    const campaignsByModel: Record<string, string[]> = {}
    campaigns.forEach((c) => {
      const model = c.promotion_model || 'standard'
      if (!campaignsByModel[model]) campaignsByModel[model] = []
      campaignsByModel[model].push(c.id)
    })

    const data = Object.keys(campaignsByModel).map((model) => {
      const cIds = campaignsByModel[model]
      const vals = fValidations.filter((v) =>
        cIds.includes(v.promotion_id),
      ).length
      const engs = fEngagements.filter((e) =>
        cIds.includes(e.campaign_id),
      ).length
      return {
        name: model.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        validations: vals,
        engagements: engs,
      }
    })

    return data
  }, [filteredData, campaigns])

  // Leaderboard
  const leaderboard = useMemo(() => {
    const { fValidations } = filteredData
    const merchantStats: Record<
      string,
      { validations: number; discount: number }
    > = {}

    fValidations.forEach((v) => {
      const cid = v.company_id
      if (!cid) return
      if (!merchantStats[cid])
        merchantStats[cid] = { validations: 0, discount: 0 }
      merchantStats[cid].validations += 1
      merchantStats[cid].discount += Number(v.discount_amount) || 0
    })

    const ranked = Object.entries(merchantStats)
      .map(([company_id, stats]) => {
        const merchant = merchants.find((m) => m.id === company_id)
        return {
          company_id,
          merchantName: merchant?.name || 'Unknown',
          region: merchant?.region || 'N/A',
          ...stats,
        }
      })
      .sort((a, b) => b.validations - a.validations)

    return ranked.slice(0, 10)
  }, [filteredData, merchants])

  const handleExportCSV = () => {
    const headers = ['Merchant', 'Region', 'Validations', 'Total Discount']
    const rows = leaderboard.map((l) => [
      l.merchantName,
      l.region,
      l.validations.toString(),
      l.discount.toFixed(2),
    ])
    exportToCSV(headers, rows, 'store_performance_leaderboard.csv')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Activity className="w-8 h-8 animate-spin mr-3 text-primary" />
        {t('common.loading', 'Loading...')}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {t(
              'admin.bi_dashboard.title',
              'Business Intelligence & Performance',
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t(
              'admin.bi_dashboard.desc',
              'Administrative Summary Dashboard with performance metrics across all hierarchical levels.',
            )}
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          {t('admin.bi_dashboard.export', 'Export CSV')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {t('admin.bi_dashboard.filters', 'Advanced Filters')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('admin.bi_dashboard.region', 'Region')}
            </label>
            <Select
              value={selectedRegion}
              onValueChange={(val) => {
                setSelectedRegion(val)
                setSelectedFranchise('all')
                setSelectedMerchant('all')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('admin.bi_dashboard.all_regions', 'All Regions')}
                </SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('admin.bi_dashboard.franchise', 'Franchise')}
            </label>
            <Select
              value={selectedFranchise}
              onValueChange={(val) => {
                setSelectedFranchise(val)
                setSelectedMerchant('all')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('admin.bi_dashboard.all_franchises', 'All Franchises')}
                </SelectItem>
                {availableFranchises.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('admin.bi_dashboard.merchant', 'Merchant')}
            </label>
            <Select
              value={selectedMerchant}
              onValueChange={setSelectedMerchant}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('admin.bi_dashboard.all_merchants', 'All Merchants')}
                </SelectItem>
                {availableMerchants.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('admin.bi_dashboard.start_date', 'Start Date')}
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {t('admin.bi_dashboard.end_date', 'End Date')}
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {t(
                  'admin.bi_dashboard.metrics.total_validations',
                  'Total Validations',
                )}
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {metrics.totalValidations}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Tag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {t(
                  'admin.bi_dashboard.metrics.engagements',
                  'User Engagements',
                )}
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {metrics.totalEngagements}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {t(
                  'admin.bi_dashboard.metrics.conversion_rate',
                  'Conversion Rate',
                )}
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {metrics.conversionRate.toFixed(1)}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {t(
                  'admin.bi_dashboard.metrics.total_discount',
                  'Total Discount Volume',
                )}
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {formatCurrency(metrics.totalDiscount)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promotion Models Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t(
                'admin.bi_dashboard.models.title',
                'Promotion Models Performance',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.bi_dashboard.models.desc',
                'Comparing validations and engagements across campaign models.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  engagements: {
                    label: t(
                      'admin.bi_dashboard.metrics.engagements',
                      'Engagements',
                    ),
                    color: 'hsl(var(--primary))',
                  },
                  validations: {
                    label: t(
                      'admin.bi_dashboard.metrics.total_validations',
                      'Validations',
                    ),
                    color: 'hsl(var(--secondary))',
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modelsChartData}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      content={<ChartTooltipContent />}
                    />
                    <Legend />
                    <Bar
                      dataKey="engagements"
                      fill="var(--color-engagements)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="validations"
                      fill="var(--color-validations)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Store Performance Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              {t(
                'admin.bi_dashboard.leaderboard.title',
                'Store Performance Leaderboard',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.bi_dashboard.leaderboard.desc',
                'Top 10 merchants by validation count.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0">
                  <TableRow>
                    <TableHead>
                      {t('admin.bi_dashboard.leaderboard.merchant', 'Merchant')}
                    </TableHead>
                    <TableHead>
                      {t('admin.bi_dashboard.region', 'Region')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t(
                        'admin.bi_dashboard.leaderboard.validations',
                        'Validations',
                      )}
                    </TableHead>
                    <TableHead className="text-right">
                      {t(
                        'admin.bi_dashboard.leaderboard.discount',
                        'Discount Volume',
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-slate-500"
                      >
                        {t('common.none', 'None')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaderboard.map((item, i) => (
                      <TableRow key={item.company_id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {i + 1}
                            </span>
                            {item.merchantName}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {item.region}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.validations}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {formatCurrency(item.discount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
