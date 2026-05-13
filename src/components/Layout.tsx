import { Outlet, useLocation } from 'react-router-dom'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { ProximityAlertsToggle } from './ProximityAlertsToggle'
import { DevNavigation } from './DevNavigation'
import { Footer } from './Footer'
import { UserToolbar } from './UserToolbar'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden w-full max-w-[100vw]">
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1 w-full min-w-0 relative max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <ProximityAlertsToggle />

      <UserToolbar />

      {/* Botão flutuante para QA / Admin transitar de forma fácil entre ambientes (disponível globalmente, minimizado por padrão) */}
      <DevNavigation />
    </div>
  )
}
