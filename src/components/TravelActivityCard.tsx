import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coupon } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  CalendarDays,
  Info,
  QrCode,
  ImageOff,
  Trash2,
  Calendar,
  Navigation,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Barcode,
  Car,
  Hotel,
  Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookingForm } from './BookingForm'
import { toast } from 'sonner'

interface TravelActivityCardProps {
  stop: Coupon
  dayId: string
  mockTime: string
  onRemove: (dayId: string, stopId: string) => void
  isShopping?: boolean
}

export function TravelActivityCard({
  stop,
  dayId,
  mockTime,
  onRemove,
  isShopping = false,
}: TravelActivityCardProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { userLocation } = useCouponStore()
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isHotel =
    stop.category === 'hotel' ||
    (stop.category === 'Outros' && stop.title.toLowerCase().includes('hotel'))
  const isCar =
    stop.category === 'car_rental' ||
    (stop.category === 'Serviços' && stop.title.toLowerCase().includes('car'))
  const bookingType = isCar ? 'car' : isHotel ? 'hotel' : 'general'

  const handleBookingSuccess = () => {
    setIsBookingOpen(false)
    navigate('/travel?tab=bookings')
  }

  const handleCopy = () => {
    if (stop.code) {
      navigator.clipboard.writeText(stop.code)
      setCopied(true)
      toast.success(t('activity_card.copied', 'Copiado!'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const destination = stop.coordinates?.lat
    ? `${stop.coordinates.lat},${stop.coordinates.lng}`
    : encodeURIComponent(stop.address || stop.storeName || '')
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${
    userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''
  }`

  const shopUrl =
    stop.externalUrl ||
    `https://www.amazon.com.br/s?k=${encodeURIComponent(stop.title)}`

  return (
    <div
      id={`stop-${stop.id}`}
      className="flex gap-4 group transition-all duration-500 rounded-xl"
    >
      <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center pt-4">
        <span className="text-xs sm:text-sm font-bold text-slate-700 text-center leading-tight whitespace-pre-line">
          {mockTime || '--:--'}
        </span>
        <div className="flex-1 w-px bg-slate-200 mt-2 group-last:hidden" />
      </div>

      <Card className="flex-1 overflow-hidden hover:shadow-md transition-shadow bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-40 sm:h-auto shrink-0 relative bg-slate-100 flex items-center justify-center">
            {stop.image ? (
              <img
                src={stop.image}
                alt={stop.storeName}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : isCar ? (
              <Car className="h-8 w-8 text-slate-400" />
            ) : isHotel ? (
              <Hotel className="h-8 w-8 text-slate-400" />
            ) : stop.category === 'activity' ? (
              <Ticket className="h-8 w-8 text-slate-400" />
            ) : (
              <ImageOff className="h-8 w-8 text-slate-400" />
            )}
            <Badge className="absolute top-2 left-2 bg-white/90 text-slate-900 border-none shadow-sm">
              {stop.category}
            </Badge>
          </div>
          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start gap-4 mb-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                  {stop.storeName}
                </h4>
                <p className="text-sm text-primary font-medium">{stop.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 -mr-2 -mt-2"
                onClick={() => onRemove(dayId, stop.id)}
                title={t('travel.activity_removed', 'Activity removed')}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {stop.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-start sm:items-center gap-1.5 text-xs text-slate-600 pr-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                <span className="line-clamp-2 sm:line-clamp-1">
                  {stop.address ||
                    t(
                      'activity_card.address_unavailable',
                      'Address unavailable',
                    )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 gap-1.5 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium shadow-sm"
                >
                  <a href={navUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-3 w-3" />{' '}
                    {t('travel.navigate', 'Navegar')}
                  </a>
                </Button>

                {isShopping ? (
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    asChild
                  >
                    <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />{' '}
                      {t('activity_card.shop_now', 'Comprar Online')}
                    </a>
                  </Button>
                ) : (
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-2 bg-slate-50 border-primary/20 text-primary hover:bg-primary/5 font-semibold shadow-sm"
                      >
                        <Calendar className="h-3 w-3" />{' '}
                        {t('activity_card.book_now', 'Reservar')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                      <DialogTitle className="sr-only">
                        {t('hub.book', 'Reservar')} {stop.storeName}
                      </DialogTitle>
                      <BookingForm
                        coupon={stop}
                        type={bookingType}
                        onSuccess={handleBookingSuccess}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {isShopping ? (
              <div className="mt-auto bg-slate-50 rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('activity_card.promo_code', 'Código Promocional')}
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-800 shadow-sm">
                        {stop.code || t('activity_card.no_code', 'SEM-CÓDIGO')}
                      </code>
                      {stop.code && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 bg-white shadow-sm"
                          onClick={handleCopy}
                          title={t('activity_card.copy', 'Copiar')}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none gap-2 bg-white shadow-sm h-9"
                        >
                          <QrCode className="h-4 w-4 text-slate-500" /> QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xs text-center p-6">
                        <DialogTitle className="mb-4">
                          {t(
                            'activity_card.voucher_codes',
                            'Códigos do Voucher',
                          )}
                        </DialogTitle>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm inline-block mx-auto mb-3">
                          <QrCode
                            className="w-48 h-48 text-slate-800 mx-auto"
                            strokeWidth={1}
                          />
                        </div>
                        <p className="font-mono font-bold text-xl tracking-widest">
                          {stop.code || 'NO-CODE'}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          {stop.storeName}
                        </p>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none gap-2 bg-white shadow-sm h-9"
                        >
                          <Barcode className="h-4 w-4 text-slate-500" /> Barcode
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xs text-center p-6">
                        <DialogTitle className="mb-4">
                          {t(
                            'activity_card.voucher_codes',
                            'Códigos do Voucher',
                          )}
                        </DialogTitle>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center mx-auto mb-3 w-full">
                          <Barcode
                            className="w-full h-24 text-slate-800 mb-2"
                            strokeWidth={1}
                          />
                          <p className="font-mono font-bold text-xl tracking-widest">
                            {stop.code || 'NO-CODE'}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                          {stop.storeName}
                        </p>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    {t('activity_card.how_to_use', 'Como Utilizar')}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stop.instructions ||
                      t(
                        'activity_card.instructions_default',
                        'Apresente esta tela no balcão. Certifique-se de que o código esteja bem visível para garantir seu benefício.',
                      )}
                  </p>
                </div>
                <div className="shrink-0 bg-white border border-slate-200 rounded p-2 flex flex-col items-center justify-center min-w-[110px] w-full sm:w-auto shadow-sm">
                  <QrCode
                    className="h-10 w-10 text-slate-800 mb-1"
                    strokeWidth={1.5}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase text-center w-full truncate px-1">
                    {stop.code || t('activity_card.no_code', 'SEM-CÓDIGO')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
