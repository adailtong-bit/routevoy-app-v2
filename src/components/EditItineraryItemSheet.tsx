import { useState, useEffect } from 'react'
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
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ItineraryItem, Itinerary } from '@/services/itinerary'
import { format, parseISO } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface EditItineraryItemSheetProps {
  item: ItineraryItem | null
  itinerary: Itinerary | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}

export function EditItineraryItemSheet({
  item,
  itinerary,
  open,
  onOpenChange,
  onUpdated,
}: EditItineraryItemSheetProps) {
  const { t } = useLanguage()

  const [type, setType] = useState<
    'hotel' | 'activity' | 'coupon' | 'car_rental' | 'museum'
  >('activity')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (item && open) {
      setType(item.type as any)
      setTitle(item.title)
      setDescription(item.description || '')
      setAddress(item.address || '')

      const formatTime = (timeStr?: string | null) => {
        if (!timeStr) return ''
        const d = new Date(timeStr)
        if (isNaN(d.getTime())) return ''
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 16)
      }

      setStartTime(formatTime(item.start_time))
      setEndTime(formatTime(item.end_time))
    }
  }, [item, open])

  const handleSave = async () => {
    if (!item) return
    if (!title) {
      toast.error(t('travel.title_required', 'Title is required'))
      return
    }

    try {
      const { error } = await supabase
        .from('itinerary_items')
        .update({
          type,
          title,
          description,
          address,
          start_time: startTime ? new Date(startTime).toISOString() : null,
          end_time: endTime ? new Date(endTime).toISOString() : null,
        })
        .eq('id', item.id)

      if (error) throw error

      toast.success(t('travel.item_updated', 'Item updated successfully'))
      onOpenChange(false)
      onUpdated()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const hasValidDates =
    itinerary?.start_date &&
    !isNaN(new Date(itinerary.start_date).getTime()) &&
    itinerary?.end_date &&
    !isNaN(new Date(itinerary.end_date).getTime())

  const minDateTime = hasValidDates
    ? format(parseISO(itinerary!.start_date!), "yyyy-MM-dd'T'00:00")
    : undefined
  const maxDateTime = hasValidDates
    ? format(parseISO(itinerary!.end_date!), "yyyy-MM-dd'T'23:59")
    : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-white">
          <SheetTitle>{t('travel.edit_item', 'Edit Item')}</SheetTitle>
          <SheetDescription className="sr-only">
            Edit trip item
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6 bg-slate-50">
          <div className="space-y-4 pb-6">
            {!item?.reference_id && (
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
                {format(parseISO(itinerary!.start_date!), 'MMM do, yyyy')} -{' '}
                {format(parseISO(itinerary!.end_date!), 'MMM do, yyyy')}
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

        <div className="p-6 border-t flex justify-end gap-3 bg-white">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save', 'Save Changes')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
