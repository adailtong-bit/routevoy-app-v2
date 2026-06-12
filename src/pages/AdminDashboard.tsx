import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
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

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-8 flex items-center justify-center h-full text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p>This module is currently under construction or integration.</p>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  {
    id: 'franchises',
    label: 'Franchises',
    icon: Building,
    path: '/admin/franchises',
  },
  {
    id: 'merchants',
    label: 'Merchants',
    icon: Store,
    path: '/admin/merchants',
  },
  {
    id: 'affiliates',
    label: 'Affiliates',
    icon: Users,
    path: '/admin/affiliates',
  },
  {
    id: 'platforms',
    label: 'Affiliate Platforms',
    icon: LinkIcon,
    path: '/admin/platforms',
  },
  { id: 'ads', label: 'Ad Campaigns', icon: Megaphone, path: '/admin/ads' },
  {
    id: 'coupons',
    label: 'Coupons & Vouchers',
    icon: Tag,
    path: '/admin/coupons',
  },
  {
    id: 'crawled',
    label: 'Discovered Promotions',
    icon: Search,
    path: '/admin/crawled',
  },
  {
    id: 'billing',
    label: 'Invoices & Billing',
    icon: FileText,
    path: '/admin/billing',
  },
  {
    id: 'pricing',
    label: 'Ad Pricing Plans',
    icon: DollarSign,
    path: '/admin/pricing',
  },
  {
    id: 'ledger',
    label: 'Financial Ledger',
    icon: CreditCard,
    path: '/admin/ledger',
  },
  {
    id: 'crm',
    label: 'CRM Campaigns',
    icon: MessageSquare,
    path: '/admin/crm',
  },
  {
    id: 'targets',
    label: 'CRM Target Groups',
    icon: Target,
    path: '/admin/targets',
  },
  {
    id: 'sources',
    label: 'Crawler Sources',
    icon: Globe,
    path: '/admin/sources',
  },
  { id: 'logs', label: 'Crawler Logs', icon: Database, path: '/admin/logs' },
  { id: 'audit', label: 'Audit Logs', icon: Shield, path: '/admin/audit' },
  {
    id: 'categories',
    label: 'Categories',
    icon: FolderTree,
    path: '/admin/categories',
  },
  {
    id: 'commission',
    label: 'Commission Rules',
    icon: Percent,
    path: '/admin/commission',
  },
  {
    id: 'settings',
    label: 'Site Settings',
    icon: Settings,
    path: '/admin/settings',
  },
  {
    id: 'mappings',
    label: 'Site Mappings',
    icon: Map,
    path: '/admin/mappings',
  },
  { id: 'emails', label: 'Email Logs', icon: Mail, path: '/admin/emails' },
  {
    id: 'engagements',
    label: 'User Engagements',
    icon: Activity,
    path: '/admin/engagements',
  },
  {
    id: 'profiles',
    label: 'User Profiles',
    icon: UserCircle,
    path: '/admin/profiles',
  },
]

export default function AdminDashboard() {
  const location = useLocation()

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
                Management Modules
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
                  'Dashboard'}
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
                <Route
                  path="platforms"
                  element={<Placeholder title="Affiliate Platforms" />}
                />
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
                  element={<Placeholder title="User Engagements" />}
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
