import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiscoveredPromotion } from '@/lib/types'
import { ExternalLink, Tag, BadgeCheck, Users } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function PromotionCard({
  promotion,
}: {
  promotion: DiscoveredPromotion
}) {
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
    promotion.originalUrl

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

  const finalDiscountLabel = discountLabel || calculatedDiscount

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
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
        {finalDiscountLabel && (
          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 shadow-sm border-none z-10">
            {finalDiscountLabel}
          </Badge>
        )}
        {promotion.category && promotion.category !== 'Geral' && (
          <Badge className="absolute bottom-3 left-3 bg-white/90 text-slate-800 font-semibold px-2 py-1 shadow-sm border-none z-10 backdrop-blur-sm">
            {promotion.category}
          </Badge>
        )}
        {promotion.isVerified && (
          <Badge className="absolute top-3 left-3 bg-green-500/90 hover:bg-green-600 text-white font-bold px-2 py-1 shadow-sm border-none z-10 flex items-center gap-1 backdrop-blur-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <h3
          className="font-bold text-lg leading-tight line-clamp-2 text-slate-800"
          title={title}
        >
          {title}
        </h3>
        {promotion.usageCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-2 bg-green-50 w-fit px-2 py-1 rounded-md">
            <Users className="w-3.5 h-3.5" />
            {promotion.usageCount} used today
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
        <div className="mt-auto">
          {currentPrice !== undefined &&
          currentPrice !== null &&
          Number(currentPrice) > 0 ? (
            <div className="flex flex-col">
              {originalPrice !== undefined &&
                originalPrice !== null &&
                Number(originalPrice) > Number(currentPrice) && (
                  <span className="text-sm text-slate-400 line-through decoration-slate-400">
                    {promotion.currency || 'USD'}{' '}
                    {Number(originalPrice).toFixed(2)}
                  </span>
                )}
              <div className="flex items-center gap-1 font-bold text-primary text-xl">
                <span className="text-sm text-slate-500 font-normal">
                  Price:{' '}
                </span>
                <span>{promotion.currency || 'USD'}</span>
                <span>{Number(currentPrice).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-end h-7">
              <span className="text-sm font-semibold text-slate-500">
                Check on site
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          className="w-full font-semibold group/btn"
          asChild={!!link}
          variant={link ? 'default' : 'secondary'}
          disabled={!link}
        >
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              Get Offer
              <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </a>
          ) : (
            <span>
              <Tag className="w-4 h-4 mr-2" />
              Unavailable
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
