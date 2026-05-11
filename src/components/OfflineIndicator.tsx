import { WifiOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function OfflineIndicator() {
  const { t } = useLanguage()

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top">
      <WifiOff className="h-4 w-4" />
      <span>
        {t(
          'offline.message',
          'Você está navegando no modo offline. Alguns recursos podem estar indisponíveis.',
        )}
      </span>
    </div>
  )
}
