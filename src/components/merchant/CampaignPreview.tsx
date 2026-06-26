import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ImagePlus,
  ImageOff,
  MapPin,
  Globe,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
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
  minimumPurchase?: string | number
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
}: CampaignPreviewProps) {
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
    <Card className="overflow-hidden border-slate-200 shadow-md w-full max-w-[340px] bg-white pointer-events-auto flex flex-col group hover:shadow-lg transition-all duration-300">
      <div className="aspect-[4/3] w-full relative bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
        {image && !imgError ? (
          <img
            src={image}
            crossOrigin="anonymous"
            alt={title || ''}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          <Badge className="bg-emerald-500/90 backdrop-blur-sm hover:bg-emerald-600 text-white border-none shadow-sm flex items-center gap-1 text-[10px] px-1.5 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            {t('common.verified', 'Verified')}
          </Badge>
          {isOnline ? (
            <Badge className="bg-blue-500/90 backdrop-blur-sm hover:bg-blue-600 text-white border-none shadow-sm flex items-center gap-1 text-[10px] px-1.5 py-0.5">
              <Globe className="w-3 h-3" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-800 text-white border-none shadow-sm flex items-center gap-1 text-[10px] px-1.5 py-0.5">
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
          <Badge className="absolute bottom-3 right-3 bg-amber-500 text-white hover:bg-amber-600 border-none shadow-md text-xs font-bold px-2 py-1 max-w-[80%] text-center truncate z-10 whitespace-normal leading-tight">
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

      <CardContent className="p-4 flex flex-col gap-4 flex-1">
        <div className="space-y-1">
          <h4
            className="font-bold text-base leading-tight break-words text-slate-800 line-clamp-2"
            title={title}
          >
            {title || t('vendor.form.campaign_title', 'Campaign Title')}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 break-words mt-1">
            {description ||
              t(
                'vendor.form.description',
                'Your campaign description will appear here...',
              )}
          </p>
        </div>

        {/* Pricing / Reward Info */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center min-h-[64px] mt-auto">
          {promotionModel === 'buy_and_get' ? (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                {t('campaign_form.fields.reward', 'Reward')}
              </p>
              <p className="text-sm font-bold text-amber-600 break-words leading-tight">
                {minimumPurchase
                  ? `Spend ${formatCurrency(minimumPurchase)} and get `
                  : ''}
                {rewardDescription ||
                  t('campaign_form.fields.model_buy_get', 'Buy and Get')}
              </p>
            </div>
          ) : promotionModel === 'fixed_discount' ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                {originalPrice && Number(originalPrice) > 0 && (
                  <span className="text-xs text-slate-400 line-through mb-0.5">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-slate-800 leading-none">
                  {formatCurrency(price || 0)}
                </span>
              </div>
              {(discountPercentage || finalDiscount) && (
                <Badge className="bg-rose-100 text-rose-600 border-none shadow-none text-xs font-bold px-2 py-1">
                  {discountPercentage
                    ? `-${discountPercentage}%`
                    : finalDiscount}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-medium text-slate-600">
                {t('common.discount', 'Discount')}
              </span>
              <span className="text-xl font-bold text-rose-600">
                {finalDiscount ||
                  (discountPercentage ? `${discountPercentage}% OFF` : 'N/A')}
              </span>
            </div>
          )}
        </div>

        {companyUrl && (
          <Button
            variant="outline"
            className="w-full text-xs h-9 mt-1 group-hover:bg-slate-50 transition-colors"
            asChild
          >
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              View Offer
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
