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
  const { t } = useLanguage()

  // Guard against unexpected missing object
  if (!promotion || typeof promotion !== 'object') return null

  // Gracefully handle missing required fields using fallbacks
  const image =
    promotion.imageUrl ||
    promotion.image ||
    promotion.image_url ||
    'https://img.usecurling.com/p/400/300?q=shopping'
  const title =
    promotion.title || t('promotion.untitled', 'Promoção sem título')

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
    currentPrice !== undefined &&
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
        {promotion.isVerified && (
          <Badge className="absolute top-3 left-3 bg-green-500/90 hover:bg-green-600 text-white font-bold px-2 py-1 shadow-sm border-none z-10 flex items-center gap-1 backdrop-blur-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            {t('promotion.verified', 'Verificado')}
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
            {promotion.usageCount}{' '}
            {t('promotion.used_today', 'pessoas usaram hoje')}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
        <div className="mt-auto">
          {currentPrice !== undefined && currentPrice !== null ? (
            <div className="flex flex-col">
              {originalPrice !== undefined &&
                Number(originalPrice) > Number(currentPrice) && (
                  <span className="text-sm text-slate-400 line-through decoration-slate-400">
                    {promotion.currency || 'R$'}{' '}
                    {Number(originalPrice).toFixed(2).replace('.', ',')}
                  </span>
                )}
              <div className="flex items-center gap-1 font-bold text-primary text-xl">
                <span className="text-sm text-slate-500 font-normal">
                  {t('promotion.price', 'Por:')}{' '}
                </span>
                <span>{promotion.currency || 'R$'}</span>
                <span>{Number(currentPrice).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          ) : (
            <div className="h-7" />
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
              {t('promotion.get_offer', 'Ver Oferta')}
              <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </a>
          ) : (
            <span>
              <Tag className="w-4 h-4 mr-2" />
              {t('promotion.no_link', 'Indisponível')}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
