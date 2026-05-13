import React, { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { ProximityAlertsToggle } from './ProximityAlertsToggle'
import { DevNavigation } from './DevNavigation'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { Suspense, lazy } from 'react'

// Carregamento assíncrono para garantir isolamento da raiz
const UserToolbar = lazy(() =>
  import('./UserToolbar').then((m) => ({ default: m.UserToolbar })),
)

export default function Layout() {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden w-full max-w-[100vw]">
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1 w-full min-w-0 relative max-w-full overflow-x-hidden">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />

      <ErrorBoundary>
        <ProximityAlertsToggle />
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={null}>
          <UserToolbar />
        </Suspense>
      </ErrorBoundary>

      {/* Botão flutuante para QA / Admin transitar de forma fácil entre ambientes (disponível globalmente, minimizado por padrão) */}
      <ErrorBoundary>
        <DevNavigation />
      </ErrorBoundary>
    </div>
  )
}
