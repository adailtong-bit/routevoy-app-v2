import { useState, useEffect } from 'react'
import {
  Activity,
  Users,
  Store,
  DollarSign,
  Bell,
  Megaphone,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { PromotionCrawler } from '@/components/admin/PromotionCrawler'
import { AdminAdsManager } from '@/components/admin/AdminAdsManager'
import { AdminNetworkAdsTab } from '@/components/admin/AdminNetworkAdsTab'
import { AdminAffiliatesTab } from '@/components/admin/AdminAffiliatesTab'
import { DataInsightsTab } from '@/components/admin/DataInsightsTab'
import { AdminMonetizationTab } from '@/components/admin/AdminMonetizationTab'
import { PartnerPoliciesTab } from '@/components/admin/PartnerPoliciesTab'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'
import { AdminSeasonalTab } from '@/components/admin/AdminSeasonalTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { AdminInterestsTab } from '@/components/admin/AdminInterestsTab'
import { AdminHierarchyTab } from '@/components/admin/AdminHierarchyTab'
import { AdminTranslationsTab } from '@/components/admin/AdminTranslationsTab'
import { AdminPerformanceTab } from '@/components/admin/AdminPerformanceTab'
import { AdminNotificationsTab } from '@/components/admin/AdminNotificationsTab'
import { AdminSettingsTab } from '@/components/admin/AdminSettingsTab'
import { AdminContentTab } from '@/components/admin/AdminContentTab'
import { AdminEmailLogsTab } from '@/components/admin/AdminEmailLogsTab'
import { FinanceDashboardTab } from '@/components/finance/FinanceDashboardTab'
import { AdminOffersTab } from '@/components/admin/AdminOffersTab'
import { AdminApprovalsTab } from '@/components/admin/AdminApprovalsTab'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Tags } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { cn } from '@/lib/utils'
import { useEnvironment } from '@/hooks/use-environment'

export default function AdminDashboard() {
  const { isDevelopment } = useEnvironment()
  const { t } = useLanguage()
  const { companies, franchises, user: storeUser } = useCouponStore()
  const { user: authUser, role: authRole } = useAuth()
  const { formatNumber, formatCurrency } = useRegionFormatting(
    storeUser?.region,
    storeUser?.country,
  )

  const isCrawling = sessionStorage.getItem('crawler_isScanning') === 'true'
  const isSuperAdmin =
    authRole === 'super_admin' ||
    authRole === 'admin' ||
    isCrawling ||
    authUser?.email === 'adailtong@gmail.com'
  const isFranchisee = authRole === 'franchisee'

  const myFranchise = isFranchisee
    ? franchises.find(
        (f: any) =>
          f.ownerId === authUser?.id ||
          f.ownerId === authUser?.email ||
          f.email === authUser?.email ||
          f.contactEmail === authUser?.email,
      )
    : null
  const currentFranchiseId = isFranchisee
    ? storeUser?.franchiseId || myFranchise?.id
    : undefined

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('admin_active_tab')
    if (savedTab) return savedTab
    return isSuperAdmin ? (isCrawling ? 'crawler' : 'overview') : 'finance'
  })

  // Persist tab state to avoid reset when crawler actions trigger App.tsx re-renders
  useEffect(() => {
    if (activeTab) {
      sessionStorage.setItem('admin_active_tab', activeTab)
    }
  }, [activeTab])

  const [pendingAffiliates, setPendingAffiliates] = useState<any[]>([])
  const [pendingPromotionsCount, setPendingPromotionsCount] = useState(0)

  useEffect(() => {
    if (isSuperAdmin) {
      // Fetch initial data
      supabase
        .from('affiliate_partners')
        .select('id')
        .eq('status', 'pending')
        .then(({ data }) => {
          if (data) setPendingAffiliates(data)
        })

      const fetchPromoCount = async () => {
        const { count } = await supabase
          .from('discovered_promotions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (count !== null) setPendingPromotionsCount(count)
      }
      fetchPromoCount()

      // Realtime listeners for counters
      const channel = supabase
        .channel('admin_dashboard_counters')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'discovered_promotions' },
          () => {
            fetchPromoCount()
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'affiliate_partners',
            filter: 'status=eq.pending',
          },
          () => {
            supabase
              .from('affiliate_partners')
              .select('id')
              .eq('status', 'pending')
              .then(({ data }) => {
                if (data) setPendingAffiliates(data)
              })
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isSuperAdmin])

  const pendingMerchants = companies.filter((c) => c.status === 'pending')
  const incompleteCompanies = companies.filter(
    (c) => c.status === 'active' && (!c.taxId || !c.billingEmail),
  )

  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    new Set(['notif-1', 'notif-2', 'notif-3', 'notif-aff']),
  )

  const notifications = [
    ...(pendingMerchants.length > 0
      ? [
          {
            id: 'notif-1',
            title: t('admin.notif.pending_approvals', 'Pending Approvals'),
            desc: t(
              'admin.notif.pending_desc',
              '{count} new merchants waiting for review.',
            ).replace('{count}', pendingMerchants.length.toString()),
            tab: 'approvals',
            time: t('admin.notif.just_now', 'Just now'),
          },
        ]
      : []),
    ...(pendingAffiliates.length > 0
      ? [
          {
            id: 'notif-aff',
            title: t(
              'admin.notif.pending_affiliates',
              'New Pending Affiliates',
            ),
            desc: t(
              'admin.notif.pending_affiliates_desc',
              '{count} affiliate(s) waiting for document verification.',
            ).replace('{count}', pendingAffiliates.length.toString()),
            tab: 'approvals',
            time: t('admin.notif.just_now', 'Just now'),
          },
        ]
      : []),
    ...(incompleteCompanies.length > 0
      ? [
          {
            id: 'notif-2',
            title: t('admin.notif.incomplete_profiles', 'Incomplete Profiles'),
            desc: t(
              'admin.notif.incomplete_desc',
              '{count} companies have missing billing records.',
            ).replace('{count}', incompleteCompanies.length.toString()),
            tab: 'overview',
            time: t('admin.notif.1_hour_ago', '1 hour ago'),
          },
        ]
      : []),
    {
      id: 'notif-3',
      title: t('admin.notif.new_doc', 'New Document Uploaded'),
      desc: t(
        'admin.notif.new_doc_desc',
        'A new document was uploaded by a merchant.',
      ),
      tab: 'hierarchy',
      time: t('admin.notif.3_hours_ago', '3 hours ago'),
    },
  ]

  const currentUnreadCount = notifications.filter((n) =>
    unreadIds.has(n.id),
  ).length

  const handleNotifClick = (n: any) => {
    setActiveTab(n.tab)
    const newSet = new Set(unreadIds)
    newSet.delete(n.id)
    setUnreadIds(newSet)
  }

  const markAllRead = () => {
    setUnreadIds(new Set())
  }

  if (!isSuperAdmin && !isFranchisee) {
    return (
      <div className="container py-16 text-center text-muted-foreground animate-fade-in">
        {t(
          'admin.restricted_access',
          'Restricted access. Exclusive area for administrators and franchisees.',
        )}
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8 animate-fade-in mb-16 md:mb-0">
      {isDevelopment && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md shadow-sm flex items-start animate-fade-in-down">
          <ShieldAlert className="h-6 w-6 text-amber-500 mr-3 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-bold text-sm uppercase">
              Trava de Segurança: Ambiente de Desenvolvimento
            </h3>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              Você está acessando o sistema fora do domínio oficial de produção.
              Para proteger os dados reais (parceiros, ofertas e anúncios), as{' '}
              <strong>alterações no banco de dados estão interceptadas</strong>.
              Ações como criar ou excluir campanhas serão apenas simuladas
              localmente e <strong>não afetarão a produção</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSuperAdmin
                ? t('admin.dashboardTitle')
                : t('franchisee.dashboard', 'Regional Panel')}
            </h1>
            {isDevelopment && (
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-800 border-amber-300 mt-1"
              >
                <ShieldAlert className="w-3 h-3 mr-1" />
                DEV MODE
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {isSuperAdmin
              ? t('admin.dashboardDesc')
              : t(
                  'franchisee.settings.desc',
                  'Manage your network of merchants and local collaborators.',
                )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-10 w-10"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                {currentUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {currentUnreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 shadow-lg border-slate-200"
            >
              <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-lg">
                <span className="font-semibold text-slate-800">
                  {t('nav.notifications', 'Alerts')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-auto text-xs py-1 px-2 text-primary hover:text-primary"
                >
                  {t('admin.mark_all_read', 'Mark all read')}
                </Button>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.map((n) => {
                  const isUnread = unreadIds.has(n.id)
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={cn(
                        'p-4 border-b cursor-pointer transition-all group',
                        isUnread
                          ? 'bg-blue-50/50 hover:bg-blue-50'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p
                          className={cn(
                            'text-sm group-hover:text-primary transition-colors',
                            isUnread
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-700',
                          )}
                        >
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-sm" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.desc}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-slate-400 font-medium">
                          {n.time}
                        </p>
                        <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                          {t('common.view', 'View')}{' '}
                          <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  )
                })}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {t('common.none', 'None')}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto gap-2 p-1 justify-start">
          {isSuperAdmin && (
            <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
          )}
          <TabsTrigger value="finance">
            {t('admin.finance.dashboard_title', 'Finance')}
          </TabsTrigger>
          {isSuperAdmin && (
            <>
              <TabsTrigger
                value="approvals"
                className="gap-2 bg-amber-50 text-amber-700 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 border border-amber-200"
              >
                <ShieldCheck className="h-4 w-4" />
                {t('admin.approvalsTab', 'Approvals')}
                {pendingMerchants.length + pendingAffiliates.length > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {pendingMerchants.length + pendingAffiliates.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="monetization">
                {t('admin.monetization')}
              </TabsTrigger>
              <TabsTrigger value="policies">{t('admin.policies')}</TabsTrigger>
              <TabsTrigger value="billing">{t('admin.billing')}</TabsTrigger>
              <TabsTrigger value="seasonal">{t('admin.seasonal')}</TabsTrigger>
              <TabsTrigger value="categories">
                {t('admin.categoriesTab', 'Categories')}
              </TabsTrigger>
              <TabsTrigger value="interests">
                {t('admin.interestsTab', 'Interests')}
              </TabsTrigger>
              <TabsTrigger
                value="offers"
                className="gap-2 bg-primary/5 data-[state=active]:bg-primary/20 text-primary font-semibold border border-primary/20 rounded-md"
              >
                <Tags className="h-4 w-4" />
                {t('admin.offersTab', 'Offers Management')}
              </TabsTrigger>
              <TabsTrigger value="crm">
                {t('admin.crm_campaigns', 'CRM & Campaigns')}
              </TabsTrigger>
              <TabsTrigger value="crawler" className="gap-2">
                {t('admin.crawler.title', 'Offers Crawler')}
                {pendingPromotionsCount > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    {pendingPromotionsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ads">
                {t('admin.ads', 'Publicidade & Anúncios')}
              </TabsTrigger>
              <TabsTrigger value="network-ads" className="gap-2">
                <Megaphone className="h-4 w-4" />
                {t('admin.network_ads', 'Network Advertising')}
              </TabsTrigger>
              <TabsTrigger value="affiliates" className="gap-2">
                <Users className="h-4 w-4" />
                {t('admin.affiliates_tab', 'Affiliate Network')}
              </TabsTrigger>
              <TabsTrigger value="translations">
                {t('admin.translations.title', 'Translations')}
              </TabsTrigger>
              <TabsTrigger value="insights">
                {t('admin.insights', 'Data Insights')}
              </TabsTrigger>
              <TabsTrigger value="performance">
                {t('admin.performance.title', 'Performance')}
              </TabsTrigger>
              <TabsTrigger value="notifications">
                {t('admin.push_notifications', 'Push Notifications')}
              </TabsTrigger>
              <TabsTrigger value="settings">
                {t('admin.settings', 'Settings')}
              </TabsTrigger>
              <TabsTrigger value="content">
                {t('admin.content', 'Footer & Content')}
              </TabsTrigger>
              <TabsTrigger value="emails">
                {t('admin.emails', 'Email Reports')}
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="hierarchy">
            {t('admin.hierarchy.title', 'Hierarchy & Team')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finance">
          <FinanceDashboardTab franchiseId={currentFranchiseId} />
        </TabsContent>

        {isSuperAdmin && (
          <>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.activeUsers')}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(45231)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.metrics.users_increase', '+20.1% este mês')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.partnerStores')}
                    </CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(1234)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'admin.metrics.stores_increase',
                        '+15 novas esta semana',
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.estRevenue')}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(84320)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.metrics.revenue_increase', '+12% este mês')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.engagement')}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(12543)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'admin.metrics.engagement_increase',
                        '+5% esta semana',
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="monetization">
              <AdminMonetizationTab />
            </TabsContent>
            <TabsContent value="policies">
              <PartnerPoliciesTab />
            </TabsContent>
            <TabsContent value="billing">
              <PartnerBillingTab />
            </TabsContent>
            <TabsContent value="seasonal">
              <AdminSeasonalTab />
            </TabsContent>
            <TabsContent value="categories">
              <AdminCategoriesTab />
            </TabsContent>
            <TabsContent value="interests">
              <AdminInterestsTab />
            </TabsContent>
            <TabsContent value="offers">
              <AdminOffersTab />
            </TabsContent>
            <TabsContent value="crm">
              <AdminCRM />
            </TabsContent>
            <TabsContent value="crawler">
              <PromotionCrawler />
            </TabsContent>
            <TabsContent value="ads">
              <AdminAdsManager />
            </TabsContent>
            <TabsContent value="network-ads">
              <AdminNetworkAdsTab />
            </TabsContent>
            <TabsContent value="affiliates">
              <AdminAffiliatesTab />
            </TabsContent>
            <TabsContent value="translations">
              <AdminTranslationsTab />
            </TabsContent>
            <TabsContent value="insights">
              <DataInsightsTab />
            </TabsContent>
            <TabsContent value="performance">
              <AdminPerformanceTab />
            </TabsContent>
            <TabsContent value="notifications">
              <AdminNotificationsTab />
            </TabsContent>
            <TabsContent value="settings">
              <AdminSettingsTab />
            </TabsContent>
            <TabsContent value="content">
              <AdminContentTab />
            </TabsContent>
            <TabsContent value="emails">
              <AdminEmailLogsTab />
            </TabsContent>
            <TabsContent value="approvals">
              <AdminApprovalsTab />
            </TabsContent>
          </>
        )}

        <TabsContent value="hierarchy">
          <AdminHierarchyTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
