import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Megaphone,
  UsersRound,
  Bot,
  Settings,
  Tag,
  Wallet,
  Ticket,
  Menu,
  X,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'

export default function MerchantLayout() {
  const location = useLocation()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  // Ensure menu auto-closes on route change on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const menuGroups = [
    {
      label: t('merchant.menu.main', 'Principal'),
      items: [
        {
          href: '/merchant',
          label: t('merchant.nav.dashboard', 'Visão Geral'),
          icon: LayoutDashboard,
        },
        {
          href: '/merchant/campaigns',
          label: t('merchant.nav.campaigns', 'Gestão de Campanhas'),
          icon: Megaphone,
        },
        {
          href: '/merchant/offers',
          label: t('merchant.nav.offers', 'Ofertas'),
          icon: Tag,
        },
        {
          href: '/merchant/scanner',
          label: t('merchant.nav.scanner', 'Validador (Scanner)'),
          icon: Ticket,
        },
      ],
    },
    {
      label: t('merchant.menu.management', 'Gerenciamento'),
      items: [
        {
          href: '/merchant/crm',
          label: t('merchant.nav.crm', 'CRM & Leads'),
          icon: UsersRound,
        },
        {
          href: '/merchant/crawler',
          label: t('merchant.nav.crawler', 'Crawler Automático'),
          icon: Bot,
        },
        {
          href: '/merchant/ads',
          label: t('merchant.nav.ads', 'Anúncios (Ads)'),
          icon: Megaphone,
        },
        {
          href: '/merchant/finance',
          label: t('merchant.nav.finance', 'Financeiro'),
          icon: Wallet,
        },
        {
          href: '/merchant/settings',
          label: t('merchant.nav.settings', 'Configurações'),
          icon: Settings,
        },
      ],
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" />
          {t('merchant.portal_title', 'Portal do Lojista')}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6 px-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              {group.label}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/merchant' &&
                    location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-5 h-5',
                        isActive ? 'text-primary' : 'text-slate-400',
                      )}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 relative z-0">
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:block',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span className="font-bold text-slate-800">
              {t('merchant.portal_title', 'Portal do Lojista')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
