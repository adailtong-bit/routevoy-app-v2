import { Link } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
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
      title: 'GENERAL',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'finance', label: 'Finance', icon: LineChart },
        { id: 'approvals', label: 'Approvals', icon: CheckSquare },
        { id: 'monetization', label: 'Monetization', icon: Coins },
        { id: 'billing', label: 'Billing', icon: Receipt },
        { id: 'seasonal-offers', label: 'Seasonal Offers', icon: CalendarDays },
      ],
    },
    {
      title: 'ENGAGEMENT',
      items: [
        { id: 'offers-management', label: 'Offers Management', icon: Tag },
        { id: 'crm-campaigns', label: 'CRM & Campaigns', icon: UsersRound },
        { id: 'offers-crawler', label: 'Offers Crawler', icon: Bot },
      ],
    },
    {
      title: 'MARKETING & ANALYTICS',
      items: [
        { id: 'advertising-ads', label: 'Advertising & Ads', icon: Megaphone },
        {
          id: 'network-advertising',
          label: 'Network Advertising',
          icon: Network,
        },
        { id: 'data-insights', label: 'Data Insights', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'system-performance',
          label: 'System Performance',
          icon: Activity,
        },
        {
          id: 'push-notifications',
          label: 'Push Notifications',
          icon: BellRing,
        },
        { id: 'email-reports', label: 'Email Reports', icon: Mail },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'hierarchy-team', label: 'Hierarchy & Team', icon: Building2 },
        { id: 'affiliate-network', label: 'Affiliate Network', icon: Share2 },
      ],
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
