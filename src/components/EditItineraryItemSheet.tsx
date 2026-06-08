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
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ItineraryItem } from '@/services/itinerary'

interface EditItineraryItemSheetProps {
  item: ItineraryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}

export function EditItineraryItemSheet({
  item,
  open,
  onOpenChange,
  onUpdated,
}: EditItineraryItemSheetProps) {
  const { t } = useLanguage()

  const [type, setType] = useState<'hotel' | 'activity' | 'coupon'>('activity')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (item && open) {
      setType(item.type as any)
      setTitle(item.title || '')
      setDescription(item.description || '')
      setAddress(item.address || '')

      const formatTime = (isoString: string | null) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
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

      toast.success(t('common.success', 'Updated successfully'))
      onOpenChange(false)
      onUpdated()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b bg-white">
          <SheetTitle>{t('travel.edit_item', 'Edit Item')}</SheetTitle>
          <SheetDescription className="sr-only">
            Edit itinerary item details
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          <div className="space-y-2">
            <Label>{t('travel.type', 'Type')}</Label>
            <Select
              value={type}
              onValueChange={(v: any) => setType(v)}
              disabled={!!item?.reference_id}
            >
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

          <div className="space-y-2">
            <Label>{t('travel.title', 'Title')}</Label>
            <Input
              className="bg-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('travel.address', 'Address')}</Label>
            <Input
              className="bg-white"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

        <div className="p-6 border-t flex justify-end bg-white">
          <Button onClick={handleSave}>
            {t('common.save_changes', 'Save Changes')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
