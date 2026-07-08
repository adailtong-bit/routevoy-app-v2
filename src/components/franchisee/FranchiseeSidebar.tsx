import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  Users,
  Megaphone,
  Wallet,
  Settings,
  CalendarDays,
  BarChart3,
  Bot,
  Tag,
  ShieldCheck,
  UserCheck,
  Building2,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function FranchiseeSidebar({
  activeTab,
  franchise,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: any) {
  const { t } = useLanguage()

  const updateTab = (tab: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url)
    window.dispatchEvent(new PopStateEvent('popstate'))
    if (typeof setIsMobileMenuOpen === 'function') {
      setIsMobileMenuOpen(false)
    }
  }

  const menuGroups = [
    {
      label: t('franchisee.menu.main', 'Main'),
      items: [
        {
          id: 'overview',
          label: t('franchisee.menu.overview', 'Overview'),
          icon: LayoutDashboard,
        },
        {
          id: 'merchants',
          label: t('franchisee.menu.merchants', 'Merchants'),
          icon: Store,
        },
        {
          id: 'approvals',
          label: t('franchisee.nav.approvals', 'Approvals'),
          icon: ShieldCheck,
        },
      ],
    },
    {
      label: t('franchisee.menu.management', 'Management'),
      items: [
        {
          id: 'crm-campaigns',
          label: t('franchisee.nav.crm', 'CRM & Leads'),
          icon: Users,
        },
        {
          id: 'offers-crawler',
          label: t('franchisee.nav.crawler', 'Auto Crawler'),
          icon: Bot,
        },
        {
          id: 'campaigns',
          label: t('franchisee.nav.campaigns', 'Campaigns'),
          icon: Megaphone,
        },
        {
          id: 'offers-management',
          label: t('franchisee.nav.offers', 'Offers Management'),
          icon: Tag,
        },
        {
          id: 'advertisers',
          label: 'Cadastro de Anunciantes',
          icon: Building2,
        },
        {
          id: 'advertiser-campaigns',
          label: 'Marketing Campaigns',
          icon: Megaphone,
        },
        {
          id: 'seasonal-offers',
          label: t('franchisee.nav.seasonal', 'Seasonal Calendar'),
          icon: CalendarDays,
        },
      ],
    },
    {
      label: t('franchisee.menu.financial', 'Financial & Network'),
      items: [
        {
          id: 'finance',
          label: t('franchisee.nav.finance', 'Financial Panel'),
          icon: Wallet,
        },
        {
          id: 'affiliate-network',
          label: t('franchisee.nav.affiliates', 'Affiliate Network'),
          icon: UserCheck,
        },
        {
          id: 'hierarchy-team',
          label: t('franchisee.nav.team', 'Franchise Team'),
          icon: Users,
        },
        {
          id: 'data-insights',
          label: t('franchisee.nav.reports', 'Reports & Insights'),
          icon: BarChart3,
        },
      ],
    },
  ]

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:block h-screen flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b shrink-0">
          <h2
            className="text-lg font-bold text-slate-800 flex items-center gap-2 truncate"
            title={franchise?.name}
          >
            <Store className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">{franchise?.name || 'Franchise'}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-3">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => updateTab(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-4 h-4 shrink-0',
                          isActive ? 'text-primary' : 'text-slate-400',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t shrink-0">
          <button
            onClick={() => updateTab('profile')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
              activeTab === 'profile'
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <Settings
              className={cn(
                'w-4 h-4 shrink-0',
                activeTab === 'profile' ? 'text-primary' : 'text-slate-400',
              )}
            />
            {t('common.settings', 'Settings')}
          </button>
        </div>
      </aside>
    </>
  )
}
