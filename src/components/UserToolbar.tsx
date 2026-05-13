import { Share2, BadgeAlert, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'
import { toast } from 'sonner'
import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

// ErrorBoundary silencioso específico para a toolbar para não quebrar a aplicação inteira
class SilentErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; retryCount: number }
> {
  public state = { hasError: false, retryCount: 0 }

  public static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      '[UserToolbar] SilentErrorBoundary caught an error:',
      error,
      info,
    )

    // Retentativa automática simples após falha (máximo 1 vez)
    if (this.state.retryCount < 1) {
      setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          retryCount: prev.retryCount + 1,
        }))
      }, 3000)
    }
  }

  public render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function UserToolbarContent() {
  const languageCtx = useLanguage()
  const notificationCtx = useNotification()

  const t = languageCtx?.t || ((key: string, fallback: string) => fallback)
  const addNotification = notificationCtx?.addNotification || (() => {})
  const clearAll = notificationCtx?.clearAll || (() => {})

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RouteVoy',
          text: t(
            'pwa.share_text',
            'Confira as melhores ofertas e cupons com geolocalização no RouteVoy!',
          ),
          url: window.location.origin,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.origin)
      toast.success(
        t('pwa.link_copied', 'Link copiado para a área de transferência!'),
      )
    }
  }

  const handleTestBadge = () => {
    addNotification({
      title: 'Badge de Teste',
      message: 'Esta é uma notificação de teste para o App Badge.',
      type: 'system' as any,
    })
    if ('setAppBadge' in navigator) {
      ;(navigator as any).setAppBadge(1).catch(console.error)
    }
    toast.success(t('pwa.badge_tested', 'Notificação de teste enviada!'))
  }

  const handleClearNotifications = () => {
    clearAll()
    if ('clearAppBadge' in navigator) {
      ;(navigator as any).clearAppBadge().catch(console.error)
    }
    toast.success(t('pwa.notifications_cleared', 'Notificações limpas!'))
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-3 animate-fade-in-up">
      <Button
        variant="secondary"
        size="icon"
        onClick={handleShare}
        className="h-12 w-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:scale-110 transition-transform"
        title={t('pwa.share', 'Share App')}
      >
        <Share2 className="w-5 h-5 text-indigo-500" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleTestBadge}
        className="h-12 w-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:scale-110 transition-transform"
        title={t('pwa.test_badge', 'Test Badge')}
      >
        <BadgeAlert className="w-5 h-5 text-amber-500" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleClearNotifications}
        className="h-12 w-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full bg-white hover:bg-red-50 border border-slate-200 text-slate-700 hover:text-red-600 hover:scale-110 transition-transform"
        title={t('pwa.clear_notifications', 'Clear Notifications')}
      >
        <BellOff className="w-5 h-5 text-red-500" />
      </Button>
    </div>,
    document.body,
  )
}

export function UserToolbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SilentErrorBoundary>
      <UserToolbarContent />
    </SilentErrorBoundary>
  )
}
