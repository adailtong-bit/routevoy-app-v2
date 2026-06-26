import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiscoveredPromotion } from '@/lib/types'
import { ExternalLink, BadgeCheck } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

export function PromotionCard({
  promotion,
}: {
  promotion: DiscoveredPromotion | any
}) {
  const { t } = useLanguage()

  // Safely extract properties
  const safeRegion = promotion?.region
  const safeCountry = promotion?.country
  const safeCurrency = promotion?.currency

  const { formatCurrency } = useRegionFormatting(
    safeRegion,
    safeCountry,
    safeCurrency,
  )

  if (!promotion || typeof promotion !== 'object') return null

  const image =
    promotion?.image ||
    promotion?.imageUrl ||
    promotion?.image_url ||
    'https://img.usecurling.com/p/400/300?q=shopping'

  const title = promotion?.title || 'Promoção Sem Título'
  const description = promotion?.description || ''

  const discountPercentage =
    promotion?.discountPercentage ?? promotion?.discount_percentage
  const currentPrice = promotion?.currentPrice ?? promotion?.price
  const originalPrice = promotion?.originalPrice ?? promotion?.original_price

  let finalDiscountLabel =
    promotion?.discount || (promotion as any)?.discount_label

  if (
    !finalDiscountLabel &&
    discountPercentage &&
    Number(discountPercentage) > 0
  ) {
    finalDiscountLabel = `${discountPercentage}% OFF`
  }

  if (
    !finalDiscountLabel &&
    originalPrice !== undefined &&
    originalPrice !== null &&
    currentPrice !== undefined &&
    currentPrice !== null &&
    Number(originalPrice) > Number(currentPrice)
  ) {
    const rawDiscount = Math.round(
      ((Number(originalPrice) - Number(currentPrice)) / Number(originalPrice)) *
        100,
    )
    if (!isNaN(rawDiscount) && rawDiscount > 0) {
      finalDiscountLabel = `${rawDiscount}% OFF`
    }
  }

  const model =
    promotion?.promotionModel ||
    (promotion as any)?.promotion_model ||
    'standard'
  const isBuyAndGet =
    model === 'buy_and_get' || model === 'buy_and_win' || model === 'reward'
  const isFixedDiscount = model === 'fixed_discount' || model === 'discount'

  const hasPrice =
    currentPrice !== undefined &&
    currentPrice !== null &&
    String(currentPrice).trim() !== ''
  const isExplicitlyFree = hasPrice && Number(currentPrice) === 0
  const isFreeModel =
    model === 'free' || model === 'gratis' || model === 'giveaway'
  const isFree = isExplicitlyFree || isFreeModel

  if (
    isFree &&
    !finalDiscountLabel &&
    !discountPercentage &&
    !isFixedDiscount
  ) {
    finalDiscountLabel = t('common.free', 'Grátis')
  }

  const isDemo = !!(promotion as any)?.is_demo

  const link =
    promotion?.productLink ||
    promotion?.product_link ||
    promotion?.sourceUrl ||
    promotion?.source_url ||
    promotion?.originalUrl ||
    (promotion as any)?.link

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-white font-sans group border-slate-200">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://img.usecurling.com/p/400/300?q=shopping'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {isDemo && (
          <Badge className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-2 py-1 shadow-sm border-none z-10">
            {t('admin.public.card.demo_example_status', 'Demonstração')}
          </Badge>
        )}

        {finalDiscountLabel && !isDemo && (
          <Badge className="absolute bottom-3 right-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-2 py-1 shadow-md border-none z-10">
            {finalDiscountLabel}
          </Badge>
        )}

        {promotion?.category &&
          promotion?.category !== 'Geral' &&
          promotion?.category !== 'all' && (
            <Badge className="absolute top-3 right-3 bg-white/90 text-slate-800 font-bold text-xs px-2 py-1 shadow-sm border-none z-10 backdrop-blur-sm">
              {promotion.category}
            </Badge>
          )}

        {promotion?.isVerified && (
          <Badge className="absolute top-3 left-3 bg-green-500/90 hover:bg-green-600 text-white font-bold text-xs px-2 py-1 shadow-sm border-none z-10 flex items-center gap-1 backdrop-blur-sm">
            <BadgeCheck className="w-3 h-3" />
            {t('vouchers.verified', 'Verificado')}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1">
          <h3
            className="font-bold text-base line-clamp-2 text-slate-900 leading-tight"
            title={title}
          >
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 line-clamp-2 break-words">
              {description}
            </p>
          )}
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center min-h-[64px] mt-auto">
          {isBuyAndGet ? (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                {t('campaign_form.fields.reward', 'Recompensa')}
              </p>
              <p className="text-sm font-bold text-amber-600 break-words leading-tight">
                {promotion?.triggerThreshold &&
                Number(promotion.triggerThreshold) > 0
                  ? `Compre ${promotion.triggerThreshold} e ganhe `
                  : ''}
                {promotion?.rewardDescription ||
                  promotion?.reward_description ||
                  t('campaign_form.fields.model_buy_get', 'Compre e Ganhe')}
              </p>
            </div>
          ) : isFixedDiscount || hasPrice ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                {originalPrice &&
                  Number(originalPrice) > 0 &&
                  Number(originalPrice) > Number(currentPrice) && (
                    <span className="text-xs text-slate-400 line-through mb-0.5">
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                <span className="text-xl font-bold text-slate-800 leading-none">
                  {isFree
                    ? t('common.free', 'Grátis')
                    : formatCurrency(currentPrice || 0)}
                </span>
              </div>
              {discountPercentage && Number(discountPercentage) > 0 && (
                <Badge className="bg-rose-100 text-rose-600 border-none shadow-none text-xs font-bold px-2 py-1">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-medium text-slate-600">
                {t('common.discount', 'Desconto')}
              </span>
              <span className="text-xl font-bold text-rose-600">
                {finalDiscountLabel ||
                  (discountPercentage
                    ? `${discountPercentage}% OFF`
                    : t('common.available', 'Disponível'))}
              </span>
            </div>
          )}
        </div>

        {link && (
          <Button
            variant="outline"
            className="w-full text-xs h-9 mt-1 group-hover:bg-slate-50 transition-colors"
            asChild
          >
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Ver Oferta
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
