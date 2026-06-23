import { Link } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import {
  LayoutDashboard,
  LineChart,
  CheckSquare,
  Coins,
  Receipt,
  CalendarDays,
  Tag,
  UsersRound,
  Bot,
  Megaphone,
  Network,
  BarChart3,
  Activity,
  BellRing,
  Mail,
  Building2,
  Share2,
  Settings,
  Store,
  ShieldCheck,
  FileText,
  Database,
  Globe,
} from 'lucide-react'

export function FranchiseeSidebar({
  franchise,
  activeTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  franchise?: { name: string }
  activeTab: string
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (v: boolean) => void
}) {
  const { role, user } = useAuth()
  const { t } = useLanguage()

  const isMaster =
    role === 'admin' ||
    role === 'super_admin' ||
    user?.email?.toLowerCase() === 'adailtong@gmail.com'
  const hasManagementAccess = isMaster || role === 'franchisee'

  const franchiseName =
    franchise?.name || (isMaster ? 'Painel Master' : 'Regional')

  type MenuItem = {
    id: string
    label: string
    icon: any
    masterOnly?: boolean
  }

  type MenuGroup = {
    title: string
    items: MenuItem[]
  }

  const allGroups: MenuGroup[] = [
    {
      title: t('franchisee.menu.general', 'GERAL'),
      items: [
        {
          id: 'overview',
          label: t('franchisee.menu.overview', 'Visão Geral'),
          icon: LayoutDashboard,
        },
        {
          id: 'finance',
          label: t('franchisee.menu.financial', 'Financeiro'),
          icon: LineChart,
        },
        {
          id: 'merchants',
          label: t('admin.merchants_tab', 'Lojistas'),
          icon: Store,
        },
        {
          id: 'advertisers',
          label: t('admin.advertisers_tab', 'Anunciantes'),
          icon: Megaphone,
        },
        {
          id: 'approvals',
          label: t('admin.approvalsTab', 'Aprovações'),
          icon: CheckSquare,
        },
        {
          id: 'monetization',
          label: t('franchisee.menu.monetization', 'Monetização'),
          icon: Coins,
        },
        {
          id: 'billing',
          label: t('franchisee.menu.billing', 'Faturamento'),
          icon: Receipt,
        },
        {
          id: 'seasonal-offers',
          label: t('franchisee.menu.seasonal', 'Ofertas Sazonais'),
          icon: CalendarDays,
        },
      ],
    },
    {
      title: t('franchisee.menu.engagement', 'ENGAJAMENTO'),
      items: [
        {
          id: 'offers-management',
          label: t('admin.offersTab', 'Gestão de Ofertas'),
          icon: Tag,
        },
        {
          id: 'crm-campaigns',
          label: t('franchisee.menu.crm', 'CRM & Campanhas'),
          icon: UsersRound,
        },
        {
          id: 'offers-crawler',
          label: t('franchisee.menu.crawler', 'Captura de Ofertas'),
          icon: Bot,
        },
      ],
    },
    {
      title: t('franchisee.menu.marketing', 'MARKETING & ANALYTICS'),
      items: [
        {
          id: 'advertising-ads',
          label: t('franchisee.menu.ads_royalties', 'Publicidade e Anúncios'),
          icon: Megaphone,
        },
        {
          id: 'network-advertising',
          label: t('admin.network_ads', 'Publicidade de Rede'),
          icon: Network,
        },
        {
          id: 'data-insights',
          label: t('franchisee.menu.insights', 'Análise de Dados'),
          icon: BarChart3,
        },
      ],
    },
    {
      title: t('franchisee.menu.management', 'GESTÃO'),
      items: [
        {
          id: 'hierarchy-team',
          label: t('admin.hierarchy.team', 'Hierarquia & Equipe'),
          icon: Building2,
        },
        {
          id: 'affiliate-network',
          label: t('admin.affiliates_tab', 'Rede de Afiliados'),
          icon: Share2,
        },
        {
          id: 'partner-policies',
          label: t('franchisee.menu.policies', 'Políticas de Parceiros'),
          icon: FileText,
          masterOnly: true,
        },
      ],
    },
    {
      title: t('franchisee.menu.system_security', 'SISTEMA & SEGURANÇA'),
      items: [
        {
          id: 'system-performance',
          label: t('admin.performance.title', 'Desempenho do Sistema'),
          icon: Activity,
        },
        {
          id: 'push-notifications',
          label: t('admin.push_notifications', 'Notificações Push'),
          icon: BellRing,
        },
        {
          id: 'email-reports',
          label: t('admin.emails', 'Relatórios por Email'),
          icon: Mail,
        },
        {
          id: 'audit-logs',
          label: t('admin.hierarchy.audit', 'Logs de Auditoria'),
          icon: ShieldCheck,
          masterOnly: true,
        },
        {
          id: 'global-settings',
          label: t('franchisee.menu.settings', 'Configurações Globais'),
          icon: Settings,
          masterOnly: true,
        },
        {
          id: 'apify-integrations',
          label: t('admin.nav.integrations', 'Integrações'),
          icon: Database,
          masterOnly: true,
        },
        {
          id: 'crawler-mappings',
          label: t('admin.nav.mappings', 'Mapeamentos de Crawler'),
          icon: Globe,
          masterOnly: true,
        },
        {
          id: 'profile',
          label: t('nav.profile', 'Meu Perfil'),
          icon: UsersRound,
        },
      ],
    },
  ]

  const menuGroups = (allGroups || [])
    .map((group) => ({
      ...group,
      items: (group.items || []).filter((item) => {
        if (item.masterOnly && !isMaster) return false
        if (
          !hasManagementAccess &&
          ['hierarchy-team', 'affiliate-network'].includes(item.id)
        )
          return false
        return true
      }),
    }))
    .filter((group) => group.items && group.items.length > 0)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full shrink-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="p-6 border-b border-slate-800 flex-shrink-0 min-w-0 bg-slate-950">
        <h2 className="text-xl font-black text-white tracking-tight truncate">
          {isMaster
            ? t('admin.master_panel', 'Painel Master')
            : t('franchisee.regional_panel', 'Painel Regional')}
        </h2>
        <p className="text-sm font-medium text-slate-400 mt-1 truncate">
          {franchiseName}
        </p>
      </div>

      <ScrollArea className="flex-1 w-full min-w-0">
        <div className="p-4 space-y-8 overflow-x-hidden pb-20">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider px-3 truncate">
                {group.title}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id
                  return (
                    <Link
                      key={item.id}
                      to={`/franchisee?tab=${item.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left group',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-primary-foreground'
                            : 'text-slate-500 group-hover:text-slate-300',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
