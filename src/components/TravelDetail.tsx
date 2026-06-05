import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Trash2,
  Calendar,
  MapPin,
  Plus,
  Hotel,
  Map,
  Ticket,
  Clock,
  Info,
  Navigation,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  itineraryService,
  ItineraryItem,
  Itinerary,
} from '@/services/itinerary'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { TravelActivityCard } from './TravelActivityCard'

function AddItemDialog({
  itineraryId,
  onAdded,
}: {
  itineraryId: string
  onAdded: () => void
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'hotel' | 'activity' | 'coupon'>('activity')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [referenceId, setReferenceId] = useState('none')

  const [offers, setOffers] = useState<any[]>([])

  useEffect(() => {
    if (type === 'coupon' && open) {
      Promise.all([
        supabase
          .from('discovered_promotions')
          .select('id, title, store_name, product_link')
          .limit(50),
        supabase
          .from('coupons')
          .select('id, title, store_name, location_name')
          .limit(50),
      ]).then(([promos, coupons]) => {
        const combined = [
          ...(promos.data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            store: p.store_name,
            address: '',
          })),
          ...(coupons.data || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            store: c.store_name,
            address: c.location_name || '',
          })),
        ]
        setOffers(combined)
      })
    }
  }, [type, open])

  const handleOfferChange = (val: string) => {
    setReferenceId(val)
    if (val !== 'none') {
      const offer = offers.find((o) => o.id === val)
      if (offer) {
        if (!title) setTitle(offer.title || offer.store || '')
        if (!address && offer.address) setAddress(offer.address)
      }
    }
  }

  const handleSave = async () => {
    if (!title && type !== 'coupon') {
      toast.error(t('travel.title_required', 'Title is required'))
      return
    }

    try {
      let finalTitle = title
      if (type === 'coupon' && referenceId !== 'none') {
        const offer = offers.find((o) => o.id === referenceId)
        if (offer) {
          finalTitle = title || offer.title
        }
      }

      await itineraryService.addItem({
        itinerary_id: itineraryId,
        type,
        title: finalTitle || 'New Item',
        description,
        address,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        reference_id: referenceId === 'none' ? null : referenceId,
      })
      toast.success(t('travel.item_added', 'Item added successfully'))
      setOpen(false)
      setTitle('')
      setDescription('')
      setAddress('')
      setStartTime('')
      setEndTime('')
      setReferenceId('none')
      onAdded()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {t('travel.add_to_trip', 'Add to Trip')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('travel.add_experience_item', 'Add Experience Item')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('travel.type', 'Type')}</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">
                  {t('travel.activity', 'Activity / Attraction')}
                </SelectItem>
                <SelectItem value="hotel">
                  {t('travel.hotel', 'Accommodation / Hotel')}
                </SelectItem>
                <SelectItem value="coupon">
                  {t('travel.coupon', 'Shopping / Offer')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'coupon' && (
            <div className="space-y-2">
              <Label>
                {t('travel.select_promotion', 'Select Offer/Coupon')}
              </Label>
              <Select value={referenceId} onValueChange={handleOfferChange}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'travel.select_promotion_ph',
                      'Select a promotion',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('travel.custom_promotion', 'Custom / Search later')}
                  </SelectItem>
                  {offers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title.length > 40
                        ? p.title.substring(0, 40) + '...'
                        : p.title}{' '}
                      ({p.store})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('travel.title', 'Title')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'coupon'
                  ? t(
                      'travel.optional_if_promo',
                      'Optional if promotion selected',
                    )
                  : t('travel.eg_visit_museum', 'E.g. Visit Museum')
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t('travel.address', 'Address / Location')}</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t(
                'travel.address_placeholder',
                'E.g. 123 Main St...',
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('travel.description', 'Description')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                'travel.notes_placeholder',
                'Notes, booking references, etc.',
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('travel.start_time', 'Start Time')}</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('travel.end_time', 'End Time')}</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common.save', 'Save Item')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TravelDetail({
  tripId: propTripId,
  onBack: propOnBack,
}: {
  tripId?: string
  onBack?: () => void
}) {
  const { id: urlId } = useParams<{ id: string }>()
  const tripId = propTripId || urlId || ''
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [trip, setTrip] = useState<Itinerary | null>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [references, setReferences] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTripData = async () => {
    try {
      setIsLoading(true)
      const { data: userAuth } = await supabase.auth.getUser()
      if (!userAuth.user) throw new Error('Not authenticated')

      const { data: tData, error: tErr } = await supabase
        .from('itineraries' as any)
        .select('*')
        .eq('id', tripId)
        .eq('user_id', userAuth.user.id)
        .single()
      if (tErr) throw tErr
      setTrip(tData)

      const iData = await itineraryService.getItems(tripId)
      setItems(iData)

      const refIds = iData
        .filter((i) => i.reference_id)
        .map((i) => i.reference_id as string)
      if (refIds.length > 0) {
        const [promos, coupons] = await Promise.all([
          supabase.from('discovered_promotions').select('*').in('id', refIds),
          supabase.from('coupons').select('*').in('id', refIds),
        ])

        const refs: Record<string, any> = {}
        promos.data?.forEach((p) => {
          refs[p.id] = {
            id: p.id,
            title: p.title,
            storeName: p.store_name,
            description: p.description,
            image: p.image_url,
            category: p.category,
            code: p.code,
            address: '',
            coordinates: { lat: 0, lng: 0 },
            externalUrl: p.product_link,
          }
        })
        coupons.data?.forEach((c) => {
          refs[c.id] = {
            id: c.id,
            title: c.title,
            storeName: c.store_name,
            description: c.description,
            image: c.image_url,
            category: c.category,
            code: c.code,
            address: c.location_name,
            coordinates: { lat: c.latitude || 0, lng: c.longitude || 0 },
          }
        })
        setReferences(refs)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tripId) fetchTripData()
  }, [tripId])

  const handleBack = () => {
    if (propOnBack) propOnBack()
    else navigate('/travel')
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await itineraryService.deleteItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      toast.success(t('travel.item_removed', 'Item removed'))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDeleteTrip = async () => {
    if (
      confirm(
        t(
          'travel.confirm_delete_trip',
          'Are you sure you want to delete this trip?',
        ),
      )
    ) {
      try {
        await itineraryService.delete(tripId)
        toast.success(t('travel.trip_deleted', 'Trip deleted'))
        handleBack()
      } catch (err: any) {
        toast.error(err.message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border">
          <Info className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {t('travel.error', 'Oops, something went wrong')}
          </h2>
          <p className="text-slate-500 mb-6">
            {error || 'Itinerary not found'}
          </p>
          <Button onClick={handleBack} variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" />{' '}
            {t('travel.back_to_list', 'Back to Itineraries')}
          </Button>
        </div>
      </div>
    )
  }

  const formattedStartDate = trip.start_date
    ? format(parseISO(trip.start_date), 'MMM dd, yyyy')
    : null
  const formattedEndDate = trip.end_date
    ? format(parseISO(trip.end_date), 'MMM dd, yyyy')
    : null

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-20">
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 -ml-3 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />{' '}
            {t('travel.back_to_trips', 'Back to Trips')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleDeleteTrip}
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t('common.delete', 'Delete Trip')}
            </span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <Breadcrumb className="mb-6 hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <div
                onClick={handleBack}
                className="cursor-pointer text-slate-500 hover:text-slate-900 transition-colors text-sm"
              >
                {t('travel.my_trips', 'My Trips')}
              </div>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t('travel.travel_itinerary', 'Trip Itinerary')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border space-y-8 mb-8">
          <div className="space-y-4 text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              {trip.title}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-slate-600 font-medium pt-2">
              {trip.destination && (
                <span className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full">
                  <MapPin className="h-4 w-4 text-orange-500" />{' '}
                  {trip.destination}
                </span>
              )}
              {(formattedStartDate || formattedEndDate) && (
                <span className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formattedStartDate || '?'}{' '}
                  {formattedEndDate ? `- ${formattedEndDate}` : ''}
                </span>
              )}
            </div>
            {trip.description && (
              <p className="text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap mt-4">
                {trip.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {t('travel.experience_management', 'Experience Management')}
          </h2>
          <AddItemDialog itineraryId={tripId} onAdded={fetchTripData} />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white shadow-sm border rounded-3xl">
            <Map className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {t('travel.no_activities_yet', 'No activities yet')}
            </h3>
            <p className="text-slate-500 mb-6">
              {t(
                'travel.empty_trip_desc',
                "You haven't added any activities to your trip yet. Start by adding a hotel or a promotion!",
              )}
            </p>
            <AddItemDialog itineraryId={tripId} onAdded={fetchTripData} />
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const ref = item.reference_id
                ? references[item.reference_id]
                : null

              if (item.type === 'coupon' && ref) {
                return (
                  <TravelActivityCard
                    key={item.id}
                    stop={{ ...ref, address: item.address || ref.address }}
                    dayId={item.itinerary_id}
                    mockTime={
                      item.start_time
                        ? format(parseISO(item.start_time), 'MMM dd, HH:mm')
                        : ''
                    }
                    onRemove={() => handleDeleteItem(item.id)}
                    isShopping={true}
                  />
                )
              }

              const navUrl = item.address
                ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`
                : ''

              return (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row gap-4 sm:items-center relative group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'hotel' && (
                        <Hotel className="h-4 w-4 text-blue-500" />
                      )}
                      {item.type === 'activity' && (
                        <Map className="h-4 w-4 text-orange-500" />
                      )}
                      {item.type === 'coupon' && (
                        <Ticket className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {item.type === 'hotel'
                          ? 'Accommodation'
                          : item.type === 'activity'
                            ? 'Attraction'
                            : 'Offer'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 pr-10">
                      {item.title}
                    </h3>
                    {item.address && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.address}
                        <a
                          href={navUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          <Navigation className="h-3 w-3" /> Navigate
                        </a>
                      </div>
                    )}
                    {item.description && (
                      <p className="text-slate-600 text-sm mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right shrink-0 flex sm:flex-col gap-4 sm:gap-1 text-sm text-slate-500 items-center sm:items-end mr-6 sm:mr-8 mt-2 sm:mt-0">
                    {item.start_time && (
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {format(parseISO(item.start_time), 'MMM dd, HH:mm')}
                      </div>
                    )}
                    {item.end_time && (
                      <div className="flex items-center gap-1.5 text-xs mt-1 sm:mt-0 font-medium">
                        to {format(parseISO(item.end_time), 'HH:mm')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
