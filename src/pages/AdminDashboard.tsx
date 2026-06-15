import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Building,
  Store,
  Users,
  Link as LinkIcon,
  Megaphone,
  Tag,
  Search,
  FileText,
  DollarSign,
  CreditCard,
  MessageSquare,
  Target,
  Globe,
  Database,
  Shield,
  FolderTree,
  Percent,
  Settings,
  Map,
  Mail,
  Activity,
  UserCircle,
} from 'lucide-react'

import { AdminPerformanceTab } from '@/components/admin/AdminPerformanceTab'
import { FranchisesTab } from '@/components/admin/hierarchy/FranchisesTab'
import { MerchantsTab } from '@/components/admin/hierarchy/MerchantsTab'
import { AdminAffiliatesTab } from '@/components/admin/AdminAffiliatesTab'
import { AdminAdsManager } from '@/components/admin/AdminAdsManager'
import { AdminOffersTab } from '@/components/admin/AdminOffersTab'
import { PromotionCrawler } from '@/components/admin/PromotionCrawler'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'
import { AdPricingManager } from '@/components/admin/AdPricingManager'
import { AdminCurrentAccountTab } from '@/components/admin/AdminCurrentAccountTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { CrawlerSourcesTab } from '@/components/admin/CrawlerSourcesTab'
import { CrawlerHistoryTab } from '@/components/admin/CrawlerHistoryTab'
import { AuditLogsTab } from '@/components/admin/hierarchy/AuditLogsTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { CommissionRulesManager } from '@/components/admin/CommissionRulesManager'
import { AdminSettingsTab } from '@/components/admin/AdminSettingsTab'
import { CrawlerMappingsTab } from '@/components/admin/CrawlerMappingsTab'
import { AdminEmailLogsTab } from '@/components/admin/AdminEmailLogsTab'
import { StaffTab } from '@/components/admin/hierarchy/StaffTab'
import { AffiliatePlatformsTab } from '@/components/admin/AffiliatePlatformsTab'

function Placeholder({ title, desc }: { title: string; desc?: string }) {
  const { t } = useLanguage()
  return (
    <div className="p-8 flex items-center justify-center h-full text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p>
          {desc ||
            t(
              'admin.placeholder.desc',
              'Este módulo está atualmente em construção ou integração.',
            )}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const location = useLocation()
  const { t } = useLanguage()

  const NAV_ITEMS = [
    {
      id: 'overview',
      label: t('admin.nav.dashboard', 'Painel de Controle'),
      icon: LayoutDashboard,
      path: '/admin',
    },
    {
      id: 'franchises',
      label: t('admin.nav.franchises', 'Franquias'),
      icon: Building,
      path: '/admin/franchises',
    },
    {
      id: 'merchants',
      label: t('admin.nav.merchants', 'Lojistas'),
      icon: Store,
      path: '/admin/merchants',
    },
    {
      id: 'affiliates',
      label: t('admin.nav.affiliates', 'Afiliados'),
      icon: Users,
      path: '/admin/affiliates',
    },
    {
      id: 'platforms',
      label: t('admin.nav.platforms', 'Plataformas de Afiliados'),
      icon: LinkIcon,
      path: '/admin/platforms',
    },
    {
      id: 'ads',
      label: t('admin.nav.ads', 'Campanhas de Anúncios'),
      icon: Megaphone,
      path: '/admin/ads',
    },
    {
      id: 'coupons',
      label: t('admin.nav.coupons', 'Cupons e Vouchers'),
      icon: Tag,
      path: '/admin/coupons',
    },
    {
      id: 'crawled',
      label: t('admin.nav.crawled', 'Promoções Descobertas'),
      icon: Search,
      path: '/admin/crawled',
    },
    {
      id: 'billing',
      label: t('admin.nav.billing', 'Faturas e Cobranças'),
      icon: FileText,
      path: '/admin/billing',
    },
    {
      id: 'pricing',
      label: t('admin.nav.pricing', 'Planos de Preços'),
      icon: DollarSign,
      path: '/admin/pricing',
    },
    {
      id: 'ledger',
      label: t('admin.nav.ledger', 'Livro Caixa'),
      icon: CreditCard,
      path: '/admin/ledger',
    },
    {
      id: 'crm',
      label: t('admin.nav.crm', 'Campanhas de CRM'),
      icon: MessageSquare,
      path: '/admin/crm',
    },
    {
      id: 'targets',
      label: t('admin.nav.targets', 'Grupos de Destino CRM'),
      icon: Target,
      path: '/admin/targets',
    },
    {
      id: 'sources',
      label: t('admin.nav.sources', 'Fontes do Crawler'),
      icon: Globe,
      path: '/admin/sources',
    },
    {
      id: 'logs',
      label: t('admin.nav.logs', 'Logs do Crawler'),
      icon: Database,
      path: '/admin/logs',
    },
    {
      id: 'audit',
      label: t('admin.nav.audit', 'Logs de Auditoria'),
      icon: Shield,
      path: '/admin/audit',
    },
    {
      id: 'categories',
      label: t('admin.nav.categories', 'Categorias'),
      icon: FolderTree,
      path: '/admin/categories',
    },
    {
      id: 'commission',
      label: t('admin.nav.commission', 'Regras de Comissão'),
      icon: Percent,
      path: '/admin/commission',
    },
    {
      id: 'settings',
      label: t('admin.nav.settings', 'Configurações do Site'),
      icon: Settings,
      path: '/admin/settings',
    },
    {
      id: 'mappings',
      label: t('admin.nav.mappings', 'Mapeamentos do Site'),
      icon: Map,
      path: '/admin/mappings',
    },
    {
      id: 'emails',
      label: t('admin.nav.emails', 'Logs de E-mail'),
      icon: Mail,
      path: '/admin/emails',
    },
    {
      id: 'engagements',
      label: t('admin.nav.engagements', 'Engajamento de Usuários'),
      icon: Activity,
      path: '/admin/engagements',
    },
    {
      id: 'profiles',
      label: t('admin.nav.profiles', 'Perfis de Usuários'),
      icon: UserCircle,
      path: '/admin/profiles',
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 w-full overflow-hidden">
        <Sidebar className="border-r border-slate-200">
          <SidebarHeader className="p-4 border-b bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <Shield className="w-6 h-6" />
              <span>RouteVoy Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-slate-50">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t('admin.nav.modules', 'Módulos de Gestão')}
              </SidebarGroupLabel>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/admin' &&
                      location.pathname.startsWith(item.path))
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link
                          to={item.path}
                          className="flex items-center gap-3 transition-colors hover:text-primary"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:text-primary transition-colors" />
              <div className="font-semibold text-slate-800 text-lg">
                {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ||
                  t('admin.nav.dashboard', 'Painel de Controle')}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto h-full">
              <Routes>
                <Route path="/" element={<AdminPerformanceTab />} />
                <Route path="franchises" element={<FranchisesTab />} />
                <Route path="merchants" element={<MerchantsTab />} />
                <Route path="affiliates" element={<AdminAffiliatesTab />} />
                <Route path="platforms" element={<AffiliatePlatformsTab />} />
                <Route path="ads" element={<AdminAdsManager />} />
                <Route path="coupons" element={<AdminOffersTab />} />
                <Route path="crawled" element={<PromotionCrawler />} />
                <Route path="billing" element={<PartnerBillingTab />} />
                <Route path="pricing" element={<AdPricingManager />} />
                <Route path="ledger" element={<AdminCurrentAccountTab />} />
                <Route path="crm" element={<AdminCRM />} />
                <Route path="targets" element={<TargetGroupsTab />} />
                <Route path="sources" element={<CrawlerSourcesTab />} />
                <Route path="logs" element={<CrawlerHistoryTab />} />
                <Route path="audit" element={<AuditLogsTab />} />
                <Route path="categories" element={<AdminCategoriesTab />} />
                <Route path="commission" element={<CommissionRulesManager />} />
                <Route path="settings" element={<AdminSettingsTab />} />
                <Route path="mappings" element={<CrawlerMappingsTab />} />
                <Route path="emails" element={<AdminEmailLogsTab />} />
                <Route
                  path="engagements"
                  element={
                    <Placeholder
                      title={t(
                        'admin.nav.engagements',
                        'Engajamento de Usuários',
                      )}
                    />
                  }
                />
                <Route
                  path="profiles"
                  element={<StaffTab parentType="global" />}
                />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
