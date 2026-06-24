import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ImagePlus, ImageOff, MapPin, Globe, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

interface CampaignPreviewProps {
  title?: string
  description?: string
  instructions?: string
  image?: string
  startDate?: string
  endDate?: string
  companyUrl?: string
  discountPercentage?: string | number
  originalPrice?: number | string
  price?: number | string
  currency?: string
  promotionModel?: string
  rewardDescription?: string
  isOnline?: boolean
  formattedDiscount?: string
}

export function CampaignPreview({
  title,
  description,
  instructions,
  image,
  startDate,
  endDate,
  companyUrl,
  discountPercentage,
  originalPrice,
  price,
  currency = 'BRL',
  promotionModel = 'standard',
  rewardDescription,
  isOnline = false,
  formattedDiscount,
  minimumPurchase,
}: CampaignPreviewProps & { minimumPurchase?: string | number }) {
  const { t, formatDate } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const formatCurrency = (val: number | string) => {
    const num = Number(val)
    if (isNaN(num)) return ''
    const safeCurrency = (currency || 'BRL').toUpperCase()
    const locale = safeCurrency === 'USD' ? 'en-US' : 'pt-BR'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
    }).format(num)
  }

  const finalDiscount = discountPercentage
    ? `${discountPercentage}% OFF`
    : formattedDiscount

  return (
    <Card className="overflow-hidden border-slate-200 shadow-md w-full max-w-[340px] bg-white pointer-events-auto flex flex-col">
      <div className="aspect-[4/3] w-full relative bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
        {image && !imgError ? (
          <img
            src={image}
            crossOrigin="anonymous"
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            {image ? (
              <ImageOff className="w-8 h-8 mb-2" />
            ) : (
              <ImagePlus className="w-8 h-8 mb-2" />
            )}
            <span className="text-xs">{t('common.no_image', 'No image')}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm flex items-center gap-1 text-[10px] px-1.5 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            {t('common.verified', 'Verified')}
          </Badge>
          {isOnline ? (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-sm flex items-center gap-1 text-[10px] px-1.5 py-0.5">
              <Globe className="w-3 h-3" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-slate-800/80 hover:bg-slate-800 text-white border-none shadow-sm flex items-center gap-1 text-[10px] px-1.5 py-0.5 backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              Local
            </Badge>
          )}
        </div>

        {/* Promotion Badges based on model */}
        {promotionModel === 'fixed_discount' && finalDiscount ? (
          <Badge className="absolute bottom-3 right-3 bg-rose-500 text-white hover:bg-rose-600 border-none shadow-md text-sm font-bold px-2 py-1 z-10">
            {finalDiscount}
          </Badge>
        ) : promotionModel === 'buy_and_get' ? (
          <Badge className="absolute bottom-3 right-3 bg-amber-500 text-white hover:bg-amber-600 border-none shadow-md text-xs font-bold px-2 py-1 max-w-[80%] text-center truncate z-10 whitespace-normal">
            🎁{' '}
            {minimumPurchase
              ? `Spend ${formatCurrency(minimumPurchase)} and get `
              : ''}
            {rewardDescription ||
              t('campaign_form.fields.model_buy_get', 'Buy and Get')}
          </Badge>
        ) : promotionModel === 'standard' && finalDiscount ? (
          <Badge className="absolute bottom-3 right-3 bg-rose-500 text-white hover:bg-rose-600 border-none shadow-md text-sm font-bold px-2 py-1 z-10">
            {finalDiscount}
          </Badge>
        ) : null}
      </div>

      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="space-y-1">
          <h4 className="font-bold text-base leading-tight break-words text-slate-800">
            {title || t('vendor.form.campaign_title', 'Campaign Title')}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 break-words">
            {description ||
              t(
                'vendor.form.description',
                'Your campaign description will appear here...',
              )}
          </p>
        </div>

        {/* Pricing / Reward Info */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between min-h-[60px]">
          {promotionModel === 'buy_and_get' ? (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {t('campaign_form.fields.reward', 'Reward')}
              </p>
              <p className="text-sm font-bold text-amber-600 break-words">
                {minimumPurchase
                  ? `Spend ${formatCurrency(minimumPurchase)} and get `
                  : ''}
                {rewardDescription || '---'}
              </p>
            </div>
          ) : promotionModel === 'fixed_discount' ? (
            <div className="flex-1 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {t('campaign_form.fields.discount', 'Discount')}
              </p>
              <p className="text-xl font-bold text-rose-600">
                {finalDiscount || '---'}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-3">
              {originalPrice ? (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    FROM
                  </span>
                  <span className="text-sm text-slate-400 line-through decoration-rose-400/50 font-medium">
                    {formatCurrency(originalPrice)}
                  </span>
                </div>
              ) : null}

              {price ? (
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600/80">
                    TO
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(price)}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic">
                  {t('campaign_form.preview.no_price', 'Price not set')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
          <div>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
              {t('vendor.journey.validity', 'Validity:')}
            </span>
            <span className="block text-slate-500">
              {startDate ? formatDate(startDate) : '--/--/----'}{' '}
              {t('common.to', 'to')}{' '}
              {endDate ? formatDate(endDate) : '--/--/----'}
            </span>
          </div>
          {instructions && (
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
                {t('vendor.journey.rules', 'Rules:')}
              </span>
              <span className="whitespace-pre-wrap block break-words text-slate-500">
                {instructions}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          {companyUrl ? (
            <Button
              className="w-full h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={() =>
                window.open(companyUrl, '_blank', 'noopener,noreferrer')
              }
            >
              <Globe className="w-4 h-4 mr-2" />
              {t('vouchers.go_to_store', 'Go to Store')}
            </Button>
          ) : (
            <Button
              className="w-full h-10 text-sm font-semibold"
              variant="default"
              disabled
            >
              {t('vouchers.reserve', 'Redeem Offer')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
