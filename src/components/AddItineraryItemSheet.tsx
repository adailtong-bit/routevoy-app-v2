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
import { Search, Plus, Store, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { itineraryService } from '@/services/itinerary'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddItineraryItemSheetProps {
  itineraryId: string
  onAdded: () => void
}

export function AddItineraryItemSheet({
  itineraryId,
  onAdded,
}: AddItineraryItemSheetProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [offers, setOffers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('offers')

  const [type, setType] = useState<'hotel' | 'activity' | 'coupon'>('activity')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [referenceId, setReferenceId] = useState<string | null>(null)

  useEffect(() => {
    if (open && activeTab === 'offers') {
      fetchOffers()
    }
  }, [open, activeTab])

  const fetchOffers = async () => {
    const [promos, coupons] = await Promise.all([
      supabase
        .from('discovered_promotions')
        .select('id, title, store_name, product_link')
        .limit(50),
      supabase
        .from('coupons')
        .select('id, title, store_name, location_name')
        .limit(50),
    ])
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
  }

  const handleSelectOffer = (offer: any) => {
    setType('coupon')
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
    setStartTime('')
    setEndTime('')
    setReferenceId(null)
  }

  const handleSave = async () => {
    if (!title) {
      toast.error(t('travel.title_required', 'Title is required'))
      return
    }

    try {
      await itineraryService.addItem({
        itinerary_id: itineraryId,
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

  const filteredOffers = offers.filter(
    (o) =>
      o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.store?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
      }}
    >
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {t('travel.add_to_trip', 'Add to Trip')}
        </Button>
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
                </div>
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-3 pb-6">
                    {filteredOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="border bg-white rounded-xl p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all"
                        onClick={() => handleSelectOffer(offer)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800 line-clamp-2">
                              {offer.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <Store className="h-3 w-3" /> {offer.store}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('travel.start_time', 'Start Time')}</Label>
                    <Input
                      className="bg-white"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('travel.end_time', 'End Time')}</Label>
                    <Input
                      className="bg-white"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

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
