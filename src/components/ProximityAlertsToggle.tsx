import { useState, useEffect, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Radar, MapPin, BellRing, Lock } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Coupon } from '@/lib/types'

function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3 // metres
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function ProximityAlertsToggle() {
  const { t } = useLanguage()
  const { user, coupons, platformSettings, reservedIds } = useCouponStore()
  const [isActive, setIsActive] = useState(
    () => localStorage.getItem('globalRadar') === 'true',
  )
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showPermissionError, setShowPermissionError] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const cooldownsRef = useRef<Record<string, number>>({})

  const isSupported = 'geolocation' in navigator && 'Notification' in window
  const masterEnabled = platformSettings.globalProximityAlertsEnabled !== false

  useEffect(() => {
    if (isActive && masterEnabled && user && user.role === 'user') {
      startTracking()
    } else {
      stopTracking()
    }
    return () => stopTracking()
  }, [isActive, masterEnabled, coupons, reservedIds, user])

  const startTracking = () => {
    if (watchIdRef.current) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords

        coupons.forEach((coupon) => {
          if (
            !coupon.coordinates ||
            !coupon.enableProximityAlerts ||
            coupon.status !== 'active'
          )
            return

          // Must have available vouchers or be reserved by the user
          const isReserved = reservedIds.includes(coupon.id)
          const isAvailable = (coupon.totalAvailable ?? 100) > 0
          if (!isReserved && !isAvailable) return

          // Cooldown logic: 1 hour (3600000 ms) per store/coupon
          const lastNotified = cooldownsRef.current[coupon.id] || 0
          if (Date.now() - lastNotified < 3600000) return

          const radius = coupon.alertRadius || 100
          const dist = getDistanceMeters(
            latitude,
            longitude,
            coupon.coordinates.lat,
            coupon.coordinates.lng,
          )

          if (dist <= radius) {
            triggerNotification(coupon)
            cooldownsRef.current[coupon.id] = Date.now()
          }
        })
      },
      (err) => {
        console.error('Geolocation error:', err)
        if (err.code === err.PERMISSION_DENIED) {
          stopTracking()
          setIsActive(false)
          localStorage.setItem('globalRadar', 'false')
          setShowPermissionError(true)
        }
      },
      {
        enableHighAccuracy: false, // Save battery
        maximumAge: 30000,
        timeout: 10000,
      },
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  const triggerNotification = (coupon: Coupon) => {
    if (Notification.permission === 'granted') {
      const n = new Notification(
        t('proximity.nearby_alert', 'Oferta Próxima!'),
        {
          body: `${coupon.storeName}: ${coupon.discount} OFF. Clique para ver e usar!`,
          icon: coupon.image || '/icon-192.png',
        },
      )

      n.onclick = (e) => {
        e.preventDefault()
        window.focus()
        window.location.href = `/voucher/${coupon.id}`
        n.close()
      }
    } else {
      toast.success(`${coupon.storeName}: ${coupon.discount} OFF.`, {
        description: t(
          'proximity.nearby_toast_desc',
          'Você está bem perto, não perca essa oportunidade!',
        ),
        action: {
          label: t('common.view', 'Ver Oferta'),
          onClick: () => {
            window.location.href = `/voucher/${coupon.id}`
          },
        },
        duration: 8000,
      })
    }
  }

  const handleToggle = (checked: boolean) => {
    if (checked) {
      if (
        Notification.permission === 'default' ||
        !('geolocation' in navigator)
      ) {
        setShowOnboarding(true)
      } else if (Notification.permission === 'denied') {
        setShowPermissionError(true)
      } else {
        requestAndStart()
      }
    } else {
      stopTracking()
      setIsActive(false)
      localStorage.setItem('globalRadar', 'false')
      cooldownsRef.current = {} // Reset cooldowns on manual toggle
      toast.info(t('proximity.alerts_disabled', 'Radar de Ofertas desativado.'))
    }
  }

  const requestAndStart = async () => {
    setShowOnboarding(false)
    let notifPerm = Notification.permission
    if (notifPerm === 'default') {
      notifPerm = await Notification.requestPermission()
    }

    if (notifPerm === 'denied') {
      setShowPermissionError(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setIsActive(true)
        localStorage.setItem('globalRadar', 'true')
        toast.success(
          t(
            'proximity.alerts_enabled',
            'Radar ativado! Avisaremos quando você estiver perto de promoções.',
          ),
        )
      },
      (err) => {
        console.error(err)
        if (err.code === err.PERMISSION_DENIED) {
          setShowPermissionError(true)
        } else {
          toast.error(
            t(
              'proximity.location_error',
              'Não foi possível acessar a localização.',
            ),
          )
        }
      },
    )
  }

  // Hide the radar toggle if not supported, disabled globally, no user, or user is not a standard 'user'
  if (!isSupported || !masterEnabled || !user || user.role !== 'user')
    return null

  return (
    <>
      <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[60]">
        <div
          className={cn(
            'flex items-center space-x-3 bg-white px-4 py-3 rounded-full border shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-105 duration-300 min-h-[44px]',
            isActive
              ? 'border-primary/50 shadow-primary/20'
              : 'border-slate-200',
          )}
        >
          <div
            className={cn(
              'relative flex h-5 w-5 items-center justify-center shrink-0',
            )}
          >
            {isActive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50"></span>
            )}
            <Radar
              className={cn(
                'relative h-5 w-5',
                isActive ? 'text-primary' : 'text-slate-400',
              )}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <Label
              htmlFor="global-proximity-alerts"
              className="font-bold text-xs sm:text-sm cursor-pointer leading-tight text-slate-800 truncate"
            >
              {isActive
                ? t(
                    'proximity.alerts_title_active',
                    'Radar de Ofertas - Ativado',
                  )
                : t('proximity.alerts_title_disabled', 'Radar - Desativado')}
            </Label>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              {isActive
                ? t('proximity.status_active', 'Buscando lojas próximas...')
                : t('proximity.status_inactive', 'Desativado')}
            </span>
          </div>
          <div className="pl-3 border-l ml-3 flex items-center">
            <Switch
              id="global-proximity-alerts"
              checked={isActive}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Radar className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t('proximity.onboarding_title', 'Ativar Radar de Proximidade')}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t(
                'proximity.onboarding_desc',
                'Para receber alertas automáticos das lojas ao seu redor, precisamos de duas permissões:',
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">
                  {t('proximity.perm_location_title', 'Localização (Sempre)')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t(
                    'proximity.perm_location_desc',
                    'Permite monitorar sua distância das lojas e ativar os alertas silenciosamente.',
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <BellRing className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">
                  {t('proximity.perm_notif_title', 'Notificações')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t(
                    'proximity.perm_notif_desc',
                    'Avisa você imediatamente com o celular bloqueado ao passar perto das promoções.',
                  )}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
            <Button onClick={requestAndStart} className="w-full font-bold h-11">
              {t('proximity.grant_permissions', 'Conceder Permissões')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowOnboarding(false)}
              className="w-full text-slate-500 hover:bg-slate-100"
            >
              {t('common.cancel', 'Agora não')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPermissionError} onOpenChange={setShowPermissionError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl text-slate-800">
              {t('proximity.permission_blocked_title', 'Permissões Bloqueadas')}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t(
                'proximity.permission_blocked_desc',
                'Seu navegador bloqueou o acesso à localização ou notificações. Para usar o Radar, você precisa permitir o acesso manualmente.',
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 text-sm text-slate-700 space-y-3">
            <p className="font-semibold">
              {t('proximity.how_to_resolve', 'Como resolver no navegador:')}
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>
                {t('proximity.resolve_step_1', 'Clique no ícone de')}{' '}
                <strong>
                  {t('proximity.resolve_step_1_lock', 'cadeado')}{' '}
                  <Lock className="inline w-3 h-3" />
                </strong>{' '}
                {t(
                  'proximity.resolve_step_1_rest',
                  'ao lado da barra de endereço (onde aparece a URL do site).',
                )}
              </li>
              <li>
                {t(
                  'proximity.resolve_step_2',
                  'Acesse Configurações do site ou gerencie as permissões na lista.',
                )}
              </li>
              <li>
                {t(
                  'proximity.resolve_step_3',
                  'Altere "Localização" e "Notificações" para Permitir.',
                )}
              </li>
              <li>
                {t(
                  'proximity.resolve_step_4',
                  'Recarregue a página e tente ativar o Radar novamente.',
                )}
              </li>
            </ol>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => setShowPermissionError(false)}
              className="w-full font-bold h-11"
            >
              {t('proximity.understood', 'Entendi')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
