import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Users,
  ScanLine,
  Target,
  Settings,
  Rocket,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MerchantLayout() {
  const { role } = useAuth()
  const location = useLocation()

  const isMerchant = role === 'merchant' || role === 'shopkeeper'

  const links = [
    { name: 'Dashboard', path: '/merchant', icon: LayoutDashboard },
    { name: 'Scanner', path: '/merchant/scanner', icon: ScanLine },
    { name: 'Campanhas', path: '/merchant/campaigns', icon: Megaphone },
    { name: 'Lançamentos', path: '/merchant/pre-launch', icon: Rocket },
    { name: 'CRM & Leads', path: '/merchant/leads', icon: Users },
    { name: 'Impulsionamento', path: '/merchant/ads', icon: Target },
    { name: 'Financeiro', path: '/merchant/finance', icon: Wallet },
    { name: 'Equipe', path: '/merchant/people', icon: UserCircle },
    { name: 'Configurações', path: '/merchant/settings', icon: Settings },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] w-full bg-slate-50 border-t">
      <aside className="w-full md:w-64 border-r bg-white flex flex-col md:sticky md:top-[64px] md:h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6 border-b hidden md:block">
          <h2 className="text-xl font-bold text-slate-800">
            Painel do Lojista
          </h2>
        </div>
        <nav className="flex md:flex-col gap-2 p-4 md:py-6 overflow-x-auto md:overflow-x-visible">
          {links.map((link) => {
            const isActive =
              location.pathname === link.path ||
              location.pathname.startsWith(link.path + '/')
            const isExact = location.pathname === link.path
            // exact match required for the root dashboard to not stay active on all child routes
            const active = link.path === '/merchant' ? isExact : isActive

            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 w-full min-w-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
