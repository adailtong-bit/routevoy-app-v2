import { Share2, BadgeAlert, BellOff, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'
import { toast } from 'sonner'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function UserToolbar() {
  const languageCtx = useLanguage()
  const notificationCtx = useNotification()

  const t = languageCtx?.t || ((key: string, fallback: string) => fallback)
  const addNotification = notificationCtx?.addNotification || (() => {})
  const clearAll = notificationCtx?.clearAll || (() => {})

  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div className="fixed bottom-24 left-6 z-[60] flex flex-col-reverse items-start gap-3 group">
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-xl transition-all bg-slate-900 hover:bg-slate-800 text-white"
        aria-label="User Toolbar"
      >
        <Settings2 className="h-6 w-6" />
      </Button>

      <div
        className={cn(
          'flex flex-col gap-2 transition-all duration-300 origin-bottom-left',
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-75 opacity-0 translate-y-4 pointer-events-none',
        )}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            handleShare()
            setIsOpen(false)
          }}
          className="shadow-lg rounded-full px-5 py-5 font-semibold justify-start bg-white hover:bg-slate-50 border border-slate-100 text-slate-700"
        >
          <Share2 className="w-4 h-4 mr-2 text-indigo-500" />
          {t('pwa.share', 'Share App')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            handleTestBadge()
            setIsOpen(false)
          }}
          className="shadow-lg rounded-full px-5 py-5 font-semibold justify-start bg-white hover:bg-slate-50 border border-slate-100 text-slate-700"
        >
          <BadgeAlert className="w-4 h-4 mr-2 text-amber-500" />
          {t('pwa.test_badge', 'Test Badge')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            handleClearNotifications()
            setIsOpen(false)
          }}
          className="shadow-lg rounded-full px-5 py-5 font-semibold justify-start bg-white hover:bg-red-50 border border-slate-100 text-slate-700 hover:text-red-600"
        >
          <BellOff className="w-4 h-4 mr-2 text-red-500" />
          {t('pwa.clear_notifications', 'Clear Notifications')}
        </Button>
      </div>
    </div>
  )
}
