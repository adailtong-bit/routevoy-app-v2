import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/stores/LanguageContext'

interface AffiliatePromotionEditorProps {
  isOpen: boolean
  onClose: () => void
  promotion: any
  onSave: (data: any) => Promise<void>
}

export function AffiliatePromotionEditor({
  isOpen,
  onClose,
  promotion,
  onSave,
}: AffiliatePromotionEditorProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    end_date: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        price: promotion.price || '',
        original_price: promotion.original_price || '',
        image_url: promotion.image_url || '',
        end_date: promotion.end_date ? promotion.end_date.split('T')[0] : '',
      })
    }
  }, [promotion])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        image_url: formData.image_url,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('affiliate.editor.title', 'Edit Promotion')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'affiliate.editor.desc',
              'Update the promotion details before publishing.',
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('affiliate.editor.field_title', 'Title')}</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('affiliate.editor.field_desc', 'Description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                {t('affiliate.editor.field_original_price', 'Original Price')}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => handleChange('original_price', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t('affiliate.editor.field_price', 'Discount Price')}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('affiliate.editor.field_image', 'Image URL')}</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('affiliate.editor.field_end_date', 'End Date')}</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? t('common.saving', 'Saving...')
              : t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
