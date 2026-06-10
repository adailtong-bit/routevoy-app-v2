import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { PromotionCard } from '@/components/PromotionCard'
import { saveDiscoveredPromotion, fetchCategories } from '@/lib/api'
import { toast } from 'sonner'
import { DiscoveredPromotion } from '@/lib/types'

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreatePromotionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePromotionModalProps) {
  const [title, setTitle] = useState('')
  const [model, setModel] = useState<
    'pure_discount' | 'standard' | 'buy_x_get_y'
  >('pure_discount')

  // Pure Discount Fields
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [finalPrice, setFinalPrice] = useState('')

  // Voucher Fields
  const [discountPercentage, setDiscountPercentage] = useState('')

  // Buy X Get Y Fields
  const [purchaseValue, setPurchaseValue] = useState('')
  const [rewardValue, setRewardValue] = useState('')

  // Restored Core Fields
  const [category, setCategory] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data || []))
  }, [])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setModel('pure_discount')
      setOriginalPrice('')
      setDiscountAmount('')
      setFinalPrice('')
      setDiscountPercentage('')
      setPurchaseValue('')
      setRewardValue('')
      setCategory('')
      setCtaLink('')
      setDescription('')
      setImageUrl('')
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!title) {
      toast.error('Campaign Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Partial<DiscoveredPromotion> = {
        title,
        description,
        category: category || 'Geral',
        productLink: ctaLink,
        sourceUrl: ctaLink,
        imageUrl: imageUrl || 'https://img.usecurling.com/p/400/300?q=shopping',
        status: 'published',
        promotionModel: model,
        storeName: 'Admin Campaign',
        isVerified: true,
      }

      if (model === 'pure_discount') {
        payload.originalPrice = originalPrice
          ? Number(originalPrice)
          : undefined
        payload.discount = discountAmount
        payload.price = finalPrice ? Number(finalPrice) : undefined
        payload.currentPrice = finalPrice ? Number(finalPrice) : undefined
      } else if (model === 'standard') {
        payload.discountPercentage = discountPercentage
          ? Number(discountPercentage)
          : undefined
        payload.discount = discountPercentage
          ? `${discountPercentage}% OFF`
          : ''
      } else if (model === 'buy_x_get_y') {
        payload.triggerThreshold = purchaseValue
          ? Number(purchaseValue)
          : undefined
        payload.rewardValue = rewardValue ? Number(rewardValue) : undefined
        payload.triggerType = 'amount_spent'
        payload.discount =
          purchaseValue && rewardValue
            ? `Buy ${purchaseValue}, Get ${rewardValue}`
            : ''
      }

      await saveDiscoveredPromotion(payload)
      toast.success('Promotion created successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (e) {
      console.error(e)
      toast.error('Failed to create promotion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewData: DiscoveredPromotion = {
    id: 'preview-id',
    sourceId: 'preview',
    title: title || 'Campaign Title',
    description: description || 'Promotion Description',
    category: category || 'Category',
    productLink: ctaLink,
    imageUrl: imageUrl || 'https://img.usecurling.com/p/400/300?q=shopping',
    price:
      model === 'pure_discount' && finalPrice ? Number(finalPrice) : undefined,
    currentPrice:
      model === 'pure_discount' && finalPrice ? Number(finalPrice) : undefined,
    originalPrice:
      model === 'pure_discount' && originalPrice
        ? Number(originalPrice)
        : undefined,
    discountPercentage:
      model === 'standard' && discountPercentage
        ? Number(discountPercentage)
        : undefined,
    discount:
      model === 'pure_discount'
        ? discountAmount
        : model === 'standard' && discountPercentage
          ? `${discountPercentage}% OFF`
          : model === 'buy_x_get_y' && purchaseValue && rewardValue
            ? `Buy ${purchaseValue}, Get ${rewardValue}`
            : '',
    storeName: 'Your Store',
    status: 'published',
    isVerified: true,
    usageCount: 0,
    region: 'Global',
    promotionModel: model,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
          <DialogDescription>
            Configure your campaign details and promotion model below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Form Fields - Left Side */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Title</Label>
              <Input
                placeholder="e.g., Summer Super Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Promotion Model</Label>
              <Select value={model} onValueChange={(v: any) => setModel(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a promotion model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pure_discount">Pure Discount</SelectItem>
                  <SelectItem value="standard">Voucher (Standard)</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X, Get Y</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Specific Fields */}
            {model === 'pure_discount' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Original Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Amount</Label>
                  <Input
                    placeholder="e.g., 20% or $10"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Final Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                  />
                </div>
              </div>
            )}

            {model === 'standard' && (
              <div className="space-y-2">
                <Label>Discount Percentage (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 80"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                />
              </div>
            )}

            {model === 'buy_x_get_y' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Value (X)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={purchaseValue}
                    onChange={(e) => setPurchaseValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount/Reward Value (Y)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Restored Core Fields */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.label || c.name}>
                      {c.label || c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Geral">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Call to Action (Link)</Label>
              <Input
                placeholder="https://..."
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Promotion Image URL</Label>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Promotion Description</Label>
              <Textarea
                placeholder="Additional details, rules or conditions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Preview - Right Side */}
          <div className="flex flex-col items-center bg-slate-50 p-6 rounded-xl border border-slate-100 h-full min-h-[400px]">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 self-start">
              Live Preview
            </h3>
            <div className="w-full max-w-sm flex-1">
              <PromotionCard promotion={previewData} />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Promotion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
