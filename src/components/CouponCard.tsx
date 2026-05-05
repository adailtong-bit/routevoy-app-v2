import { useState } from 'react'
import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star,
  MapPin,
  Clock,
  ImageOff,
  Globe,
  CheckCircle,
  Sparkles,
  Heart,
  Share2,
  Copy,
  MessageCircle,
  Users,
  BadgeCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'

interface CouponCardProps {
  coupon: Coupon
  variant?: 'vertical' | 'horizontal'
  className?: string
}

export function CouponCard({
  coupon,
  variant = 'vertical',
  className,
}: CouponCardProps) {
  const { t, formatCurrency, language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, reserveCoupon, isReserved } = useCouponStore()
  const [imgError, setImgError] = useState(false)

  const [isFavorite, setIsFavorite] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('user_favorites') || '[]')
    return favs.includes(coupon.id)
  })

  const reserved = isReserved(coupon.id)
  const isSoldOut =
    coupon.totalAvailable !== undefined && coupon.totalAvailable <= 0
  const isOnline = coupon.offerType === 'online' || !!coupon.externalUrl

  const isVerified = coupon.source === 'partner'
  const isOrganic =
    coupon.source === 'organic' || coupon.source === 'aggregated'

  const title = coupon.translations?.[language]?.title || coupon.title
  const description =
    coupon.translations?.[language]?.description || coupon.description

  const now = new Date()
  const startDateObj = coupon.startDate
    ? new Date(`${coupon.startDate}T00:00:00`)
    : null
  const endDateObj =
    coupon.endDate || coupon.expiryDate
      ? new Date(`${coupon.endDate || coupon.expiryDate}T23:59:59`)
      : null

  const isScheduled = !!(startDateObj && now < startDateObj)
  const isExpired = !!(endDateObj && now > endDateObj)
  const isExpiringSoon =
    !isExpired &&
    !!(
      endDateObj && (endDateObj.getTime() - now.getTime()) / (1000 * 3600) <= 72
    )
  const isDisabled = isSoldOut || reserved || isExpired || isScheduled
  const hasExternalLink = !!coupon.externalUrl

  const originalPrice =
    (coupon as any).originalPrice ||
    (coupon.price ? coupon.price * 1.3 : undefined)

  const getButtonText = () => {
    if (isSoldOut) return t('vouchers.sold_out', 'Esgotado')
    if (isExpired) return t('vouchers.expired', 'Expirada')
    if (isScheduled) return t('vouchers.scheduled', 'Agendada')
    if (hasExternalLink) return t('vouchers.go_to_deal', 'Ver Oferta')
    if (reserved) return t('vouchers.reserved', 'Reservado')
    return t('vouchers.reserve', 'Ver Oferta')
  }

  const handleCardClick = () => {
    if (hasExternalLink) {
      window.open(coupon.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(`/voucher/${coupon.id}`)
  }

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (hasExternalLink) {
      window.open(coupon.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    if (isDisabled) return

    const success = reserveCoupon(coupon.id)
    if (success) {
      toast.success(
        t('voucher_detail.reserved_success', 'Voucher reservado com sucesso!'),
      )
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const favs = JSON.parse(localStorage.getItem('user_favorites') || '[]')
    if (isFavorite) {
      const newFavs = favs.filter((id: string) => id !== coupon.id)
      localStorage.setItem('user_favorites', JSON.stringify(newFavs))
      setIsFavorite(false)
      toast.success(t('favorites.removed', 'Removido dos favoritos'))
    } else {
      favs.push(coupon.id)
      localStorage.setItem('user_favorites', JSON.stringify(favs))
      setIsFavorite(true)
      toast.success(t('favorites.added', 'Adicionado aos favoritos'))
    }
  }

  const shareUrl = `${window.location.origin}/voucher/${coupon.id}`
  const shareText = `Confira esta oferta: ${coupon.storeName} - ${title}! Veja mais em: ${shareUrl}`

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copiado para a área de transferência!')
  }

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
    )
  }

  if (variant === 'horizontal') {
    return (
      <div onClick={handleCardClick} className="block cursor-pointer">
        <Card
          className={cn(
            'overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group min-h-[140px] flex border-slate-200/60 rounded-xl bg-white relative',
            className,
          )}
        >
          <div className="w-32 sm:w-48 relative bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
              <button
                onClick={toggleFavorite}
                className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors backdrop-blur-sm"
              >
                <Heart
                  className={cn(
                    'w-4 h-4 text-slate-400 hover:text-red-500 transition-colors',
                    isFavorite &&
                      'fill-red-500 text-red-500 hover:text-red-600',
                  )}
                />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors backdrop-blur-sm"
                  >
                    <Share2 className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWhatsApp}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {!imgError ? (
              <img
                src={coupon.image}
                alt={title}
                crossOrigin="anonymous"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <ImageOff className="h-8 w-8 text-slate-300" />
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 items-start">
              {isSoldOut && (
                <Badge className="bg-red-600 text-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none">
                  {t('vouchers.sold_out', 'Esgotado')}
                </Badge>
              )}
              {isExpired && !isSoldOut && (
                <Badge
                  variant="secondary"
                  className="shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none bg-slate-800 text-white"
                >
                  {t('vouchers.expired', 'Vencido')}
                </Badge>
              )}
              {isExpiringSoon && !isSoldOut && !isExpired && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none">
                  {t('vouchers.expiring_soon', 'Expira em breve')}
                </Badge>
              )}
              {isScheduled && !isSoldOut && (
                <Badge className="bg-blue-500 text-white hover:bg-blue-600 shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none">
                  {t('vouchers.scheduled', 'Agendada')}
                </Badge>
              )}
              {!isSoldOut && !isExpired && !isScheduled && (
                <Badge className="bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm text-[11px] h-6 px-2 py-0">
                  {coupon.discount}
                </Badge>
              )}
            </div>
            {coupon.isVerified && (
              <Badge className="absolute bottom-8 left-2 bg-green-500/90 hover:bg-green-600 text-white shadow-sm font-bold backdrop-blur-sm text-[9px] h-5 px-1.5 py-0 border-none flex items-center gap-1 z-10">
                <BadgeCheck className="w-3 h-3" />
                {t('vouchers.verified', 'Verificado')}
              </Badge>
            )}
            {isOnline && (
              <Badge
                variant="secondary"
                className="absolute bottom-2 left-2 text-[9px] px-2 h-5 bg-blue-500/90 hover:bg-blue-600 text-white border-none shadow-sm z-10"
              >
                <Globe className="w-3 h-3 mr-1" />{' '}
                {t('vouchers.online', 'Online')}
              </Badge>
            )}
          </div>
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm sm:text-base text-slate-800 truncate leading-tight flex-1 mr-2">
                  {title}
                </h4>
                {coupon.averageRating && (
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md shrink-0">
                    <Star className="h-3 w-3 fill-current" />
                    {coupon.averageRating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 mb-2">
                <p className="text-xs text-slate-500 truncate font-medium">
                  {coupon.storeName}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {description}
              </p>
              {coupon.usageCount > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium mt-2 bg-green-50 w-fit px-1.5 py-0.5 rounded-md">
                  <Users className="w-3 h-3" />
                  {coupon.usageCount}{' '}
                  {t('vouchers.used_today', 'pessoas usaram hoje')}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      {isOnline ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-blue-500" />{' '}
                          {t('vouchers.online', 'Online')}
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5" />{' '}
                          {coupon.distance > 1000
                            ? `${(coupon.distance / 1000).toFixed(1)}km`
                            : `${Math.round(coupon.distance)}m`}
                        </>
                      )}
                    </span>
                    <span
                      className="flex items-center gap-1 text-orange-600"
                      title={t('vouchers.expiration_date', 'Data de Expiração')}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString(
                            language === 'pt'
                              ? 'pt-BR'
                              : language === 'es'
                                ? 'es-ES'
                                : 'en-US',
                          )
                        : t('vouchers.expires', 'Expira em')}
                    </span>
                  </div>
                  {hasExternalLink && (
                    <div className="flex items-center gap-1 text-slate-400 mt-0.5 truncate max-w-[200px]">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {t('vouchers.source_site', 'Site de Origem')}:{' '}
                        {(() => {
                          try {
                            return new URL(
                              coupon.externalUrl!,
                            ).hostname.replace('www.', '')
                          } catch (e) {
                            return coupon.externalUrl
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  {coupon.price !== undefined && !coupon.isPaid && (
                    <div className="flex items-center gap-1.5">
                      {originalPrice !== undefined && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(originalPrice, coupon.currency)}
                        </span>
                      )}
                      <span className="font-bold text-green-600 text-sm sm:text-base">
                        {formatCurrency(coupon.price, coupon.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {t(
                    'vouchers.validity_disclaimer',
                    'Válido por 30 dias ou enquanto durarem os estoques',
                  )}
                </span>
                <Button
                  size="sm"
                  variant={
                    reserved && !hasExternalLink ? 'secondary' : 'default'
                  }
                  className={cn(
                    'h-11 sm:h-10 text-xs sm:text-sm px-4 shadow-sm font-semibold rounded-lg w-full sm:w-auto',
                    hasExternalLink &&
                      'bg-blue-600 hover:bg-blue-700 text-white',
                  )}
                  onClick={handleAction}
                  disabled={isDisabled}
                >
                  {hasExternalLink && <Globe className="w-4 h-4 mr-1.5" />}
                  {getButtonText()}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      onClick={handleCardClick}
      className="block h-full cursor-pointer relative"
    >
      <Card
        className={cn(
          'overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group h-full flex flex-col border-slate-200/60 rounded-xl bg-white relative',
          className,
        )}
      >
        <div className="relative h-36 sm:h-44 overflow-hidden bg-slate-100 flex items-center justify-center">
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
            <button
              onClick={toggleFavorite}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors backdrop-blur-sm"
            >
              <Heart
                className={cn(
                  'w-4 h-4 text-slate-400 hover:text-red-500 transition-colors',
                  isFavorite && 'fill-red-500 text-red-500 hover:text-red-600',
                )}
              />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors backdrop-blur-sm"
                >
                  <Share2 className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {!imgError ? (
            <img
              src={coupon.image}
              alt={title}
              crossOrigin="anonymous"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageOff className="h-8 w-8 text-slate-300" />
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 items-start">
            {isSoldOut && (
              <Badge className="bg-red-600 text-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none">
                {t('vouchers.sold_out', 'Esgotado')}
              </Badge>
            )}
            {isExpired && !isSoldOut && (
              <Badge
                variant="secondary"
                className="shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none bg-slate-800 text-white"
              >
                {t('vouchers.expired', 'Vencido')}
              </Badge>
            )}
            {isExpiringSoon && !isSoldOut && !isExpired && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none">
                {t('vouchers.expiring_soon', 'Expira em breve')}
              </Badge>
            )}
            {isScheduled && !isSoldOut && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-600 shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-2 py-0 border-none">
                {t('vouchers.scheduled', 'Agendada')}
              </Badge>
            )}
            {!isSoldOut && !isExpired && !isScheduled && (
              <Badge className="bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm text-[11px] h-6 px-2 py-0">
                {coupon.discount}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 z-10 items-end">
            {coupon.isFeatured && (
              <Badge
                variant="secondary"
                className="text-[9px] px-2 h-5 bg-yellow-400 text-yellow-900 border-none shadow-sm font-bold"
              >
                {t('vouchers.featured', 'Destaque')}
              </Badge>
            )}
            {coupon.isVerified && (
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 h-5 bg-green-500 text-white border-none shadow-sm font-bold flex items-center gap-1"
              >
                <BadgeCheck className="w-3 h-3" />
                {t('vouchers.verified', 'Verificado')}
              </Badge>
            )}
            {isOnline && (
              <Badge
                variant="secondary"
                className="text-[9px] px-2 h-5 bg-blue-500 text-white border-none shadow-sm font-bold"
              >
                <Globe className="w-3 h-3 mr-1" />{' '}
                {t('vouchers.online', 'Online')}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 leading-tight line-clamp-2 flex-1 mr-2">
              {title}
            </h3>
            {coupon.averageRating && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md shrink-0">
                <Star className="h-3 w-3 fill-current" />
                {coupon.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 mt-1 mb-3">
            <p className="text-xs text-slate-500 truncate font-medium">
              {coupon.storeName}
            </p>
            {coupon.usageCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium bg-green-50 w-fit px-1.5 py-0.5 rounded-md mt-1">
                <Users className="w-3.5 h-3.5" />
                {coupon.usageCount}{' '}
                {t('vouchers.used_today', 'pessoas usaram hoje')}
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {isOnline ? (
                    <>
                      <Globe className="h-3.5 w-3.5 text-blue-500" />
                      {t('vouchers.online', 'Online')}
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3.5 w-3.5" />
                      {coupon.distance > 1000
                        ? `${(coupon.distance / 1000).toFixed(1)}km`
                        : `${Math.round(coupon.distance)}m`}
                    </>
                  )}
                </span>
                <span
                  className="flex items-center gap-1 text-orange-600"
                  title={t('vouchers.expiration_date', 'Data de Expiração')}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {coupon.expiryDate
                    ? new Date(coupon.expiryDate).toLocaleDateString(
                        language === 'pt'
                          ? 'pt-BR'
                          : language === 'es'
                            ? 'es-ES'
                            : 'en-US',
                      )
                    : t('vouchers.expires', 'Expira em')}
                </span>
              </div>
              {hasExternalLink && (
                <div className="flex items-center gap-1 text-slate-400 mt-0.5 truncate">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {t('vouchers.source_site', 'Site de Origem')}:{' '}
                    {(() => {
                      try {
                        return new URL(coupon.externalUrl!).hostname.replace(
                          'www.',
                          '',
                        )
                      } catch (e) {
                        return coupon.externalUrl
                      }
                    })()}
                  </span>
                </div>
              )}
            </div>

            {coupon.price !== undefined && !coupon.isPaid && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 font-medium">
                  {t('vouchers.price', 'Preço')}
                </span>
                <div className="flex items-center gap-1.5">
                  {originalPrice !== undefined && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(originalPrice, coupon.currency)}
                    </span>
                  )}
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(coupon.price, coupon.currency)}
                  </span>
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant={reserved && !hasExternalLink ? 'secondary' : 'default'}
              className={cn(
                'w-full h-11 sm:h-10 text-xs sm:text-sm font-semibold rounded-lg shadow-sm',
                hasExternalLink && 'bg-blue-600 hover:bg-blue-700 text-white',
              )}
              onClick={handleAction}
              disabled={isDisabled}
            >
              {hasExternalLink && <Globe className="w-4 h-4 mr-2" />}
              {getButtonText()}
            </Button>
            <span className="text-[10px] text-slate-400 text-center font-medium leading-tight">
              {t(
                'vouchers.validity_disclaimer',
                'Válido por 30 dias ou enquanto durarem os estoques',
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
