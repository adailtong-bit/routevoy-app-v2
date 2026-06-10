import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  ScanLine,
  Store,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'

export default function MerchantLayout() {
  const { t } = useLanguage()
  const location = useLocation()
  const currentPath = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    {
      name: t('merchant.nav.dashboard', 'Dashboard'),
      path: '/merchant',
      icon: LayoutDashboard,
    },
    {
      name: t('merchant.nav.campaigns', 'Campaigns'),
      path: '/merchant/campaigns',
      icon: Megaphone,
    },
    {
      name: t('merchant.nav.pre_launch', 'Pre-launch Campaigns'),
      path: '/merchant/pre-launch',
      icon: Megaphone,
    },
    {
      name: t('merchant.nav.ads', 'Ads Management'),
      path: '/merchant/ads',
      icon: Megaphone,
    },
    {
      name: t('merchant.nav.leads', 'Leads'),
      path: '/merchant/leads',
      icon: Users,
    },
    {
      name: t('merchant.nav.scanner', 'Scanner'),
      path: '/merchant/scanner',
      icon: ScanLine,
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row bg-slate-50 relative w-full">
      {/* Botão Mobile */}
      <button
        className="md:hidden flex items-center justify-center gap-2 p-4 bg-white border-b border-slate-200 text-slate-700 font-medium w-full"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span>
          {mobileOpen
            ? t('common.close_menu', 'Close Menu')
            : t('common.open_menu', 'Open Menu')}
        </span>
      </button>

      {/* Sidebar Lojista */}
      <aside
        className={cn(
          'w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:block transition-all flex flex-col overflow-hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <div className="p-6 border-b border-slate-200 hidden md:flex items-center gap-2">
          <Store className="h-6 w-6 text-primary shrink-0" />
          <span className="font-bold text-lg text-primary whitespace-nowrap truncate">
            {t('merchant.dashboard.title', 'Merchant Dashboard')}
          </span>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== '/merchant' && currentPath.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Conteúdo Lojista */}
      <main className="flex-1 p-4 md:p-8 min-w-0 overflow-x-hidden relative bg-slate-50/50">
        <Outlet />
      </main>
    </div>
  )
}
