import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CreditCard,
  Users,
  Ticket,
  DollarSign,
  Download,
  FileText,
  Settings2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CouponPerformance } from '@/components/shared/CouponPerformance'
import { Button } from '@/components/ui/button'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { useNotification } from '@/stores/NotificationContext'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FranchiseeOverviewTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { addNotification, notifications } = useNotification()
  const {
    franchises,
    companies,
    validationLogs,
    coupons,
    ads,
    platformSettings,
  } = useCouponStore()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const [period, setPeriod] = useState('this_month')
  const [widgets, setWidgets] = useState({
    sales: true,
    leads: true,
    campaigns: true,
    royalties: true,
  })

  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatNumber } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const franchiseCompanies = useMemo(
    () =>
      myFranchise
        ? companies.filter((c) => c.franchiseId === myFranchise.id)
        : [],
    [companies, myFranchise?.id],
  )
  const franchiseCompanyIds = useMemo(
    () => franchiseCompanies.map((c) => c.id),
    [franchiseCompanies],
  )

  const franchiseCoupons = useMemo(
    () =>
      coupons.filter(
        (c) =>
          c.franchiseId === franchiseId ||
          franchiseCompanyIds.includes(c.companyId || ''),
      ),
    [coupons, franchiseId, franchiseCompanyIds],
  )

  const [totalSales, setTotalSales] = useState(0)
  const [totalLeads, setTotalLeads] = useState(0)
  const [franchiseLogs, setFranchiseLogs] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const fetchRealData = async () => {
      if (!myFranchise) return

      try {
        const couponIds = franchiseCoupons.map((c) => c.id)

        if (couponIds.length > 0) {
          // Fetch engagements
          const { data: engagements, count } = await supabase
            .from('user_engagements')
            .select('id, campaign_id, user_id, action_type', { count: 'exact' })
            .in('campaign_id', couponIds)

          if (mounted) {
            setTotalLeads(count || 0)

            // Generate mock logs for table compat
            const mockLogs = (engagements || []).map((e) => ({
              id: e.id,
              couponId: e.campaign_id,
              userId: e.user_id,
              action: e.action_type,
            }))
            setFranchiseLogs(mockLogs)

            // Calculate revenue
            let revenue = 0
            engagements?.forEach((eng) => {
              const cpn = franchiseCoupons.find((c) => c.id === eng.campaign_id)
              revenue += cpn?.price || 50
            })
            setTotalSales(revenue)
          }
        } else {
          if (mounted) {
            setTotalLeads(0)
            setTotalSales(0)
            setFranchiseLogs([])
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard real data:', err)
      }
    }

    fetchRealData()
    return () => {
      mounted = false
    }
  }, [myFranchise, franchiseCoupons])
  const activeCampaigns = franchiseCoupons.filter(
    (c) => c.status === 'active',
  ).length

  const franchiseAds = useMemo(
    () =>
      myFranchise ? ads.filter((a) => a.franchiseId === myFranchise.id) : [],
    [ads, myFranchise?.id],
  )

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15
  const adRevenue = franchiseAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const [totalRoyalties, setTotalRoyalties] = useState(0)

  useEffect(() => {
    const fetchTransactions = async () => {
      // In a real scenario, this fetches affiliate_transactions linked to the franchise
      // For now we use the ads revenue logic combined with transactions if available
      try {
        const { data: txs } = await supabase
          .from('affiliate_transactions')
          .select('total_commission')
        const txRev = (txs || []).reduce(
          (acc, curr) => acc + (Number(curr.total_commission) || 0),
          0,
        )

        const calcAdRev = franchiseAds.reduce(
          (sum, ad) => sum + (ad.price || ad.budget || 0),
          0,
        )
        setTotalRoyalties((calcAdRev + txRev) * (royaltyRate / 100))
      } catch (err) {
        // fallback
        const calcAdRev = franchiseAds.reduce(
          (sum, ad) => sum + (ad.price || ad.budget || 0),
          0,
        )
        setTotalRoyalties(calcAdRev * (royaltyRate / 100))
      }
    }
    fetchTransactions()
  }, [franchiseAds, royaltyRate])

  // Mock comparison data based on period
  const comparisons = useMemo(() => {
    const factor =
      period === 'this_month' ? 1 : period === 'last_month' ? -0.5 : 2.5
    return {
      sales: 12.5 * factor,
      leads: 8.2 * factor,
      campaigns: 2.0 * factor,
      royalties: 10.1 * factor,
    }
  }, [period])

  useEffect(() => {
    if (!myFranchise || franchiseCoupons.length === 0) return

    // 1. High Performance Alert
    if (!notifications.some((n) => n.title.includes('High Performance'))) {
      const bestCoupon = franchiseCoupons.reduce((best, current) => {
        const currentClicks = current.visitCount || 0
        const bestClicks = best?.visitCount || 0
        return currentClicks > bestClicks ? current : best
      }, franchiseCoupons[0])

      if (bestCoupon && (bestCoupon.visitCount || 0) >= 10) {
        addNotification({
          title: `🚀 High Performance Alert!`,
          message: `The offer "${bestCoupon.title}" is performing exceptionally well in ${myFranchise.region}.`,
          type: 'alert',
          link: `/voucher/${bestCoupon.id}`,
          priority: 'high',
        })
      }
    }

    // 2. Performance Drop Alert
    if (!notifications.some((n) => n.title.includes('Performance Drop'))) {
      const underperforming = franchiseCoupons.find(
        (c) => c.status === 'active' && (c.visitCount || 0) === 0,
      )
      if (underperforming) {
        addNotification({
          title: `⚠️ Performance Drop Alert`,
          message: `The campaign "${underperforming.title}" has had no engagement recently. Consider revising it.`,
          type: 'alert',
          priority: 'medium',
        })
      }
    }
  }, [franchiseCoupons, myFranchise, notifications, addNotification])

  const handleExportCSV = () => {
    const headers = [
      'Coupon Name',
      'Category',
      'Total Clicks',
      'Total Redemptions',
      'Conversion Rate (%)',
      'Region',
    ]
    const rows = franchiseCoupons.map((c) => {
      const clicks = c.visitCount || 0
      const redemptions = franchiseLogs.filter(
        (log) => log.couponId === c.id,
      ).length
      const cr = clicks > 0 ? ((redemptions / clicks) * 100).toFixed(2) : '0.00'
      return [
        c.title,
        c.category,
        clicks.toString(),
        redemptions.toString(),
        cr,
        c.region || myFranchise?.region || '',
      ]
    })
    exportToCSV(
      headers,
      rows,
      `performance_report_${myFranchise?.region || 'franchise'}.csv`,
    )
  }

  const handleExportPDF = () => {
    const headers = [
      'Coupon Name',
      'Category',
      'Total Clicks',
      'Total Redemptions',
      'Conversion Rate (%)',
      'Region',
    ]
    const rows = franchiseCoupons.map((c) => {
      const clicks = c.visitCount || 0
      const redemptions = franchiseLogs.filter(
        (log) => log.couponId === c.id,
      ).length
      const cr = clicks > 0 ? ((redemptions / clicks) * 100).toFixed(2) : '0.00'
      return [
        c.title,
        c.category,
        clicks.toString(),
        redemptions.toString(),
        cr,
        c.region || myFranchise?.region || '',
      ]
    })
    exportToPDF(
      headers,
      rows,
      `performance_report_${myFranchise?.region || 'franchise'}.pdf`,
      `Performance Report - ${myFranchise?.region || 'Franchise'}`,
    )
  }

  if (!myFranchise) return null

  const TrendIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0
    return (
      <span
        className={cn(
          'text-xs font-medium flex items-center ml-2',
          isPositive ? 'text-emerald-600' : 'text-rose-600',
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3 mr-1" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1" />
        )}
        {Math.abs(value).toFixed(1)}%{' '}
        {t('dashboard.compare_previous', 'vs last period')}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0 w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-slate-800 truncate">
            {t('franchisee.overview.title', 'Visão Geral')}
          </h2>
          <p className="text-muted-foreground line-clamp-2 sm:line-clamp-none">
            {t(
              'franchisee.overview.desc',
              `Métricas consolidadas da região de ${myFranchise.region}.`,
            ).replace(
              '{region}',
              myFranchise.region || myFranchise.addressCountry || '',
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue
                placeholder={t('dashboard.period.this_month', 'This Month')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">
                {t('dashboard.period.this_month', 'This Month')}
              </SelectItem>
              <SelectItem value="last_month">
                {t('dashboard.period.last_month', 'Last Month')}
              </SelectItem>
              <SelectItem value="this_year">
                {t('dashboard.period.this_year', 'This Year')}
              </SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Settings2 className="w-4 h-4 mr-2" />
                {t('dashboard.customize', 'Customize')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {t('dashboard.visible_widgets', 'Visible Widgets')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={widgets.sales}
                onCheckedChange={(c) => setWidgets((p) => ({ ...p, sales: c }))}
              >
                {t('dashboard.widgets.sales', 'Sales')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgets.leads}
                onCheckedChange={(c) => setWidgets((p) => ({ ...p, leads: c }))}
              >
                {t('dashboard.widgets.leads', 'Leads')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgets.campaigns}
                onCheckedChange={(c) =>
                  setWidgets((p) => ({ ...p, campaigns: c }))
                }
              >
                {t('dashboard.widgets.campaigns', 'Campaigns')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={widgets.royalties}
                onCheckedChange={(c) =>
                  setWidgets((p) => ({ ...p, royalties: c }))
                }
              >
                {t('dashboard.widgets.royalties', 'Royalties')}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="font-medium h-9"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="font-medium h-9"
            title="Export PDF"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        {widgets.sales && (
          <Card className="shadow-sm border-slate-200 min-w-0 overflow-hidden animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
                {t('franchisee.overview.sales', 'Vendas Regionais')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-2xl font-black text-slate-800 truncate flex items-baseline">
                {formatCurrency(totalSales)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500 truncate">
                  {t('franchisee.overview.sales_desc', 'Volume transacionado')}
                </p>
                <TrendIndicator value={comparisons.sales} />
              </div>
            </CardContent>
          </Card>
        )}

        {widgets.leads && (
          <Card className="shadow-sm border-slate-200 min-w-0 overflow-hidden animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
                {t('franchisee.overview.leads', 'Leads Capturados')}
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500 shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-2xl font-black text-slate-800 truncate">
                {formatNumber(totalLeads)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500 truncate">
                  {t('franchisee.overview.leads_desc', 'Clientes adquiridos')}
                </p>
                <TrendIndicator value={comparisons.leads} />
              </div>
            </CardContent>
          </Card>
        )}

        {widgets.campaigns && (
          <Card className="shadow-sm border-slate-200 min-w-0 overflow-hidden animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
                {t('franchisee.overview.campaigns', 'Campanhas Ativas')}
              </CardTitle>
              <Ticket className="h-4 w-4 text-orange-500 shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-2xl font-black text-slate-800 truncate">
                {formatNumber(activeCampaigns)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500 truncate">
                  {t(
                    'franchisee.overview.campaigns_desc',
                    'De {total} no total',
                  ).replace('{total}', String(franchiseCoupons.length))}
                </p>
                <TrendIndicator value={comparisons.campaigns} />
              </div>
            </CardContent>
          </Card>
        )}

        {widgets.royalties && (
          <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500 min-w-0 overflow-hidden animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
                {t('franchisee.overview.royalties', 'Royalties Devidos')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500 shrink-0" />
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-2xl font-black text-orange-600 truncate">
                {formatCurrency(totalRoyalties)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500 truncate">
                  {t(
                    'franchisee.overview.royalties_desc',
                    '{rate}% sobre publicidade',
                  ).replace('{rate}', String(royaltyRate))}
                </p>
                <TrendIndicator value={comparisons.royalties} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CouponPerformance franchiseId={myFranchise.id} />
    </div>
  )
}
