import { useState, useMemo, useEffect } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'
import { BookingForm } from './BookingForm'
import { StarRating } from './StarRating'
import { TravelOffer, TravelOfferType } from '@/lib/types'
import {
  Hotel,
  Car,
  Ticket,
  MapPin,
  Users,
  Megaphone,
  Search,
  ExternalLink,
  Globe,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TravelDiscoveryHubProps {
  onBookingSuccess?: () => void
}

export function TravelDiscoveryHub({
  onBookingSuccess,
}: TravelDiscoveryHubProps) {
  const { travelOffers, coupons } = useCouponStore()
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState('all')
  const [guests, setGuests] = useState('2')
  const [requirePrivacy, setRequirePrivacy] = useState(false)
  const [ads, setAds] = useState<any[]>([])

  const [detailsOffer, setDetailsOffer] = useState<TravelOffer | null>(null)
  const [bookingOffer, setBookingOffer] = useState<TravelOffer | null>(null)

  const numGuests = parseInt(guests)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data, error } = await supabase
          .from('ad_campaigns')
          .select('*')
          .eq('status', 'active')
          .eq('placement', 'experiences_tab')

        if (error) throw error
        if (data && data.length > 0) {
          setAds(data)
          // Increment views asynchronously
          Promise.all(
            data.map((ad) =>
              supabase
                .from('ad_campaigns')
                .update({ views: (ad.views || 0) + 1 })
                .eq('id', ad.id),
            ),
          ).catch(console.error)
        }
      } catch (err) {
        console.error('Error fetching ads for experiences:', err)
      }
    }
    fetchAds()
  }, [])

  const filteredOffers = useMemo(() => {
    const regularOffers = travelOffers.filter((offer) => {
      if (activeTab !== 'all') {
        if (activeTab === 'hotel' && offer.type !== 'hotel') return false
        if (activeTab === 'car_rental' && offer.type !== 'car_rental')
          return false
        if (activeTab === 'activity' && offer.type !== 'activity') return false
      }

      if (offer.type === 'hotel') {
        if (numGuests >= 4 && requirePrivacy && !offer.hasSeparatedRooms) {
          return false
        }
      }

      if (offer.type === 'activity') {
        if (offer.availability !== undefined && offer.availability <= 0) {
          return false
        }
      }

      return true
    })

    const mappedCoupons = coupons
      .filter((c) => {
        const cat = (c.category || '').toLowerCase()
        const isHotel =
          cat.includes('hotel') ||
          cat.includes('hoteis') ||
          cat.includes('hotéis') ||
          cat.includes('hospedagem') ||
          cat.includes('resort') ||
          cat.includes('pousada') ||
          cat.includes('estadia')
        const isCar =
          cat.includes('carro') ||
          cat.includes('aluguel') ||
          cat.includes('veículo') ||
          cat.includes('veiculo') ||
          cat.includes('mobilidade') ||
          cat.includes('transporte')
        const isActivity =
          cat.includes('atividade') ||
          cat.includes('ingresso') ||
          cat.includes('lazer') ||
          cat.includes('passeio') ||
          cat.includes('turismo') ||
          cat.includes('viagem') ||
          cat.includes('viagens') ||
          cat.includes('entretenimento') ||
          cat.includes('experiência') ||
          cat.includes('experiencia') ||
          cat.includes('atração') ||
          cat.includes('atracao')

        if (activeTab === 'all') return isHotel || isCar || isActivity
        if (activeTab === 'hotel' && isHotel) return true
        if (activeTab === 'car_rental' && isCar) return true
        if (activeTab === 'activity' && isActivity) return true
        return false
      })
      .map((c) => {
        const cat = (c.category || '').toLowerCase()
        const isHotel =
          cat.includes('hotel') ||
          cat.includes('hoteis') ||
          cat.includes('hotéis') ||
          cat.includes('hospedagem') ||
          cat.includes('resort') ||
          cat.includes('pousada') ||
          cat.includes('estadia')
        const isCar =
          cat.includes('carro') ||
          cat.includes('aluguel') ||
          cat.includes('veículo') ||
          cat.includes('veiculo') ||
          cat.includes('mobilidade') ||
          cat.includes('transporte')
        const determinedType = isHotel
          ? 'hotel'
          : isCar
            ? 'car_rental'
            : 'activity'

        return {
          id: c.id,
          type: determinedType as TravelOfferType,
          provider: c.storeName || 'Parceiro Local',
          title: c.title,
          description: c.description || c.instructions || '',
          price: c.price || c.originalPrice || 0,
          currency: c.currency || 'BRL',
          image:
            (c as any).imageUrl ||
            c.image ||
            `https://img.usecurling.com/p/400/300?q=${determinedType}`,
          destination: c.locationName || c.region || 'Local',
          link: c.externalUrl || '#',
          source: (c.source === 'organic' ? 'organic' : 'partner') as
            | 'partner'
            | 'organic',
          isSponsored: false,
          rating: 4.8,
        }
      })

    const sponsoredAds = ads
      .filter((ad) => {
        if (ad.category === 'all') return true
        if (activeTab === 'all') {
          return ['hotel', 'car_rental', 'activity', 'all'].includes(
            ad.category || '',
          )
        }
        if (activeTab === 'hotel' && ad.category !== 'hotel') return false
        if (activeTab === 'car_rental' && ad.category !== 'car_rental')
          return false
        if (activeTab === 'activity' && ad.category !== 'activity') return false
        return true
      })
      .map((ad) => {
        const type = ad.category === 'all' ? 'hotel' : ad.category
        return {
          id: ad.id,
          type: type as TravelOfferType,
          provider: 'Patrocinador',
          title: ad.title,
          description: 'Oferta patrocinada especial em destaque.',
          price: ad.price || 0,
          currency: ad.currency || 'BRL',
          image: ad.image || 'https://img.usecurling.com/p/400/300?q=travel',
          destination: ad.region || 'Global',
          link: ad.link || '#',
          source: 'partner' as const,
          isSponsored: true,
        }
      })

    return [...sponsoredAds, ...regularOffers, ...mappedCoupons]
  }, [travelOffers, coupons, activeTab, numGuests, requirePrivacy, ads])

  const getTranslated = (
    offer: TravelOffer,
    field: 'title' | 'description' | 'destination',
  ) => {
    if (
      offer.translations &&
      offer.translations[language] &&
      offer.translations[language][field]
    ) {
      return offer.translations[language][field]
    }
    return offer[field]
  }

  const handleSponsoredClick = (offer: TravelOffer) => {
    if (offer.isSponsored && offer.link && offer.link !== '#') {
      window.open(offer.link, '_blank')
      supabase
        .from('ad_campaigns')
        .select('clicks')
        .eq('id', offer.id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('ad_campaigns')
              .update({ clicks: (data.clicks || 0) + 1 })
              .eq('id', offer.id)
              .then()
          }
        })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {t('travel.experiences_section', 'Experiências')} &{' '}
            {t('travel.offers_section', 'Ofertas')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t(
              'hub.explore_opportunities_desc',
              'Encontre os melhores hotéis, aluguéis de carro e atividades exclusivas.',
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 bg-white border shadow-sm h-12 rounded-xl">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Globe className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">
              {t('hub.all_experiences', 'Todas')}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="hotel"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Hotel className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">
              {t('hub.hotels', 'Hotéis')}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="car_rental"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Car className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">{t('hub.cars', 'Carros')}</span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Ticket className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">
              {t('hub.activities', 'Atividades')}
            </span>
          </TabsTrigger>
        </TabsList>

        {(activeTab === 'hotel' || activeTab === 'all') && (
          <Card className="mb-6 border-slate-200 bg-slate-50 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Label className="font-semibold whitespace-nowrap text-slate-700">
                  {t('hub.guests_label', 'Hóspedes:')}
                </Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}{' '}
                        {n === 1
                          ? t('hub.person', 'Pessoa')
                          : t('hub.people', 'Pessoas')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {numGuests >= 4 && (
                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-lg border border-blue-100 shadow-sm animate-in fade-in zoom-in-95">
                  <Checkbox
                    id="privacy"
                    checked={requirePrivacy}
                    onCheckedChange={(c) => setRequirePrivacy(c === true)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor="privacy"
                    className="text-sm font-bold leading-none text-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                    {t(
                      'hub.require_privacy',
                      'Exigir Quartos Individuais (Privacidade)',
                    )}
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-500 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-lg font-medium text-slate-700 mb-2">
                {t('hub.no_offers', 'Nenhuma oferta encontrada')}
              </p>
              <p>
                {t(
                  'hub.try_adjusting_filters',
                  'Tente ajustar seus filtros ou mudar de categoria.',
                )}
              </p>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <Card
                key={offer.id}
                className={`overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group ${
                  offer.isSponsored
                    ? 'border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img
                    src={offer.image}
                    alt={getTranslated(offer, 'title')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    {offer.isSponsored ? (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500 text-white hover:bg-amber-600 border-none shadow-sm font-bold"
                      >
                        <Megaphone className="w-3 h-3 mr-1" />{' '}
                        {t('hub.sponsored', 'Patrocinado')}
                      </Badge>
                    ) : offer.source === 'partner' ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-600 text-white hover:bg-purple-700 border-none shadow-sm"
                      >
                        <Megaphone className="w-3 h-3 mr-1" />{' '}
                        {t('hub.partner', 'Parceiro')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-slate-700/80 text-white hover:bg-slate-800 border-none backdrop-blur-sm shadow-sm"
                      >
                        <Search className="w-3 h-3 mr-1" />{' '}
                        {t('hub.organic', 'Orgânico')}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    {offer.rating && offer.rating >= 4.8 && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm font-bold">
                        {t('marketing.unmissable_offer', 'Oferta Imperdível')}
                      </Badge>
                    )}
                    {offer.price && offer.price < 100 && !offer.isSponsored && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-white border-none shadow-sm font-bold">
                        {t('marketing.super_offer', 'Super Oferta')}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="bg-white/95 text-slate-900 px-2.5 py-1 rounded-md text-sm font-extrabold shadow-sm">
                      {offer.currency} {offer.price}
                    </div>
                    {offer.hasSeparatedRooms && (
                      <div className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                        <Users className="h-3 w-3" />{' '}
                        {t('hub.privacy', 'Privacidade')}
                      </div>
                    )}
                  </div>
                </div>
                <CardContent
                  className={`p-5 flex flex-col flex-1 ${offer.isSponsored ? 'bg-amber-50/10' : 'bg-white'}`}
                >
                  <div className="mb-2">
                    <p
                      className={`text-xs font-bold mb-1 uppercase tracking-wider ${offer.isSponsored ? 'text-amber-600' : 'text-primary'}`}
                    >
                      {offer.provider}
                    </p>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight line-clamp-1">
                      {getTranslated(offer, 'title')}
                    </h3>
                  </div>

                  {offer.type === 'hotel' && !offer.isSponsored && (
                    <div className="flex items-center gap-1.5 mt-1 mb-2 text-xs font-medium text-slate-600 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                      <Hotel className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {t('travel.room_type', 'Tipo de Quarto')}:{' '}
                        <strong className="text-slate-800">
                          {offer.roomTypeKey
                            ? t(offer.roomTypeKey)
                            : t('travel.standard_room', 'Quarto Padrão')}
                        </strong>
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 line-clamp-2 mb-5 flex-1 mt-1">
                    {getTranslated(offer, 'description')}
                  </p>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-5 bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />{' '}
                      {getTranslated(offer, 'destination')}
                    </span>
                    {offer.rating && (
                      <StarRating
                        rating={offer.rating}
                        size={3}
                        className="shrink-0"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button
                      variant={offer.isSponsored ? 'secondary' : 'outline'}
                      className="w-full font-bold shadow-sm text-xs px-2"
                      onClick={() => {
                        if (offer.isSponsored) {
                          handleSponsoredClick(offer)
                        } else {
                          setDetailsOffer(offer)
                        }
                      }}
                    >
                      {offer.isSponsored
                        ? t('hub.view_site', 'Ver Site')
                        : t('hub.view_details', 'Ver Detalhes')}
                    </Button>
                    <Button
                      className={`w-full font-bold shadow-sm text-xs px-2 ${offer.isSponsored ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                      onClick={() => {
                        if (offer.isSponsored) {
                          handleSponsoredClick(offer)
                        } else {
                          setBookingOffer(offer)
                        }
                      }}
                    >
                      {offer.isSponsored
                        ? t('hub.access_offer', 'Acessar Oferta')
                        : offer.type === 'hotel'
                          ? t('hub.book', 'Reservar')
                          : offer.type === 'car_rental'
                            ? t('hub.rent', 'Alugar')
                            : t('hub.buy', 'Comprar')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      <Dialog
        open={!!detailsOffer}
        onOpenChange={(open) => !open && setDetailsOffer(null)}
      >
        <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh]">
          <DialogTitle className="sr-only">
            {detailsOffer
              ? getTranslated(detailsOffer, 'title')
              : t('hub.view_details', 'Ver Detalhes')}
          </DialogTitle>
          {detailsOffer && (
            <>
              <DialogHeader>
                <h2 className="text-2xl font-extrabold text-slate-900 pr-6">
                  {getTranslated(detailsOffer, 'title')}
                </h2>
              </DialogHeader>
              <div className="relative h-56 w-full rounded-xl overflow-hidden mb-2 shadow-sm">
                <img
                  src={detailsOffer.image}
                  className="object-cover w-full h-full"
                  alt={getTranslated(detailsOffer, 'title')}
                />
                <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-md font-extrabold text-lg text-slate-900">
                  {detailsOffer.currency} {detailsOffer.price}
                </div>
              </div>
              <div className="space-y-5 py-2">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    {t('hub.about_offer', 'Sobre a Oferta')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {getTranslated(detailsOffer, 'description')}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                    {t('hub.promo_details', 'Detalhes da Promoção')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">
                        {t('hub.provider', 'Fornecedor')}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {detailsOffer.provider}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs mb-0.5">
                        {t('hub.destination', 'Destino')}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {getTranslated(detailsOffer, 'destination')}
                      </span>
                    </div>
                    {detailsOffer.type === 'hotel' && (
                      <div>
                        <span className="text-slate-500 block text-xs mb-0.5">
                          {t('travel.room_type', 'Tipo de Quarto')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {detailsOffer.roomTypeKey
                            ? t(detailsOffer.roomTypeKey)
                            : t('travel.standard_room', 'Quarto Padrão')}
                        </span>
                      </div>
                    )}
                    {detailsOffer.rating && (
                      <div>
                        <span className="text-slate-500 block text-xs mb-0.5">
                          {t('hub.rating', 'Avaliação')}
                        </span>
                        <StarRating rating={detailsOffer.rating} size={4} />
                      </div>
                    )}
                    {detailsOffer.hasSeparatedRooms && (
                      <div className="sm:col-span-2">
                        <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />{' '}
                          {t(
                            'hub.privacy_guaranteed_full',
                            'Privacidade Garantida / Quartos Individuais',
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setDetailsOffer(null)}
                >
                  {t('hub.back', 'Voltar')}
                </Button>
                <Button asChild className="w-full sm:w-auto gap-2 bg-primary">
                  <a
                    href={detailsOffer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('hub.visit_site', 'Visitar Site')}{' '}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bookingOffer}
        onOpenChange={(open) => !open && setBookingOffer(null)}
      >
        <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
          <DialogTitle className="sr-only">
            {bookingOffer
              ? getTranslated(bookingOffer, 'title')
              : t('hub.book', 'Reservar')}
          </DialogTitle>
          {bookingOffer && (
            <BookingForm
              offer={bookingOffer}
              type={
                bookingOffer.type === 'hotel'
                  ? 'hotel'
                  : bookingOffer.type === 'car_rental'
                    ? 'car'
                    : 'ticket'
              }
              requirePrivacy={requirePrivacy && numGuests >= 4}
              onSuccess={() => {
                setBookingOffer(null)
                if (onBookingSuccess) onBookingSuccess()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
