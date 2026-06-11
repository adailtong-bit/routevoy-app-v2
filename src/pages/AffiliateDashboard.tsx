import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Download,
  ExternalLink,
  RefreshCw,
  Link as LinkIcon,
  Activity,
  Users,
  TrendingUp,
  Send,
  MessageCircle,
  Wallet,
  Clock,
} from 'lucide-react'
import { searchAffiliateDeals } from '@/services/affiliates'
import { AdminCRM } from '@/components/admin/crm/AdminCRM'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  LineChart,
  Line,
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

export default function AffiliateDashboard() {
  const { user, syncProfile } = useAuth()
  const { t } = useLanguage()
  const [partner, setPartner] = useState<any>(null)
  const [platforms, setPlatforms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [platformIds, setPlatformIds] = useState<Record<string, string>>({})
  const [importQuery, setImportQuery] = useState('')
  const [importResults, setImportResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [period, setPeriod] = useState('this_month')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    if (user) {
      fetchData(false)
    }
  }, [user])

  const fetchData = async (forceSync = false) => {
    setLoading(true)
    try {
      if (forceSync && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile) {
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              role: user.user_metadata?.role || 'affiliate',
              is_affiliate: true,
            },
            { onConflict: 'id' },
          )
        } else if (
          !profile.is_affiliate &&
          profile.role !== 'super_admin' &&
          profile.role !== 'admin' &&
          user.email !== 'adailtong@gmail.com'
        ) {
          await supabase
            .from('profiles')
            .update({ role: 'affiliate', is_affiliate: true })
            .eq('id', user.id)
        } else if (
          !profile.is_affiliate &&
          (profile.role === 'super_admin' ||
            profile.role === 'admin' ||
            user.email === 'adailtong@gmail.com')
        ) {
          await supabase
            .from('profiles')
            .update({ is_affiliate: true })
            .eq('id', user.id)
        }
      }

      // Robust fetch: try user_id first, then email
      let pData = null
      const { data: pDataById } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (pDataById) {
        pData = pDataById
      } else if (user?.email) {
        const { data: pDataByEmail } = await supabase
          .from('affiliate_partners')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (pDataByEmail) {
          pData = pDataByEmail
          // Auto-heal the link
          await supabase
            .from('affiliate_partners')
            .update({ user_id: user.id } as any)
            .eq('id', pDataByEmail.id)
        } else {
          // Check profile role to auto-create if missing
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
          if (
            profile?.role === 'affiliate' ||
            profile?.role === 'admin' ||
            profile?.role === 'super_admin' ||
            user.email === 'adailtong@gmail.com' ||
            forceSync
          ) {
            const { data: newPartner } = await supabase
              .from('affiliate_partners')
              .upsert(
                {
                  user_id: user.id,
                  email: user.email,
                  name: user.user_metadata?.name || user.email.split('@')[0],
                  status: 'active',
                },
                { onConflict: 'email' },
              )
              .select()
              .single()
            if (newPartner) pData = newPartner
          }
        }
      }

      if (pData) {
        setPartner(pData)
        setPlatformIds(pData.platform_ids || {})

        const { data: txData } = await supabase
          .from('affiliate_transactions')
          .select('*')
          .eq('affiliate_id', pData.id)
        if (txData) setTransactions(txData)

        const { data: wData } = await supabase
          .from('affiliate_withdrawals')
          .select('*')
          .eq('affiliate_id', pData.id)
          .order('request_date', { ascending: false })
        if (wData) setWithdrawals(wData)
      }

      const { data: platData } = await supabase
        .from('affiliate_platforms')
        .select('*')
        .eq('status', 'active')

      setPlatforms(platData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIds = async () => {
    if (!partner) return
    try {
      const { error } = await supabase
        .from('affiliate_partners')
        .update({ platform_ids: platformIds } as any)
        .eq('id', partner.id)

      if (error) throw error
      toast.success(t('common.success', 'IDs updated successfully!'))
    } catch (err: any) {
      toast.error(t('common.error', 'Error saving IDs: ') + err.message)
    }
  }

  const handleSearchImport = async () => {
    if (!importQuery.trim()) return
    setIsSearching(true)
    try {
      const { data: preLaunchData } = await supabase
        .from('discovered_promotions')
        .select('*')
        .eq('promotion_model', 'pre-launch')
        .eq('status', 'published')
        .ilike('title', `%${importQuery}%`)
        .limit(10)

      const apiResults = await searchAffiliateDeals(
        importQuery,
        10,
        platformIds,
      )

      const formattedPreLaunch = (preLaunchData || []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        originalPrice: p.original_price,
        discountPercentage: p.discount_percentage,
        imageUrl: p.image_url,
        productLink: p.product_link || p.source_url,
        storeName: p.store_name,
        currency: p.currency || 'USD',
        isPreLaunch: true,
      }))

      const combined = [...formattedPreLaunch, ...(apiResults || [])]

      setImportResults(combined)
      if (combined.length === 0) {
        toast.info(t('common.info', 'No campaigns found.'))
      }
    } catch (err: any) {
      toast.error(t('common.error', 'Search error: ') + err.message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleImportToSite = async (deal: any) => {
    try {
      if (deal.isPreLaunch) {
        toast.success(
          t(
            'common.success',
            'This is an internal Pre-launch campaign. You can share its link directly!',
          ),
        )
        return
      }

      const { error } = await supabase.from('discovered_promotions').insert({
        title: deal.title,
        description: deal.description,
        price: deal.price,
        original_price: deal.originalPrice,
        discount: deal.discount,
        discount_percentage: deal.discountPercentage,
        image_url: deal.imageUrl,
        product_link: deal.productLink,
        store_name: deal.storeName,
        status: 'approved',
        category: 'affiliate',
        currency: deal.currency || 'USD',
        reward_id: partner?.id,
      })
      if (error) throw error
      toast.success(
        t('common.success', 'Campaign imported to site with your link!'),
      )
      setImportResults((prev) => prev.filter((d) => d.id !== deal.id))
    } catch (error: any) {
      toast.error(t('common.error', 'Import error: ') + error.message)
    }
  }

  const handleRequestWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error(
        t('affiliate.wallet.invalid_amount', 'Please enter a valid amount.'),
      )
      return
    }
    if (amount > availableBalance) {
      toast.error(
        t('affiliate.wallet.insufficient_funds', 'Insufficient funds.'),
      )
      return
    }
    if (!partner) return

    try {
      const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .insert({
          affiliate_id: partner.id,
          amount: amount,
          status: 'pending',
          payment_method: { type: 'pix', key: partner.tax_id || '' },
        })
        .select()
        .single()

      if (error) throw error

      setWithdrawals([data, ...withdrawals])
      setWithdrawAmount('')
      toast.success(
        t(
          'affiliate.wallet.withdraw_success',
          'Withdrawal requested successfully!',
        ),
      )
    } catch (err: any) {
      toast.error(
        t('common.error', 'Error requesting withdrawal: ') + err.message,
      )
    }
  }

  const totalEarnings = transactions.reduce(
    (acc, tx) => acc + (Number(tx.affiliate_earnings) || 0),
    0,
  )
  const totalWithdrawn = withdrawals.reduce(
    (acc, w) => acc + (Number(w.amount) || 0),
    0,
  )
  const availableBalance = totalEarnings - totalWithdrawn

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">
          {t('affiliate.loading', 'Loading affiliate dashboard...')}
        </p>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="container max-w-4xl py-12 animate-fade-in-up">
        <Card className="text-center p-12 border-dashed shadow-sm">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <CardTitle className="text-2xl text-amber-600 mb-4">
            {t('affiliate.not_found_title', 'Affiliate Profile Not Found')}
          </CardTitle>
          <CardDescription className="max-w-md mx-auto mb-6 text-base">
            {t(
              'affiliate.not_found_desc',
              'We could not locate your partner record. If you recently registered, please ensure you selected the affiliate option or contact support.',
            )}
          </CardDescription>
          <div className="flex gap-4 justify-center mt-4">
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="px-8 font-bold"
            >
              {t('common.back_home', 'Back to Home')}
            </Button>
            <Button
              onClick={async () => {
                if (syncProfile) await syncProfile()
                fetchData(true)
              }}
              className="px-8 font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('affiliate.initialize_profile', 'Initialize Partner Profile')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (partner.status === 'pending') {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="text-center p-12 border-dashed border-2">
          <Activity className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
          <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
            {t('affiliate.pending_title', 'Account Under Review')}
          </CardTitle>
          <CardDescription className="text-lg">
            {t(
              'affiliate.pending_desc',
              'Your registration as an affiliate partner is pending approval by our team. You will receive a notice as soon as features are released.',
            )}
          </CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('affiliate.dashboard_title', 'Affiliate Dashboard')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(
              'affiliate.dashboard_desc',
              'Manage your tracking links and find offers to promote.',
            )}
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 px-4 py-1 text-sm font-semibold"
        >
          {t('affiliate.status_active', 'Account Status: Active')}
        </Badge>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="mb-6 h-12 w-full justify-start overflow-x-auto bg-transparent border-b rounded-none p-0 flex-nowrap whitespace-nowrap">
          <TabsTrigger
            value="platforms"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <LinkIcon className="w-4 h-4" />{' '}
            {t('affiliate.tabs.platforms', 'My Platforms (IDs)')}
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <Search className="w-4 h-4" />{' '}
            {t('affiliate.tabs.search', 'Search Offers')}
          </TabsTrigger>
          <TabsTrigger
            value="crm"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <Users className="w-4 h-4" />{' '}
            {t('affiliate.tabs.crm', 'CRM & Campaigns')}
          </TabsTrigger>
          <TabsTrigger
            value="wallet"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <Wallet className="w-4 h-4" />{' '}
            {t('affiliate.tabs.wallet', 'Wallet & Withdrawals')}
          </TabsTrigger>
          <TabsTrigger
            value="crawler"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <Activity className="w-4 h-4" /> Crawler (Logs)
          </TabsTrigger>
          <TabsTrigger
            value="boosts"
            className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            <TrendingUp className="w-4 h-4" /> Comprar Destaque
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="platforms"
          className="animate-in fade-in-50 duration-300"
        >
          <Card className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle>
                {t('affiliate.platforms.title', 'Affiliate Identifiers')}
              </CardTitle>
              <CardDescription>
                {t(
                  'affiliate.platforms.desc',
                  'Register your unique IDs for each platform. The administrator has enabled these networks for you.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {platforms.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t(
                    'affiliate.platforms.empty',
                    'No platform configured by the administrator at the moment.',
                  )}
                </div>
              ) : (
                platforms.map((plat) => {
                  const commOverride = partner.platform_commissions?.[plat.name]
                  const actualComm =
                    commOverride !== undefined
                      ? commOverride
                      : plat.base_commission_rate

                  return (
                    <div
                      key={plat.id}
                      className="grid md:grid-cols-2 gap-6 items-end bg-white p-5 rounded-lg border shadow-sm"
                    >
                      <div className="space-y-1">
                        <Label className="text-base font-bold text-slate-800">
                          {plat.name}
                        </Label>
                        <p className="text-sm text-green-600 font-medium">
                          {t(
                            'affiliate.platforms.commission',
                            'Negotiated commission:',
                          )}{' '}
                          {actualComm}%
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">
                          {t(
                            'affiliate.platforms.id_label',
                            'Your ID / Affiliate Tag on the platform',
                          )}
                        </Label>
                        <Input
                          placeholder={`Ex: my_id_${plat.name.toLowerCase()}`}
                          value={platformIds[plat.name] || ''}
                          onChange={(e) =>
                            setPlatformIds((prev) => ({
                              ...prev,
                              [plat.name]: e.target.value,
                            }))
                          }
                          className="bg-slate-50"
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t pt-4">
              <Button
                onClick={handleSaveIds}
                className="w-full md:w-auto ml-auto font-bold"
                disabled={platforms.length === 0}
              >
                {t('affiliate.platforms.save', 'Save Identifiers')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="search"
          className="animate-in fade-in-50 duration-300"
        >
          <Card className="border shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle>
                {t('affiliate.search.title', 'Search and Import Campaigns')}
              </CardTitle>
              <CardDescription>
                {t(
                  'affiliate.search.desc',
                  'Search for offers on registered platforms. The links will already come with your affiliate ID injected.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={importQuery}
                    onChange={(e) => setImportQuery(e.target.value)}
                    placeholder={t(
                      'affiliate.search.placeholder',
                      'Ex: iPhone 15, OLED TV, Nike Sneakers...',
                    )}
                    className="pl-9 h-11"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchImport()}
                  />
                </div>
                <Button
                  onClick={handleSearchImport}
                  disabled={isSearching}
                  className="h-11 px-8"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {t('common.search', 'Search')}
                </Button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-2">
                {importResults.length === 0 && !isSearching && (
                  <div className="text-center py-16 text-muted-foreground border-2 rounded-lg border-dashed bg-slate-50">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    {t(
                      'affiliate.search.empty',
                      'Perform a search to find and promote products.',
                    )}
                  </div>
                )}
                {importResults.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex flex-col sm:flex-row gap-5 p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                  >
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-lg line-clamp-2 text-slate-900 leading-tight">
                          {deal.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700"
                          >
                            {deal.storeName}
                          </Badge>
                          {deal.discountPercentage && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                              {deal.discountPercentage?.toFixed(0)}% OFF
                            </span>
                          )}
                          {deal.originalPrice && (
                            <span className="text-sm text-slate-400 line-through">
                              $ {deal.originalPrice}
                            </span>
                          )}
                          <span className="text-xl font-extrabold text-slate-900">
                            $ {deal.price}
                          </span>
                        </div>
                        <a
                          href={deal.productLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-3 inline-flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />{' '}
                          {t(
                            'affiliate.search.test_link',
                            'Test my Affiliate Link',
                          )}
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center mt-3 sm:mt-0 min-w-[140px] border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-5">
                      <Button
                        onClick={() => handleImportToSite(deal)}
                        className="gap-2 w-full font-bold h-11 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4" />{' '}
                        {t('affiliate.search.promote', 'Promote on Site')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="animate-in fade-in-50 duration-300">
          <AdminCRM affiliateId={partner.id} />
        </TabsContent>
        <TabsContent
          value="wallet"
          className="animate-in fade-in-50 duration-300 space-y-6"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border shadow-sm md:col-span-2">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle>
                  {t('affiliate.wallet.title', 'Financial Balance')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'affiliate.wallet.desc',
                    'Manage your earnings and request withdrawals.',
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {t('affiliate.wallet.total_earnings', 'Total Earnings')}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${totalEarnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {t('affiliate.wallet.total_withdrawn', 'Total Withdrawn')}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${totalWithdrawn.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-emerald-800 mb-1">
                      {t('affiliate.wallet.available', 'Available Balance')}
                    </p>
                    <p className="text-2xl font-black text-emerald-600">
                      ${availableBalance.toFixed(2)}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {t('affiliate.wallet.history', 'Withdrawal History')}
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>
                          {t('affiliate.wallet.date', 'Request Date')}
                        </TableHead>
                        <TableHead>
                          {t('affiliate.wallet.amount', 'Amount')}
                        </TableHead>
                        <TableHead>
                          {t('affiliate.wallet.status', 'Status')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-6 text-slate-500"
                          >
                            {t(
                              'affiliate.wallet.no_withdrawals',
                              'No withdrawal requests yet.',
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        withdrawals.map((w) => (
                          <TableRow key={w.id}>
                            <TableCell>
                              {new Date(w.request_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-bold">
                              ${Number(w.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  w.status === 'paid'
                                    ? 'default'
                                    : w.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {w.status === 'paid'
                                  ? t('affiliate.wallet.paid', 'Paid')
                                  : w.status === 'rejected'
                                    ? t('affiliate.wallet.rejected', 'Rejected')
                                    : t('affiliate.wallet.pending', 'Pending')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm h-fit">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle>
                  {t('affiliate.wallet.request', 'Request Withdrawal')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'affiliate.wallet.request_desc',
                    'Withdrawals are processed via PIX/Bank Transfer.',
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>
                    {t(
                      'affiliate.wallet.amount_label',
                      'Amount to Withdraw ($)',
                    )}
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={availableBalance}
                  />
                  <p className="text-xs text-slate-500 flex justify-between">
                    <span>
                      {t('affiliate.wallet.min_withdraw', 'Min: $50.00')}
                    </span>
                    <button
                      className="text-primary font-medium hover:underline"
                      onClick={() =>
                        setWithdrawAmount(availableBalance.toString())
                      }
                    >
                      {t('affiliate.wallet.withdraw_all', 'Withdraw All')}
                    </button>
                  </p>
                </div>

                <Alert className="bg-amber-50 border-amber-200 py-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800 text-sm">
                    {t('affiliate.wallet.time_title', 'Processing Time')}
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs">
                    {t(
                      'affiliate.wallet.time_desc',
                      'Payments are processed within 3-5 business days.',
                    )}
                  </AlertDescription>
                </Alert>

                <Button
                  className="w-full font-bold h-11"
                  onClick={handleRequestWithdrawal}
                  disabled={availableBalance < 50 || !withdrawAmount}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('affiliate.wallet.submit', 'Submit Request')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="crawler"
          className="animate-in fade-in-50 duration-300"
        >
          <AffiliateCrawlerLogs platformIds={platformIds} />
        </TabsContent>

        <TabsContent
          value="boosts"
          className="animate-in fade-in-50 duration-300"
        >
          <AffiliateBoostsTab partner={partner} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AffiliateBoostsTab({ partner }: { partner: any }) {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    supabase
      .from('ad_pricing')
      .select('*')
      .eq('environment', 'production')
      .order('price')
      .then(({ data }) => {
        setPlans(data || [])
        setLoading(false)
      })
  }, [])

  const handlePurchase = async (plan: any) => {
    if (!partner?.id) return

    setProcessing(true)
    const advertiserId = partner.id

    // Ensure ad_advertiser exists
    await supabase.from('ad_advertisers').upsert(
      {
        id: advertiserId,
        company_name: partner.name || 'Affiliate',
        environment: 'production',
      },
      { onConflict: 'id' },
    )

    const { data: campaign, error: campaignError } = await supabase
      .from('ad_campaigns')
      .insert({
        title: `Impulsionamento Afiliado: ${plan.placement}`,
        company_id: advertiserId,
        placement: plan.placement,
        billing_type: plan.billing_type,
        price: plan.price,
        status: 'pending_payment',
        environment: 'production',
      })
      .select()
      .single()

    if (campaignError) {
      toast.error('Erro ao criar campanha: ' + campaignError.message)
      setProcessing(false)
      return
    }

    const { error } = await supabase.from('ad_invoices').insert({
      ad_id: campaign.id,
      advertiser_id: advertiserId,
      reference_number: `BOOST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount: plan.price,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'pending',
      environment: 'production',
    })

    setProcessing(false)

    if (error) {
      toast.error('Erro ao gerar fatura: ' + error.message)
    } else {
      toast.success(
        'Plano adquirido! Verifique a fatura no painel financeiro (se disponível).',
      )
    }
  }

  if (loading)
    return <div className="p-8 text-center">Carregando planos...</div>

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <CardTitle>Marketplace de Impulsionamento</CardTitle>
        <CardDescription>
          Compre destaque para os seus links de afiliado e aumente suas
          conversões.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {plans.length === 0 ? (
          <div className="text-center py-16 text-slate-500 border border-dashed rounded-xl">
            Nenhum plano disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="border rounded-xl p-6 bg-white flex flex-col"
              >
                <h3 className="text-xl font-bold capitalize mb-2">
                  {plan.placement}
                </h3>
                <div className="text-3xl font-black text-primary mb-4">
                  R$ {plan.price}{' '}
                  <span className="text-sm font-medium text-slate-500">
                    /{plan.billing_type}
                  </span>
                </div>
                {plan.duration_days && (
                  <p className="text-sm text-slate-600 mb-6">
                    Duração: {plan.duration_days} dias
                  </p>
                )}
                <Button
                  className="mt-auto w-full font-bold"
                  onClick={() => handlePurchase(plan)}
                  disabled={processing}
                >
                  {processing ? 'Processando...' : 'Comprar Destaque'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AffiliateCrawlerLogs({
  platformIds,
}: {
  platformIds: Record<string, string>
}) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      const allowedSources = Object.keys(platformIds).filter(
        (k) => platformIds[k],
      )

      let query = supabase
        .from('crawler_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (allowedSources.length > 0) {
        query = query.in('source_id', allowedSources)
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }

      const { data } = await query
      if (data) setLogs(data)
      setLoading(false)
    }
    fetchLogs()
  }, [platformIds])

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando logs do crawler...
      </div>
    )

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <CardTitle>Logs do Crawler (Afiliado)</CardTitle>
        <CardDescription>
          Visualize os logs do crawler filtrados pelos identificadores das
          plataformas que você possui acesso.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 rounded-lg border-dashed bg-slate-50">
            Nenhum log encontrado para suas plataformas configuradas.
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fonte / Plataforma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Itens Encontrados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.source_id || log.store_name || 'Desconhecida'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === 'success' ? 'default' : 'destructive'
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.items_found || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
