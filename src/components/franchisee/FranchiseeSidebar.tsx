import { Link } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  Wallet,
  DollarSign,
  Megaphone,
  Globe,
  Users,
  UsersRound,
  Tag,
  Target,
  ListFilter,
  Settings,
} from 'lucide-react'

export function FranchiseeSidebar({
  franchise,
  activeTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  franchise: { name: string }
  activeTab: string
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (v: boolean) => void
}) {
  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        {
          id: 'merchant-management',
          label: 'Merchant Management',
          icon: Store,
        },
        { id: 'affiliate-partners', label: 'Affiliate Partners', icon: Users },
        { id: 'customers-leads', label: 'Customers & Leads', icon: UsersRound },
      ],
    },
    {
      title: 'CONTENT & OFFERS',
      items: [
        { id: 'coupons-promos', label: 'Coupons & Promos', icon: Tag },
        {
          id: 'marketing-campaigns',
          label: 'Marketing Campaigns',
          icon: Target,
        },
        { id: 'ad-campaigns', label: 'Ad Campaigns', icon: Megaphone },
      ],
    },
    {
      title: 'TECHNICAL',
      items: [
        { id: 'crawler-sources', label: 'Crawler Sources', icon: Globe },
        { id: 'crawler-logs', label: 'Crawler Logs', icon: ListFilter },
      ],
    },
    {
      title: 'FINANCIAL',
      items: [
        { id: 'revenue-share', label: 'Revenue Share', icon: DollarSign },
        { id: 'invoices-billing', label: 'Invoices & Billing', icon: Wallet },
      ],
    },
    {
      title: 'SYSTEM',
      items: [{ id: 'settings', label: 'Settings', icon: Settings }],
    },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full shrink-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="p-6 border-b border-slate-800 flex-shrink-0 min-w-0 bg-slate-950">
        <h2 className="text-xl font-black text-white tracking-tight truncate">
          Regional Panel
        </h2>
        <p className="text-sm font-medium text-slate-400 mt-1 truncate">
          {franchise.name}
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
