import { Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  Wallet,
  FileText,
  DollarSign,
  Megaphone,
  CalendarDays,
  LayoutGrid,
  Tag,
  Shield,
  Target,
  Users,
  Globe,
  BarChart3,
  Box,
  UsersRound,
  Settings,
} from 'lucide-react'

export function FranchiseeSidebar({
  myFranchise,
  activeTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  myFranchise: { name: string }
  activeTab: string
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (v: boolean) => void
}) {
  const { t } = useLanguage()

  const menuGroups = [
    {
      title: t('franchisee.menu.main', 'Main'),
      items: [
        {
          id: 'overview',
          label: t('franchisee.menu.overview', 'Overview'),
          icon: LayoutDashboard,
        },
        {
          id: 'merchants',
          label: t('franchisee.menu.merchants', 'Affiliated Merchants'),
          icon: Store,
        },
        {
          id: 'affiliates',
          label: t('franchisee.menu.affiliates', 'Affiliates'),
          icon: Users,
        },
        {
          id: 'users',
          label: t('franchisee.menu.users', 'Users & Customers'),
          icon: UsersRound,
        },
        {
          id: 'campaigns',
          label: t('franchisee.menu.coupons', 'Coupons & Promos'),
          icon: Tag,
        },
      ],
    },
    {
      title: t('franchisee.menu.financial', 'Financial'),
      items: [
        {
          id: 'finance',
          label: t('franchisee.menu.finance', 'Finance'),
          icon: Wallet,
        },
        {
          id: 'billing',
          label: t('franchisee.menu.billing', 'Billing'),
          icon: FileText,
        },
        {
          id: 'monetization',
          label: t('franchisee.menu.monetization', 'Monetization'),
          icon: DollarSign,
        },
        {
          id: 'ads-royalties',
          label: t('franchisee.menu.ads_royalties', 'Ads & Royalties'),
          icon: Megaphone,
        },
      ],
    },
    {
      title: t('franchisee.menu.operational', 'Operational'),
      items: [
        {
          id: 'seasonal',
          label: t('franchisee.menu.seasonal', 'Seasonal Offers'),
          icon: CalendarDays,
        },
        {
          id: 'categories',
          label: t('franchisee.menu.categories', 'Categories'),
          icon: LayoutGrid,
        },
        {
          id: 'interests',
          label: t('franchisee.menu.interests', 'Interests'),
          icon: Tag,
        },
        {
          id: 'policies',
          label: t('franchisee.menu.policies', 'Partner Policies'),
          icon: Shield,
        },
      ],
    },
    {
      title: t('franchisee.menu.intelligence', 'Intelligence'),
      items: [
        { id: 'crm', label: t('franchisee.menu.crm', 'CRM'), icon: Target },
        {
          id: 'leads',
          label: t('franchisee.menu.leads', 'Captured Leads'),
          icon: Users,
        },
        {
          id: 'crawler',
          label: t('franchisee.menu.crawler', 'Offers Crawler'),
          icon: Globe,
        },
        {
          id: 'insights',
          label: t('franchisee.menu.insights', 'Data Insights'),
          icon: BarChart3,
        },
      ],
    },
    {
      title: t('franchisee.menu.support', 'Support & Settings'),
      items: [
        {
          id: 'sandbox',
          label: t('franchisee.menu.sandbox', 'Testing Sandbox'),
          icon: Box,
        },
        {
          id: 'team',
          label: t('franchisee.menu.team', 'Local Team'),
          icon: UsersRound,
        },
        {
          id: 'settings',
          label: t('franchisee.menu.settings', 'Settings'),
          icon: Settings,
        },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full shrink-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="p-6 border-b flex-shrink-0 min-w-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight truncate">
          {t('franchisee.dashboard', 'Regional Panel')}
        </h2>
        <p className="text-sm font-medium text-primary mt-1 truncate">
          {myFranchise.name}
        </p>
      </div>

      <ScrollArea className="flex-1 w-full min-w-0">
        <div className="p-4 space-y-6 overflow-x-hidden">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 truncate">
                {group.title}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/franchisee?tab=${item.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left',
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        activeTab === item.id
                          ? 'text-primary'
                          : 'text-slate-400',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
