import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tag, Gift, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DiscoveredPromotion } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'

interface PromotionModalProps {
  isOpen: boolean
  onClose: () => void
  promotion: DiscoveredPromotion | null
  onSave: (updatedData: Partial<DiscoveredPromotion>) => void
}

export function PromotionModal({
  isOpen,
  onClose,
  promotion,
  onSave,
}: PromotionModalProps) {
  const { t } = useLanguage()

  const [description, setDescription] = useState('')
  const [model, setModel] = useState<
    'price_comparison' | 'buy_x_get_y' | 'standard'
  >('standard')
  const [isSeasonal, setIsSeasonal] = useState(false)

  // Fields for Price Comparison
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [discountValue, setDiscountValue] = useState<string>('')
  const [finalPrice, setFinalPrice] = useState<string>('')

  // Fields for Buy X, Get Y
  const [purchaseValue, setPurchaseValue] = useState<string>('')
  const [rewardValue, setRewardValue] = useState<string>('')

  // Fields for Standard Voucher
  const [discountPercentage, setDiscountPercentage] = useState<string>('')

  useEffect(() => {
    if (promotion) {
      setDescription(promotion.description || '')
      setModel((promotion.promotionModel as any) || 'standard')
      setIsSeasonal(promotion.isSeasonal || false)

      const origPrice = promotion.originalPrice || promotion.currentPrice
      const finPrice = promotion.price

      setOriginalPrice(origPrice ? String(origPrice) : '')
      setFinalPrice(finPrice ? String(finPrice) : '')
      if (origPrice && finPrice) {
        setDiscountValue(String(origPrice - finPrice))
      } else {
        setDiscountValue('')
      }

      setPurchaseValue(
        promotion.triggerThreshold ? String(promotion.triggerThreshold) : '',
      )
      setRewardValue(promotion.rewardValue ? String(promotion.rewardValue) : '')

      setDiscountPercentage(
        promotion.discountPercentage
          ? String(promotion.discountPercentage)
          : '',
      )
    }
  }, [promotion])

  // Handle derived calculations for Price Comparison
  const handleOriginalPriceChange = (val: string) => {
    setOriginalPrice(val)
    const orig = parseFloat(val)
    const disc = parseFloat(discountValue)
    if (!isNaN(orig) && !isNaN(disc)) {
      setFinalPrice(String(Math.max(0, orig - disc)))
    }
  }

  const handleDiscountValueChange = (val: string) => {
    setDiscountValue(val)
    const orig = parseFloat(originalPrice)
    const disc = parseFloat(val)
    if (!isNaN(orig) && !isNaN(disc)) {
      setFinalPrice(String(Math.max(0, orig - disc)))
    }
  }

  const handleFinalPriceChange = (val: string) => {
    setFinalPrice(val)
    const orig = parseFloat(originalPrice)
    const fin = parseFloat(val)
    if (!isNaN(orig) && !isNaN(fin)) {
      setDiscountValue(String(Math.max(0, orig - fin)))
    }
  }

  const handleSave = () => {
    const data: Partial<DiscoveredPromotion> = {
      description,
      promotionModel: model,
      isSeasonal,
    }

    if (model === 'price_comparison') {
      data.originalPrice = parseFloat(originalPrice) || 0
      data.price = parseFloat(finalPrice) || 0
    } else if (model === 'buy_x_get_y') {
      data.triggerType = 'amount_spent'
      data.triggerThreshold = parseFloat(purchaseValue) || 0
      data.rewardValue = parseFloat(rewardValue) || 0
    } else if (model === 'standard') {
      data.discountPercentage = parseFloat(discountPercentage) || 0
    }

    onSave(data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {t('admin.offers.modal.title', 'Promotion Details')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {t('admin.offers.modal.description', 'Promotion Description')}
            </Label>
            <Textarea
              placeholder={t(
                'admin.offers.modal.desc_placeholder',
                'Additional details, rules or conditions...',
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Discount Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">
              {t('admin.offers.modal.model_title', 'Discount Model')}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setModel('price_comparison')}
                className={cn(
                  'flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all duration-200',
                  model === 'price_comparison'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <Tag
                  className={cn(
                    'w-6 h-6 mb-2',
                    model === 'price_comparison'
                      ? 'text-blue-600'
                      : 'text-slate-500',
                  )}
                />
                <span
                  className={cn(
                    'font-bold text-sm',
                    model === 'price_comparison'
                      ? 'text-blue-700'
                      : 'text-slate-700',
                  )}
                >
                  {t('admin.offers.modal.pure_discount', 'Pure Discount')}
                </span>
                <span className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t(
                    'admin.offers.modal.pure_discount_desc',
                    'Direct discount on the product',
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModel('buy_x_get_y')}
                className={cn(
                  'flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all duration-200',
                  model === 'buy_x_get_y'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <Gift
                  className={cn(
                    'w-6 h-6 mb-2',
                    model === 'buy_x_get_y'
                      ? 'text-blue-600'
                      : 'text-slate-500',
                  )}
                />
                <span
                  className={cn(
                    'font-bold text-sm',
                    model === 'buy_x_get_y'
                      ? 'text-blue-700'
                      : 'text-slate-700',
                  )}
                >
                  {t('admin.offers.modal.buy_x_get_y', 'Buy X, Get Y')}
                </span>
                <span className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t(
                    'admin.offers.modal.buy_x_get_y_desc',
                    'Gift based on amount spent',
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModel('standard')}
                className={cn(
                  'flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all duration-200',
                  model === 'standard'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <LinkIcon
                  className={cn(
                    'w-6 h-6 mb-2',
                    model === 'standard' ? 'text-blue-600' : 'text-slate-500',
                  )}
                />
                <span
                  className={cn(
                    'font-bold text-sm',
                    model === 'standard' ? 'text-blue-700' : 'text-slate-700',
                  )}
                >
                  {t('admin.offers.modal.standard_voucher', 'Standard Voucher')}
                </span>
                <span className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t(
                    'admin.offers.modal.standard_voucher_desc',
                    'Just link or coupon',
                  )}
                </span>
              </button>
            </div>

            {/* Hint Box & Specific Fields */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mt-4 space-y-4">
              <p className="text-sm text-slate-600">
                {model === 'standard' &&
                  t(
                    'admin.offers.modal.standard_voucher_hint',
                    'In this model, only the title, description, and link of the offer will be shown to the user. Ideal for generic vouchers.',
                  )}
                {model === 'price_comparison' &&
                  t(
                    'admin.offers.modal.pure_discount_hint',
                    'In this model, the original and final price will be displayed, highlighting the direct discount to the user.',
                  )}
                {model === 'buy_x_get_y' &&
                  t(
                    'admin.offers.modal.buy_x_get_y_hint',
                    'In this model, the user must spend a specific amount to earn a reward or discount.',
                  )}
              </p>

              {/* Specific Fields */}
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {model === 'price_comparison' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t(
                          'admin.offers.modal.original_price',
                          'Original Price',
                        )}
                      </Label>
                      <Input
                        type="number"
                        value={originalPrice}
                        onChange={(e) =>
                          handleOriginalPriceChange(e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t(
                          'admin.offers.modal.discount_value',
                          'Discount Value',
                        )}
                      </Label>
                      <Input
                        type="number"
                        value={discountValue}
                        onChange={(e) =>
                          handleDiscountValueChange(e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t('admin.offers.modal.final_price', 'Final Price')}
                      </Label>
                      <Input
                        type="number"
                        value={finalPrice}
                        onChange={(e) => handleFinalPriceChange(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {model === 'buy_x_get_y' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t(
                          'admin.offers.modal.purchase_value',
                          'Purchase Value (Buy X)',
                        )}
                      </Label>
                      <Input
                        type="number"
                        value={purchaseValue}
                        onChange={(e) => setPurchaseValue(e.target.value)}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t(
                          'admin.offers.modal.reward_value',
                          'Reward Value (Get Y)',
                        )}
                      </Label>
                      <Input
                        type="number"
                        value={rewardValue}
                        onChange={(e) => setRewardValue(e.target.value)}
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>
                )}

                {model === 'standard' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t(
                          'admin.offers.modal.percentage_discount',
                          'Percentage Discount (%)',
                        )}
                      </Label>
                      <Input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder={t(
                          'admin.offers.modal.percentage_placeholder',
                          'e.g. 80',
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seasonal Campaign Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-slate-800">
                {t('admin.offers.modal.seasonal_campaign', 'Seasonal Campaign')}
              </Label>
              <p className="text-xs text-slate-500">
                {t(
                  'admin.offers.modal.seasonal_campaign_desc',
                  'Highlight this offer on holidays (Ex: Black Friday).',
                )}
              </p>
            </div>
            <Switch checked={isSeasonal} onCheckedChange={setIsSeasonal} />
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose} className="font-semibold">
            {t('admin.offers.modal.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('admin.offers.modal.save', 'Save Promotion')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
