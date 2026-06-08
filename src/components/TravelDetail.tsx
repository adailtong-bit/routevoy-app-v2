import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO, eachDayOfInterval } from 'date-fns'
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
  Plus,
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
  const [draggingId, setDraggingId] = useState<string | null>(null)

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
        const [promos, coupons, ads] = await Promise.all([
          supabase.from('discovered_promotions').select('*').in('id', refIds),
          supabase.from('coupons').select('*').in('id', refIds),
          supabase.from('ad_campaigns').select('*').in('id', refIds),
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
        ads.data?.forEach((a) => {
          refs[a.id] = {
            ...a,
            title: a.title,
            storeName: 'Partner',
            image: a.image,
            category: a.category,
            address: '',
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

  const handleMoveItem = async (itemId: string, targetDateKey: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const isUnscheduled = targetDateKey === 'Unscheduled'

    let newStartTime = null
    let newEndTime = null

    if (!isUnscheduled) {
      let originalTime = '10:00:00Z'
      if (item.start_time) {
        const parts = item.start_time.split('T')
        if (parts.length === 2) originalTime = parts[1]
      }
      newStartTime = `${targetDateKey}T${originalTime}`

      if (item.start_time && item.end_time) {
        const duration =
          new Date(item.end_time).getTime() -
          new Date(item.start_time).getTime()
        newEndTime = new Date(
          new Date(newStartTime).getTime() + duration,
        ).toISOString()
      } else {
        newEndTime = new Date(
          new Date(newStartTime).getTime() + 60 * 60 * 1000,
        ).toISOString()
      }
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, start_time: newStartTime, end_time: newEndTime }
          : i,
      ),
    )

    try {
      await itineraryService.updateItem(itemId, {
        start_time: newStartTime,
        end_time: newEndTime,
      })
      toast.success(t('travel.item_moved', 'Activity rescheduled successfully'))
    } catch (err: any) {
      toast.error(err.message)
      fetchTripData()
    }
  }

  const tripDays = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return []
    try {
      const s = parseISO(trip.start_date)
      const e = parseISO(trip.end_date)
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return []
      return eachDayOfInterval({ start: s, end: e })
    } catch {
      return []
    }
  }, [trip])

  const groupedItems = useMemo(() => {
    const groups: Record<string, ItineraryItem[]> = {}

    tripDays.forEach((day) => {
      groups[format(day, 'yyyy-MM-dd')] = []
    })
    groups['Unscheduled'] = []

    const sorted = [...items].sort((a, b) => {
      const timeA =
        a.start_time && !isNaN(new Date(a.start_time).getTime())
          ? new Date(a.start_time).getTime()
          : Infinity
      const timeB =
        b.start_time && !isNaN(new Date(b.start_time).getTime())
          ? new Date(b.start_time).getTime()
          : Infinity
      return timeA - timeB
    })

    sorted.forEach((item) => {
      const validDate =
        item.start_time && !isNaN(new Date(item.start_time).getTime())
      const dateKey = validDate
        ? format(parseISO(item.start_time as string), 'yyyy-MM-dd')
        : 'Unscheduled'

      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(item)
    })
    return groups
  }, [items, tripDays])

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
              {trip.start_date &&
                !isNaN(new Date(trip.start_date).getTime()) && (
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
          <AddItineraryItemSheet itinerary={trip} onAdded={fetchTripData} />
        </div>

        {tripDays.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-4">
            <Calendar className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">
                {t('travel.no_dates', 'Trip Dates Not Set')}
              </h4>
              <p className="text-sm text-amber-700">
                {t(
                  'travel.no_dates_desc',
                  'Set start and end dates to organize your itinerary day by day.',
                )}
              </p>
            </div>
          </div>
        )}

        {tripDays.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none sticky top-[60px] sm:top-[68px] z-20 bg-slate-50 pt-3 px-4 -mx-4 sm:mx-0 sm:px-0">
            {tripDays.map((day, idx) => {
              const dKey = format(day, 'yyyy-MM-dd')
              return (
                <Button
                  key={dKey}
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full bg-white shadow-sm hover:border-primary hover:text-primary transition-colors"
                  onClick={() => {
                    const el = document.getElementById(`day-${dKey}`)
                    if (el) {
                      const y =
                        el.getBoundingClientRect().top + window.scrollY - 130
                      window.scrollTo({ top: y, behavior: 'smooth' })
                    }
                  }}
                >
                  {t('travel.day', 'Day')} {idx + 1} - {format(day, 'MMM do')}
                </Button>
              )
            })}
            {groupedItems['Unscheduled']?.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full bg-white shadow-sm border-dashed border-slate-300 text-slate-600 hover:border-primary hover:text-primary transition-colors"
                onClick={() => {
                  const el = document.getElementById(`day-Unscheduled`)
                  if (el) {
                    const y =
                      el.getBoundingClientRect().top + window.scrollY - 130
                    window.scrollTo({ top: y, behavior: 'smooth' })
                  }
                }}
              >
                {t('travel.unscheduled', 'Unscheduled')} (
                {groupedItems['Unscheduled'].length})
              </Button>
            )}
          </div>
        )}

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
            <AddItineraryItemSheet itinerary={trip} onAdded={fetchTripData} />
          </div>
        ) : (
          <div className="space-y-10 mt-6">
            {Object.keys(groupedItems)
              .sort((a, b) => {
                if (a === 'Unscheduled') return 1
                if (b === 'Unscheduled') return -1
                return a.localeCompare(b)
              })
              .map((dateKey) => {
                const isUnscheduled = dateKey === 'Unscheduled'
                const dayItems = groupedItems[dateKey]
                const dayIndex = tripDays.findIndex(
                  (d) => format(d, 'yyyy-MM-dd') === dateKey,
                )

                if (isUnscheduled && dayItems.length === 0) return null

                return (
                  <div
                    key={dateKey}
                    className="relative rounded-2xl transition-colors min-h-[100px] border-2 border-transparent data-[drag-over=true]:border-primary/50 data-[drag-over=true]:bg-primary/5 p-2 -mx-2"
                    id={`day-${dateKey}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.setAttribute('data-drag-over', 'true')
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.removeAttribute('data-drag-over')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.removeAttribute('data-drag-over')
                      const itemId = e.dataTransfer.getData('itemId')
                      if (itemId) handleMoveItem(itemId, dateKey)
                    }}
                  >
                    <div className="sticky top-[105px] sm:top-[115px] z-10 bg-slate-50/95 backdrop-blur-sm py-3 mb-4 -mx-2 px-2 sm:mx-0 sm:px-0 flex items-center justify-between rounded-t-xl">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {isUnscheduled
                          ? t('travel.unscheduled', 'Unscheduled')
                          : `${t('travel.day', 'Day')} ${dayIndex + 1} - ${format(parseISO(dateKey), 'EEEE, MMM do')}`}
                      </h3>
                      {!isUnscheduled && (
                        <AddItineraryItemSheet
                          itinerary={trip}
                          initialDate={dateKey}
                          onAdded={fetchTripData}
                          triggerComponent={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full px-3"
                            >
                              <Plus className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                {t('common.add', 'Add')}
                              </span>
                            </Button>
                          }
                        />
                      )}
                    </div>

                    {dayItems.length === 0 ? (
                      <div className="border-l-2 border-slate-200 pl-4 sm:pl-6 ml-2 sm:ml-4 py-8 bg-slate-50/50 rounded-r-2xl text-slate-400 italic flex items-center justify-center border-dashed">
                        {t(
                          'travel.no_activities_day',
                          'No activities planned for this day.',
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 border-l-2 border-slate-200 pl-4 sm:pl-6 ml-2 sm:ml-4">
                        {dayItems.map((item) => {
                          const ref = item.reference_id
                            ? references[item.reference_id]
                            : null
                          const navUrl = item.address
                            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`
                            : ''

                          const isValidTime =
                            item.start_time &&
                            !isNaN(new Date(item.start_time).getTime())
                          const mockTimeStr = isValidTime
                            ? format(
                                parseISO(item.start_time as string),
                                'HH:mm',
                              )
                            : ''

                          if (
                            [
                              'coupon',
                              'hotel',
                              'car_rental',
                              'museum',
                            ].includes(item.type) &&
                            ref
                          ) {
                            return (
                              <div
                                key={item.id}
                                className="relative group cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('itemId', item.id)
                                  setDraggingId(item.id)
                                }}
                                onDragEnd={() => setDraggingId(null)}
                                style={{
                                  opacity: draggingId === item.id ? 0.5 : 1,
                                }}
                              >
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
                                  mockTime={mockTimeStr}
                                  onRemove={() => handleDeleteItem(item.id)}
                                  isShopping={item.type === 'coupon'}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 border shadow-sm"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Edit2 className="h-4 w-4 text-slate-600" />
                                </Button>
                                {isUnscheduled && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full border-dashed text-primary hover:bg-primary/5 bg-white"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />{' '}
                                    {t(
                                      'travel.schedule_item',
                                      'Schedule Date & Time',
                                    )}
                                  </Button>
                                )}
                              </div>
                            )
                          }

                          return (
                            <div
                              key={item.id}
                              className="relative group cursor-grab active:cursor-grabbing"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('itemId', item.id)
                                setDraggingId(item.id)
                              }}
                              onDragEnd={() => setDraggingId(null)}
                              style={{
                                opacity: draggingId === item.id ? 0.5 : 1,
                              }}
                            >
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
                                    {mockTimeStr || '--:--'}
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
                                        ? t(
                                            'travel.hotel_label',
                                            'Accommodation',
                                          )
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
                                              ? t(
                                                  'travel.coupon_label',
                                                  'Coupon',
                                                )
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
                                        <Navigation className="h-3 w-3" />{' '}
                                        Navigate
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
                                    className="h-8 w-8 text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {isUnscheduled && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 w-full border-dashed text-primary hover:bg-primary/5 bg-white"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />{' '}
                                  {t(
                                    'travel.schedule_item',
                                    'Schedule Date & Time',
                                  )}
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <EditItineraryItemSheet
        item={editingItem}
        itinerary={trip}
        open={!!editingItem}
        onOpenChange={(val) => !val && setEditingItem(null)}
        onUpdated={fetchTripData}
      />
    </div>
  )
}
