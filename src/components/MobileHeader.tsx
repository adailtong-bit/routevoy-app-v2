import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Home,
  Menu,
  Settings,
  Gift,
  Ticket,
  Filter,
  MapPin,
  Globe,
  Compass,
  User,
  LogOut,
  Building,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { CATEGORIES } from '@/lib/data'
import { NotificationPopover } from '@/components/shared/NotificationPopover'

export function MobileHeader() {
  const { logout } = useCouponStore()
  const { user: authUser, profile, role: authRole, signOut } = useAuth()

  const isMasterEmail = authUser?.email === 'adailtong@gmail.com'

  const user = authUser
    ? {
        id: authUser.id,
        name:
          profile?.name ||
          authUser.user_metadata?.name ||
          authUser.email?.split('@')[0] ||
          'User',
        email: authUser.email,
        role: isMasterEmail ? 'super_admin' : authRole || 'user',
        avatar: authUser.user_metadata?.avatar_url || null,
      }
    : null

  const { t, language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsMenuOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchParams(
      (prev) => {
        if (val) prev.set('q', val)
        else prev.delete('q')
        return prev
      },
      { replace: true },
    )
  }

  const handleLogout = async () => {
    await signOut()
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-600 hover:text-primary -ml-2"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85vw] max-w-[350px] p-0 flex flex-col bg-white border-r-0 shadow-2xl"
            >
              <SheetHeader className="text-left sr-only">
                <SheetTitle>{t('nav.menu', 'Navigation Menu')}</SheetTitle>
              </SheetHeader>

              <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Routevoy"
                  className="h-12 w-12 rounded-xl object-cover shadow-sm border border-slate-200 bg-white"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                    Routevoy
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Explore e economize
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-slate-50">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t('nav.search', 'Search offers...')}
                    className="w-full pl-9 bg-slate-100 border-transparent hover:bg-slate-200 focus:bg-white focus:border-primary/30 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all shadow-none"
                  />
                </form>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <nav className="flex flex-col gap-1 px-3 py-4">
                  <div className="px-3 mb-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('nav.main_menu', 'Menu Principal')}
                    </p>
                  </div>

                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                      <Home className="h-4 w-4" />
                    </div>
                    {t('nav.home', 'Home')}
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </Link>

                  <Link
                    to="/explore"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                      <Compass className="h-4 w-4" />
                    </div>
                    {t('nav.explore', 'Explore')}
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </Link>

                  <div className="flex flex-col gap-1">
                    <div className="px-3 py-2 mt-1 text-sm font-semibold text-slate-700 flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Gift className="h-4 w-4" />
                      </div>
                      {t('nav.seasonal', 'Seasonal')}
                    </div>
                    <div className="pl-[3.25rem] flex flex-col gap-1 pr-3">
                      <Link
                        to="/seasonal-calendar"
                        onClick={() => setIsMenuOpen(false)}
                        className="py-2.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors border-l-2 border-slate-100 pl-3"
                      >
                        {t('nav.seasonal_calendar', 'Seasonal Calendar')}
                      </Link>
                      <Link
                        to="/seasonal-agenda"
                        onClick={() => setIsMenuOpen(false)}
                        className="py-2.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors border-l-2 border-slate-100 pl-3"
                      >
                        {t('nav.seasonal_agenda', 'Seasonal Agenda')}
                      </Link>
                    </div>
                  </div>

                  {user && (
                    <Link
                      to="/vouchers"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Ticket className="h-4 w-4" />
                      </div>
                      {t('nav.vouchers', 'My Vouchers')}
                      <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                    </Link>
                  )}

                  <Link
                    to="/travel"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                    {t('nav.travel', 'Experiences')}
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300" />
                  </Link>

                  <div className="my-4 border-t border-slate-100 mx-3"></div>

                  <div className="px-3 mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('nav.categories', 'Categories')}
                    </p>
                    <Filter className="h-3 w-3 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap gap-2 px-3 mb-2">
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="font-medium bg-slate-100/80 text-slate-600 hover:bg-slate-200 cursor-pointer border-transparent rounded-lg py-1.5 px-3 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t(cat.translationKey, cat.label)}
                      </Badge>
                    ))}
                  </div>

                  <div className="my-4 border-t border-slate-100 mx-3"></div>

                  <div className="px-3 mb-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('common.language', 'Language')}
                    </p>
                  </div>
                  <div className="px-3 mb-4">
                    <Select
                      value={language}
                      onValueChange={(v) => {
                        setLanguage(v as any)
                        setIsMenuOpen(false)
                      }}
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11 rounded-xl text-sm font-medium">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(user?.role === 'super_admin' || user?.role === 'admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 mt-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors mx-3"
                    >
                      <Settings className="h-4 w-4" />
                      {t('nav.admin', 'Admin Dashboard')}
                    </Link>
                  )}

                  {user?.role === 'franchisee' && (
                    <Link
                      to="/franchisee"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 mt-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors mx-3"
                    >
                      <Building className="h-4 w-4" />
                      {t('nav.franchisee', 'Regional Panel')}
                    </Link>
                  )}

                  {(user?.role === 'shopkeeper' ||
                    user?.role === 'merchant' ||
                    user?.role === 'admin' ||
                    user?.role === 'super_admin' ||
                    user?.role === 'franchisee') && (
                    <Link
                      to="/merchant"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 mt-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors mx-3"
                    >
                      <Building className="h-4 w-4" />
                      {t('nav.vendor', 'Vendor Dashboard')}
                    </Link>
                  )}

                  <div className="h-10"></div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:opacity-90"
          >
            <img
              src={logoUrl}
              alt="Routevoy"
              className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200"
            />
            <span className="font-bold text-lg text-primary tracking-tight">
              Routevoy
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationPopover />
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-8 w-8 border cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      {t('profile.title', 'My Profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout', 'Sign Out')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              variant="default"
              className="font-bold rounded-full ml-1"
            >
              <Link to="/login">{t('auth.login', 'Sign In')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
