import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Plus,
  Store,
  Ticket,
  Car,
  Hotel,
  CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'
import { itineraryService, Itinerary } from '@/services/itinerary'
import { format, parseISO } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddItineraryItemSheetProps {
  itinerary: Itinerary
  initialDate?: string
  triggerComponent?: React.ReactNode
  onAdded: () => void
}

export function AddItineraryItemSheet({
  itinerary,
  initialDate,
  triggerComponent,
  onAdded,
}: AddItineraryItemSheetProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [offers, setOffers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('offers')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [type, setType] = useState<
    'hotel' | 'activity' | 'coupon' | 'car_rental' | 'museum'
  >('activity')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [referenceId, setReferenceId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (activeTab === 'offers') {
        fetchOffers()
      }
      if (initialDate && initialDate !== 'Unscheduled') {
        setStartTime(`${initialDate}T10:00`)
        setEndTime(`${initialDate}T11:00`)
      }
    }
  }, [open, activeTab, initialDate])

  const fetchOffers = async () => {
    const [promos, coupons, ads] = await Promise.all([
      supabase
        .from('discovered_promotions')
        .select('id, title, store_name, product_link, category')
        .limit(50),
      supabase
        .from('coupons')
        .select('id, title, store_name, location_name, category')
        .limit(50),
      supabase
        .from('ad_campaigns')
        .select('id, title, company_id, category, image')
        .in('status', ['active', 'approved', 'published'])
        .limit(50),
    ])

    const combined = [
      ...(promos.data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        store: p.store_name,
        address: '',
        category: p.category,
        source: 'promo',
      })),
      ...(coupons.data || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        store: c.store_name,
        address: c.location_name || '',
        category: c.category || 'coupon',
        source: 'coupon',
      })),
      ...(ads.data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        store: 'Partner',
        address: '',
        category: a.category || 'ad',
        image: a.image,
        source: 'ad',
      })),
    ]
    setOffers(combined)
  }

  const handleSelectOffer = (offer: any) => {
    let inferredType:
      | 'hotel'
      | 'activity'
      | 'coupon'
      | 'car_rental'
      | 'museum' = 'coupon'

    const cat = offer.category?.toLowerCase() || ''
    if (cat.includes('hotel') || cat.includes('accommodation'))
      inferredType = 'hotel'
    else if (
      cat.includes('car_rental') ||
      cat.includes('car') ||
      cat.includes('transport')
    )
      inferredType = 'car_rental'
    else if (cat.includes('museum') || cat.includes('museu'))
      inferredType = 'museum'
    else if (cat.includes('activity') || cat.includes('atra'))
      inferredType = 'activity'

    setType(inferredType)
    setTitle(offer.title)
    setAddress(offer.address)
    setReferenceId(offer.id)
    setStep('form')
  }

  const handleCustom = () => {
    setReferenceId(null)
    setStep('form')
  }

  const resetForm = () => {
    setStep('select')
    setType('activity')
    setTitle('')
    setDescription('')
    setAddress('')
    setStartTime(
      initialDate && initialDate !== 'Unscheduled'
        ? `${initialDate}T10:00`
        : '',
    )
    setEndTime(
      initialDate && initialDate !== 'Unscheduled'
        ? `${initialDate}T11:00`
        : '',
    )
    setReferenceId(null)
  }

  const handleSave = async () => {
    if (!title) {
      toast.error(t('travel.title_required', 'Title is required'))
      return
    }

    try {
      await itineraryService.addItem({
        itinerary_id: itinerary.id,
        type,
        title,
        description,
        address,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        reference_id: referenceId,
      })
      toast.success(t('travel.item_added', 'Item added successfully'))
      setOpen(false)
      resetForm()
      onAdded()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const hasValidDates =
    itinerary.start_date &&
    !isNaN(new Date(itinerary.start_date).getTime()) &&
    itinerary.end_date &&
    !isNaN(new Date(itinerary.end_date).getTime())

  const minDateTime = hasValidDates
    ? format(parseISO(itinerary.start_date!), "yyyy-MM-dd'T'00:00")
    : undefined
  const maxDateTime = hasValidDates
    ? format(parseISO(itinerary.end_date!), "yyyy-MM-dd'T'23:59")
    : undefined

  const filteredOffers = offers.filter((o) => {
    const matchesQuery =
      o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.store?.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesQuery) return false

    const cat = o.category?.toLowerCase() || ''

    const isHotel =
      cat.match(/\b(hotel|accommodation|hospedagem|pousada|resort)\b/) !== null
    const isCarRental =
      cat.match(
        /\b(car|cars|transport|aluguel|veículo|rent|rental|transportation)\b/,
      ) !== null
    const isMuseum =
      cat.match(/\b(museum|museu|art|culture|gallery)\b/) !== null

    if (categoryFilter === 'all') return true
    if (categoryFilter === 'hotel' && isHotel) return true
    if (categoryFilter === 'car_rental' && isCarRental) return true
    if (categoryFilter === 'museum' && isMuseum) return true
    if (categoryFilter === 'coupon' && !isHotel && !isCarRental && !isMuseum)
      return true

    return false
  })

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
      }}
    >
      <SheetTrigger asChild>
        {triggerComponent || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />{' '}
            {t('travel.add_to_trip', 'Add to Trip')}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-white">
          <SheetTitle>
            {t('travel.add_experience_item', 'Add Itinerary Item')}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Add items to your trip
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          {step === 'select' ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <div className="px-6 pt-4 bg-white">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="offers">
                    {t('travel.offers', 'Library')}
                  </TabsTrigger>
                  <TabsTrigger value="custom">
                    {t('travel.custom', 'Custom')}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="offers"
                className="flex-1 overflow-hidden flex flex-col mt-0"
              >
                <div className="p-6 pb-2">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder={t(
                          'travel.search_offers',
                          'Search coupons and offers...',
                        )}
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      <Button
                        variant={
                          categoryFilter === 'all' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="h-8 rounded-full whitespace-nowrap"
                        onClick={() => setCategoryFilter('all')}
                      >
                        {t('common.all', 'All')}
                      </Button>
                      <Button
                        variant={
                          categoryFilter === 'hotel' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="h-8 rounded-full whitespace-nowrap"
                        onClick={() => setCategoryFilter('hotel')}
                      >
                        {t('travel.hotel', 'Hotel')}
                      </Button>
                      <Button
                        variant={
                          categoryFilter === 'car_rental'
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="h-8 rounded-full whitespace-nowrap"
                        onClick={() => setCategoryFilter('car_rental')}
                      >
                        {t('travel.car', 'Car Rental')}
                      </Button>
                      <Button
                        variant={
                          categoryFilter === 'museum' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="h-8 rounded-full whitespace-nowrap"
                        onClick={() => setCategoryFilter('museum')}
                      >
                        {t('travel.museum', 'Museum')}
                      </Button>
                      <Button
                        variant={
                          categoryFilter === 'coupon' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="h-8 rounded-full whitespace-nowrap"
                        onClick={() => setCategoryFilter('coupon')}
                      >
                        {t('travel.coupon', 'Coupon')}
                      </Button>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-3 pb-6">
                    {filteredOffers.map((offer) => {
                      const isCar =
                        offer.category?.toLowerCase().includes('car') ||
                        offer.category?.toLowerCase().includes('transport')
                      const isHotel = offer.category
                        ?.toLowerCase()
                        .includes('hotel')
                      const Icon = isCar ? Car : isHotel ? Hotel : Ticket

                      return (
                        <div
                          key={offer.id}
                          className="border bg-white rounded-xl overflow-hidden hover:border-primary hover:shadow-sm cursor-pointer transition-all flex h-24"
                          onClick={() => handleSelectOffer(offer)}
                        >
                          {offer.image ? (
                            <div className="w-24 shrink-0 bg-slate-100">
                              <img
                                src={offer.image}
                                alt={offer.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-24 shrink-0 bg-primary/5 flex items-center justify-center text-primary">
                              <Icon className="h-8 w-8 opacity-50" />
                            </div>
                          )}
                          <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                            <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-tight">
                              {offer.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                              <Store className="h-3 w-3 shrink-0" />{' '}
                              <span className="truncate">{offer.store}</span>
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {filteredOffers.length === 0 && (
                      <p className="text-center text-slate-500 py-8">
                        {t('common.no_results', 'No results found')}
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="custom" className="flex-1 p-6 mt-0">
                <div className="text-center py-10 bg-white rounded-xl border border-dashed">
                  <p className="text-slate-600 mb-6 px-4">
                    {t(
                      'travel.custom_desc',
                      'Add a custom activity, hotel, or flight to your itinerary.',
                    )}
                  </p>
                  <Button onClick={handleCustom} size="lg">
                    {t('travel.create_custom', 'Create Custom Item')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 pb-6">
                {!referenceId && (
                  <div className="space-y-2">
                    <Label>{t('travel.type', 'Type')}</Label>
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activity">
                          {t('travel.activity', 'Activity / Attraction')}
                        </SelectItem>
                        <SelectItem value="hotel">
                          {t('travel.hotel', 'Accommodation / Hotel')}
                        </SelectItem>
                        <SelectItem value="car_rental">
                          {t('travel.car_rental', 'Car Rental')}
                        </SelectItem>
                        <SelectItem value="museum">
                          {t('travel.museum', 'Museum / Landmark')}
                        </SelectItem>
                        <SelectItem value="coupon">
                          {t('travel.coupon', 'Shopping / Offer')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t('travel.title', 'Title')}</Label>
                  <Input
                    className="bg-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('travel.address', 'Address / Location')}</Label>
                  <Input
                    className="bg-white"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="E.g. 123 Main St"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {t('travel.start_time', 'Start Time')}
                    </Label>
                    <Input
                      className="bg-white"
                      type="datetime-local"
                      value={startTime}
                      min={minDateTime}
                      max={maxDateTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {t('travel.end_time', 'End Time')}
                    </Label>
                    <Input
                      className="bg-white"
                      type="datetime-local"
                      value={endTime}
                      min={minDateTime}
                      max={maxDateTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                {minDateTime && maxDateTime && (
                  <p className="text-xs text-slate-500 italic mt-1">
                    {t('travel.trip_period', 'Trip period:')}{' '}
                    {format(parseISO(itinerary.start_date!), 'MMM do, yyyy')} -{' '}
                    {format(parseISO(itinerary.end_date!), 'MMM do, yyyy')}
                  </p>
                )}

                <div className="space-y-2">
                  <Label>{t('travel.description', 'Notes')}</Label>
                  <Textarea
                    className="bg-white"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {step === 'form' && (
          <div className="p-6 border-t flex justify-between bg-white">
            <Button variant="ghost" onClick={() => setStep('select')}>
              {t('common.back', 'Back')}
            </Button>
            <Button onClick={handleSave}>
              {t('common.save', 'Save Item')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
