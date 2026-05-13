import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DesktopHeader } from './DesktopHeader'

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="p-8 text-center text-slate-500 w-full flex-1 flex items-center justify-center">
          Ocorreu um erro ao carregar o conteúdo desta seção.
        </div>
      )
    return this.props.children
  }
}
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
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />

      <ErrorBoundary>
        <ProximityAlertsToggle />
      </ErrorBoundary>

      <ErrorBoundary>
        <UserToolbar />
      </ErrorBoundary>

      {/* Botão flutuante para QA / Admin transitar de forma fácil entre ambientes (disponível globalmente, minimizado por padrão) */}
      <ErrorBoundary>
        <DevNavigation />
      </ErrorBoundary>
    </div>
  )
}
