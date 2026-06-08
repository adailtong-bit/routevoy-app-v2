import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Trash2,
  Calendar,
  MapPin,
  Hotel,
  Map,
  Info,
  Navigation,
  Edit2,
  Car,
  Landmark,
  Ticket,
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
import { AddItineraryItemSheet } from './AddItineraryItemSheet'
import { EditItineraryItemSheet } from './EditItineraryItemSheet'

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
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)

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
            ...p,
            title: p.title,
            storeName: p.store_name,
            image: p.image_url,
            address: '',
          }
        })
        coupons.data?.forEach((c) => {
          refs[c.id] = {
            ...c,
            title: c.title,
            storeName: c.store_name,
            image: c.image_url,
            address: c.location_name,
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

  const groupedItems = useMemo(() => {
    const groups: Record<string, ItineraryItem[]> = {}
    const sorted = [...items].sort((a, b) => {
      const timeA = a.start_time ? new Date(a.start_time).getTime() : Infinity
      const timeB = b.start_time ? new Date(b.start_time).getTime() : Infinity
      return timeA - timeB
    })

    sorted.forEach((item) => {
      const dateKey = item.start_time
        ? format(parseISO(item.start_time), 'yyyy-MM-dd')
        : 'Unscheduled'
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(item)
    })
    return groups
  }, [items])

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border shadow-sm">
          <Info className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p>{error || 'Not found'}</p>
          <Button onClick={handleBack} className="mt-4">
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-20">
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-3">
            <ArrowLeft className="h-4 w-4" /> {t('common.back', 'Back')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={handleDeleteTrip}
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t('common.delete', 'Delete')}
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
                className="cursor-pointer text-slate-500 hover:text-slate-900 text-sm"
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
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
              {trip.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-slate-600">
              {trip.destination && (
                <span className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full">
                  <MapPin className="h-4 w-4 text-orange-500" />{' '}
                  {trip.destination}
                </span>
              )}
              {trip.start_date && (
                <span className="flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />{' '}
                  {format(parseISO(trip.start_date), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
            {trip.description && (
              <p className="text-slate-600 mt-4">{trip.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {t('travel.itinerary', 'Itinerary')}
          </h2>
          <AddItineraryItemSheet itineraryId={tripId} onAdded={fetchTripData} />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white shadow-sm border rounded-3xl">
            <Map className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {t('travel.no_items', 'No activities yet')}
            </h3>
            <p className="text-slate-500 mb-6">
              {t(
                'travel.empty_desc',
                'Start organizing your trip by adding activities and offers.',
              )}
            </p>
            <AddItineraryItemSheet
              itineraryId={tripId}
              onAdded={fetchTripData}
            />
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(groupedItems)
              .sort()
              .map((dateKey) => (
                <div key={dateKey} className="relative">
                  <div className="sticky top-16 z-10 bg-slate-50/90 backdrop-blur-sm py-2 mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {dateKey === 'Unscheduled'
                        ? t('travel.unscheduled', 'Unscheduled')
                        : format(parseISO(dateKey), 'EEEE, MMM do')}
                    </h3>
                  </div>
                  <div className="space-y-4 border-l-2 border-slate-200 pl-4 sm:pl-6 ml-2 sm:ml-4">
                    {groupedItems[dateKey].map((item) => {
                      const ref = item.reference_id
                        ? references[item.reference_id]
                        : null
                      const navUrl = item.address
                        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`
                        : ''

                      if (
                        ['coupon', 'hotel', 'car_rental', 'museum'].includes(
                          item.type,
                        ) &&
                        ref
                      ) {
                        return (
                          <div key={item.id} className="relative group">
                            <div
                              className={`absolute -left-[25px] sm:-left-[33px] top-8 w-4 h-4 rounded-full border-4 border-slate-50 ${
                                item.type === 'hotel'
                                  ? 'bg-blue-500'
                                  : item.type === 'car_rental'
                                    ? 'bg-green-500'
                                    : item.type === 'museum'
                                      ? 'bg-purple-500'
                                      : item.type === 'coupon'
                                        ? 'bg-pink-500'
                                        : 'bg-orange-500'
                              }`}
                            />
                            <TravelActivityCard
                              stop={{
                                ...ref,
                                address: item.address || ref.address,
                              }}
                              dayId={item.itinerary_id}
                              mockTime={
                                item.start_time
                                  ? format(parseISO(item.start_time), 'HH:mm')
                                  : ''
                              }
                              onRemove={() => handleDeleteItem(item.id)}
                              isShopping={item.type === 'coupon'}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 border"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit2 className="h-4 w-4 text-slate-600" />
                            </Button>
                          </div>
                        )
                      }

                      return (
                        <div key={item.id} className="relative group">
                          <div
                            className={`absolute -left-[25px] sm:-left-[33px] top-8 w-4 h-4 rounded-full border-4 border-slate-50 ${
                              item.type === 'hotel'
                                ? 'bg-blue-500'
                                : item.type === 'car_rental'
                                  ? 'bg-green-500'
                                  : item.type === 'museum'
                                    ? 'bg-purple-500'
                                    : item.type === 'coupon'
                                      ? 'bg-pink-500'
                                      : 'bg-orange-500'
                            }`}
                          />
                          <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row gap-4 sm:items-center">
                            <div className="w-16 shrink-0 pt-1 hidden sm:block">
                              <span className="text-sm font-bold text-slate-700">
                                {item.start_time
                                  ? format(parseISO(item.start_time), 'HH:mm')
                                  : '--:--'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {item.type === 'hotel' ? (
                                  <Hotel className="h-4 w-4 text-blue-500" />
                                ) : item.type === 'car_rental' ? (
                                  <Car className="h-4 w-4 text-green-500" />
                                ) : item.type === 'museum' ? (
                                  <Landmark className="h-4 w-4 text-purple-500" />
                                ) : item.type === 'coupon' ? (
                                  <Ticket className="h-4 w-4 text-pink-500" />
                                ) : (
                                  <Map className="h-4 w-4 text-orange-500" />
                                )}
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  {item.type === 'hotel'
                                    ? t('travel.hotel_label', 'Accommodation')
                                    : item.type === 'car_rental'
                                      ? t(
                                          'travel.car_rental_label',
                                          'Aluguel de Carro',
                                        )
                                      : item.type === 'museum'
                                        ? t(
                                            'travel.museum_label',
                                            'Museu/Atração',
                                          )
                                        : item.type === 'coupon'
                                          ? t('travel.coupon_label', 'Coupon')
                                          : t(
                                              'travel.activity_label',
                                              'Activity',
                                            )}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 pr-16">
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
                            <div className="absolute top-4 right-4 flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <EditItineraryItemSheet
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(val) => !val && setEditingItem(null)}
        onUpdated={fetchTripData}
      />
    </div>
  )
}
