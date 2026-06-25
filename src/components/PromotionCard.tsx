import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiscoveredPromotion } from '@/lib/types'
import { ExternalLink, Tag, BadgeCheck, Users } from 'lucide-react'
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
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white font-sans">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden group shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://img.usecurling.com/p/400/300?q=shopping'
          }}
        />
        {isDemo && (
          <Badge className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-2 py-1 shadow-sm border-none z-10">
            {t('admin.public.card.demo_example_status', 'Demonstração')}
          </Badge>
        )}
        {finalDiscountLabel && !isDemo && (
          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-2 py-1 shadow-sm border-none z-10">
            {finalDiscountLabel}
          </Badge>
        )}
        {promotion?.category &&
          promotion?.category !== 'Geral' &&
          promotion?.category !== 'all' && (
            <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-800 font-bold text-xs px-2 py-1 shadow-sm border-none z-10 backdrop-blur-sm">
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
      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        <h3
          className="font-bold text-base line-clamp-2 text-slate-900"
          title={title}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
        )}
        {promotion?.usageCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded-md mt-1">
            <Users className="w-3 h-3" />
            {promotion.usageCount} {t('vouchers.used_today', 'usados hoje')}
          </div>
        )}
        <div className="mt-auto flex flex-col pt-2">
          {isBuyAndGet ? (
            <div className="flex flex-col justify-end">
              <span className="text-sm font-bold text-green-600 line-clamp-2">
                {promotion?.rewardDescription ||
                  (promotion as any)?.reward_description ||
                  t('vouchers.reward', 'Recompensa')}
              </span>
            </div>
          ) : isFixedDiscount ? (
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-600 text-lg">
                {finalDiscountLabel || t('vouchers.discount', 'Desconto')}
              </span>
            </div>
          ) : currentPrice !== undefined &&
            currentPrice !== null &&
            Number(currentPrice) > 0 ? (
            <div className="flex items-center justify-between">
              <div className="font-bold text-primary text-base">
                {formatCurrency
                  ? formatCurrency(Number(currentPrice))
                  : `$${Number(currentPrice).toFixed(2)}`}
              </div>
              {originalPrice !== undefined &&
                originalPrice !== null &&
                Number(originalPrice) > Number(currentPrice) && (
                  <div className="font-normal text-slate-400 line-through text-sm">
                    {formatCurrency
                      ? formatCurrency(Number(originalPrice))
                      : `$${Number(originalPrice).toFixed(2)}`}
                  </div>
                )}
            </div>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs font-bold text-slate-500">
                {t('vouchers.check_on_site', 'Conferir no site')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto flex items-end">
        {link ? (
          <Button asChild className="w-full font-bold group/btn">
            <a href={link} target="_blank" rel="noopener noreferrer">
              {t('vouchers.get_offer', 'Ver Oferta')}
              <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
            </a>
          </Button>
        ) : (
          <Button className="w-full font-bold group/btn">
            {t('vouchers.get_offer', 'Ver Oferta')}
          </Button>
        )}
      </div>
    </Card>
  )
}
