import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Itinerary, itineraryService } from '@/services/itinerary'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'
import { Loader2 } from 'lucide-react'

export function EditTripDialog({
  trip,
  open,
  onOpenChange,
  onUpdated,
}: {
  trip: Itinerary
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}) {
  const { t } = useLanguage()
  const [title, setTitle] = useState(trip.title)
  const [destination, setDestination] = useState(trip.destination || '')
  const [startDate, setStartDate] = useState(
    trip.start_date ? trip.start_date.split('T')[0] : '',
  )
  const [endDate, setEndDate] = useState(
    trip.end_date ? trip.end_date.split('T')[0] : '',
  )
  const [description, setDescription] = useState(trip.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && trip) {
      setTitle(trip.title)
      setDestination(trip.destination || '')
      setStartDate(trip.start_date ? trip.start_date.split('T')[0] : '')
      setEndDate(trip.end_date ? trip.end_date.split('T')[0] : '')
      setDescription(trip.description || '')
    }
  }, [open, trip])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      toast.error(
        t('common.required_fields', 'Please fill in all required fields'),
      )
      return
    }

    try {
      setIsSubmitting(true)
      const dataToUpdate = {
        title,
        destination: destination || null,
        description: description || null,
        start_date: startDate ? `${startDate}T00:00:00.000Z` : null,
        end_date: endDate ? `${endDate}T23:59:59.999Z` : null,
      }

      const oldStart = trip.start_date ? trip.start_date.split('T')[0] : null
      const oldEnd = trip.end_date ? trip.end_date.split('T')[0] : null

      if (startDate !== oldStart || endDate !== oldEnd) {
        await itineraryService.updateDates(trip.id, dataToUpdate)
      } else {
        await itineraryService.update(trip.id, dataToUpdate)
      }

      toast.success(t('travel.trip_updated', 'Trip updated successfully'))
      onUpdated()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update trip')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('travel.edit_trip', 'Edit Trip')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('travel.trip_title', 'Trip Name')} *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer in Paris"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">
              {t('travel.destination', 'Destination')}
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, France"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                {t('travel.start_date', 'Start Date')}
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">
                {t('travel.end_date', 'End Date')}
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
            {t(
              'travel.date_change_notice',
              'Changing dates will automatically reschedule your planned activities to match the new duration.',
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('common.description', 'Description')}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this trip..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
