import { Share2, BadgeAlert, BellOff, Settings } from 'lucide-react'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export function AppSettingsMenu() {
  const { t } = useLanguage()
  const notificationCtx = useNotification()
  const addNotification = notificationCtx?.addNotification || (() => {})
  const clearAll = notificationCtx?.clearAll || (() => {})
  const { role, user } = useAuth()

  const isMasterEmail = user?.email === 'adailtong@gmail.com'
  const isAdmin = role === 'super_admin' || role === 'admin' || isMasterEmail

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
      title: 'Test Badge',
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
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Settings className="mr-2 h-4 w-4" />
        <span>{t('nav.settings', 'Configurações')}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="mr-2 h-4 w-4" />
          <span>{t('pwa.share', 'Compartilhar App')}</span>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleTestBadge}
              className="cursor-pointer"
            >
              <BadgeAlert className="mr-2 h-4 w-4 text-amber-500" />
              <span>{t('pwa.test_badge', 'Testar Notificações')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleClearNotifications}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <BellOff className="mr-2 h-4 w-4 text-red-500" />
              <span>{t('pwa.clear_notifications', 'Limpar Notificações')}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
