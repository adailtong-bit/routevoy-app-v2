import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Store,
  BarChart,
  Megaphone,
  Settings,
  LogOut,
  Users,
  FileText,
  Search,
  Globe,
  Loader2,
  Rocket,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MerchantLayout() {
  const { signOut, profile, user } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  // Gracefully handle missing profile during validation phase
  const userRole = profile?.role || 'merchant'

  const isFranchisee = userRole === 'franchisee'
  const isAffiliate = userRole === 'affiliate'
  const isMerchant = userRole === 'merchant' || userRole === 'shopkeeper'

  const navItems = [
    {
      title: t('merchant.nav.dashboard', 'Dashboard'),
      href: '/merchant',
      icon: <BarChart className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.scanner', 'Scanner'),
      href: '/merchant/scanner',
      icon: <Search className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.campaigns', 'Campaigns'),
      href: '/merchant/campaigns',
      icon: <Megaphone className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.pre_launch', 'Releases'),
      href: '/merchant/pre-launch',
      icon: <Rocket className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.leads', 'Leads'),
      href: '/merchant/crm',
      icon: <Users className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.ads', 'Boosting'),
      href: '/merchant/ads',
      icon: <TrendingUp className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.finance', 'Financial'),
      href: '/merchant/finance',
      icon: <FileText className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.staff', 'Team'),
      href: '/merchant/people',
      icon: <UsersRound className="w-5 h-5" />,
      show: true,
    },
    {
      title: t('merchant.nav.settings', 'Settings'),
      href: '/merchant/settings',
      icon: <Settings className="w-5 h-5" />,
      show: true,
    },
  ]

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              RouteVoy
            </span>
          </Link>
          <div className="mt-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md inline-block">
            {!profile ? (
              <Loader2 className="w-3 h-3 animate-spin inline-block" />
            ) : isFranchisee ? (
              'Franqueado'
            ) : isAffiliate ? (
              'Afiliado'
            ) : (
              'Lojista'
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-4">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/merchant' &&
                    location.pathname.startsWith(item.href + '/'))
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                )
              })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200">
          <div className="px-3 pb-3 mb-3 border-b border-slate-100">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-destructive hover:bg-destructive/10"
            onClick={() => signOut()}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('auth.logout', 'Sair')}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-10">
          <Link to="/" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-slate-800">RouteVoy</span>
          </Link>
        </header>

        <ScrollArea className="flex-1 w-full bg-slate-50/50 relative">
          <div className="p-0 md:p-4 h-full">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
