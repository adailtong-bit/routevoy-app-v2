import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Ticket,
  Map,
  User,
  Compass,
  Store,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'

export function MobileNav() {
  const location = useLocation()
  const { t } = useLanguage()
  const { user: storeUser } = useCouponStore()
  const { role: authRole } = useAuth()

  const role = authRole || storeUser?.role

  let navItems = [
    { icon: Home, label: t('nav.home', 'Home'), path: '/' },
    { icon: Compass, label: t('nav.explore', 'Explore'), path: '/explore' },
    { icon: Ticket, label: t('nav.vouchers', 'Vouchers'), path: '/vouchers' },
    { icon: Map, label: t('nav.travel', 'Experiences'), path: '/travel' },
    { icon: User, label: t('nav.profile', 'Profile'), path: '/profile' },
  ]

  if (role === 'super_admin' || role === 'admin') {
    navItems = [
      { icon: LayoutDashboard, label: t('nav.admin', 'Admin'), path: '/admin' },
      { icon: Compass, label: t('nav.explore', 'Explore'), path: '/explore' },
      { icon: User, label: t('nav.profile', 'Profile'), path: '/profile' },
    ]
  } else if (role === 'shopkeeper' || role === 'merchant') {
    navItems = [
      { icon: Store, label: t('nav.vendor', 'Vendor'), path: '/merchant' },
      {
        icon: Ticket,
        label: t('nav.campaigns', 'Campaigns'),
        path: '/merchant/campaigns',
      },
      { icon: Compass, label: t('nav.explore', 'Explore'), path: '/explore' },
      { icon: User, label: t('nav.profile', 'Profile'), path: '/profile' },
    ]
  } else if (role === 'franchisee') {
    navItems = [
      {
        icon: ShieldCheck,
        label: t('nav.franchisee', 'Franchise'),
        path: '/franchisee',
      },
      { icon: Compass, label: t('nav.explore', 'Explore'), path: '/explore' },
      { icon: User, label: t('nav.profile', 'Profile'), path: '/profile' },
    ]
  } else if (role === 'affiliate') {
    navItems = [
      {
        icon: LayoutDashboard,
        label: t('nav.affiliate', 'Affiliate'),
        path: '/affiliate',
      },
      { icon: Compass, label: t('nav.explore', 'Explore'), path: '/explore' },
      { icon: User, label: t('nav.profile', 'Profile'), path: '/profile' },
    ]
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex h-16 items-center justify-around px-4 pb-safe">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[4rem] text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary',
              )}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'fill-primary/20')}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
