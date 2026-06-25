import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiscoveredPromotion } from '@/lib/types'
import { ExternalLink, Tag, BadgeCheck, Users } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

export function PromotionCard({
  promotion,
}: {
  promotion: DiscoveredPromotion
}) {
  const { t } = useLanguage()
  const { formatCurrency } = useRegionFormatting(
    promotion?.region,
    promotion?.country,
    promotion?.currency,
  )

  // Guard against unexpected missing object
  if (!promotion || typeof promotion !== 'object') return null

  // Gracefully handle missing required fields using fallbacks
  const image =
    promotion.imageUrl ||
    promotion.image ||
    promotion.image_url ||
    'https://img.usecurling.com/p/400/300?q=shopping'
  const title = promotion.title || 'Untitled Promotion'

  const discountPercentage =
    promotion.discountPercentage ?? promotion.discount_percentage
  const discountLabel =
    promotion.discount ||
    (discountPercentage ? `${discountPercentage}% OFF` : null)

  const currentPrice = promotion.currentPrice ?? promotion.price
  const originalPrice = promotion.originalPrice ?? promotion.original_price
  const link =
    promotion.productLink ||
    promotion.product_link ||
    promotion.sourceUrl ||
    promotion.source_url ||
    promotion.originalUrl ||
    (promotion as any).link

  const calculatedDiscount =
    !discountLabel &&
    originalPrice !== undefined &&
    originalPrice !== null &&
    currentPrice !== undefined &&
    currentPrice !== null &&
    Number(currentPrice) > 0 &&
    Number(originalPrice) > Number(currentPrice)
      ? `${Math.round(((Number(originalPrice) - Number(currentPrice)) / Number(originalPrice)) * 100)}% OFF`
      : null

  let finalDiscountLabel = discountLabel || calculatedDiscount

  if (!finalDiscountLabel && (discountPercentage || discountPercentage === 0)) {
    finalDiscountLabel =
      discountPercentage > 0 ? `${discountPercentage}% OFF` : ''
  }

  const isFree =
    Number(currentPrice) === 0 || model === 'free' || model === 'gratis'
  if (isFree && !finalDiscountLabel) {
    finalDiscountLabel = t('common.free', 'Grátis')
  }
  const isDemo = !!(promotion as any).is_demo

  const model =
    promotion.promotionModel || (promotion as any).promotion_model || 'standard'
  const isBuyAndGet =
    model === 'buy_and_get' || model === 'buy_and_win' || model === 'reward'
  const isFixedDiscount = model === 'fixed_discount' || model === 'discount'

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
        {promotion.category && promotion.category !== 'Geral' && (
          <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-800 font-bold text-xs px-2 py-1 shadow-sm border-none z-10 backdrop-blur-sm">
            {promotion.category}
          </Badge>
        )}
        {promotion.isVerified && (
          <Badge className="absolute top-3 left-3 bg-green-500/90 hover:bg-green-600 text-white font-bold text-xs px-2 py-1 shadow-sm border-none z-10 flex items-center gap-1 backdrop-blur-sm">
            <BadgeCheck className="w-3 h-3" />
            {t('vouchers.verified', 'Verified')}
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
        {promotion.usageCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded-md">
            <Users className="w-3 h-3" />
            {promotion.usageCount} {t('vouchers.used_today', 'used today')}
          </div>
        )}
        <div className="mt-auto flex flex-col">
          {isBuyAndGet ? (
            <div className="flex flex-col justify-end">
              <span className="text-sm font-bold text-green-600 line-clamp-2">
                {promotion.rewardDescription ||
                  (promotion as any).reward_description ||
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
                {formatCurrency(Number(currentPrice))}
              </div>
              {originalPrice !== undefined &&
                originalPrice !== null &&
                Number(originalPrice) > Number(currentPrice) && (
                  <div className="font-normal text-slate-400 line-through text-sm">
                    {formatCurrency(Number(originalPrice))}
                  </div>
                )}
            </div>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs font-bold text-slate-500">
                {t('vouchers.check_on_site', 'Check on site')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto flex items-end">
        <Button
          className="w-full font-bold group/btn"
          asChild={!!link && !isDemo}
          variant={link && !isDemo ? 'default' : 'secondary'}
          disabled={!link || isDemo}
        >
          {link && !isDemo ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {t('common.buy', 'BUY')}
              <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </a>
          ) : (
            <span>
              <Tag className="w-4 h-4 mr-2" />
              {isDemo
                ? t('admin.public.card.demo_example_status', 'Demonstração')
                : t('common.unavailable', 'Unavailable')}
            </span>
          )}
        </Button>
      </div>
    </Card>
  )
}
