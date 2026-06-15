import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ImagePlus, ImageOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

interface CampaignPreviewProps {
  title?: string
  description?: string
  instructions?: string
  image?: string
  startDate?: string
  endDate?: string
  companyUrl?: string
  formattedDiscount: string
}

export function CampaignPreview({
  title,
  description,
  instructions,
  image,
  startDate,
  endDate,
  companyUrl,
  formattedDiscount,
}: CampaignPreviewProps) {
  const { t, formatDate } = useLanguage()
  const [imgError, setImgError] = useState(false)

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm w-full max-w-[340px] bg-white pointer-events-none">
      {image && !imgError ? (
        <div className="aspect-video w-full relative">
          <img
            src={image}
            crossOrigin="anonymous"
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge className="absolute bottom-2 left-2 bg-white/95 text-black hover:bg-white border-none shadow-sm">
            {formattedDiscount}
          </Badge>
        </div>
      ) : (
        <div className="aspect-video w-full relative bg-slate-100 flex items-center justify-center">
          {image ? (
            <ImageOff className="w-8 h-8 text-slate-300" />
          ) : (
            <ImagePlus className="w-8 h-8 text-slate-300" />
          )}
          <Badge className="absolute bottom-2 left-2 bg-white/95 text-black hover:bg-white border-none shadow-sm">
            {formattedDiscount}
          </Badge>
        </div>
      )}
      <CardContent className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
        <div>
          <h4 className="font-bold text-sm leading-tight mb-1 break-words">
            {title || t('vendor.form.campaign_title', 'Campaign Title')}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 break-words">
            {description ||
              t(
                'vendor.form.description',
                'The description of your campaign will appear here.',
              )}
          </p>
        </div>
        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="font-semibold text-slate-800 block mb-0.5">
            {t('vendor.journey.validity', 'Validity:')}
          </span>
          <span className="block mb-2">
            {startDate ? formatDate(startDate) : 'N/A'} {t('common.to', 'to')}{' '}
            {endDate ? formatDate(endDate) : 'N/A'}
          </span>
          <span className="font-semibold text-slate-800 block mb-0.5">
            {t('vendor.journey.rules', 'Rules:')}
          </span>
          <span className="whitespace-pre-wrap block break-words">
            {instructions ||
              t(
                'vendor.journey.rules_default',
                'Present this code at checkout.',
              )}
          </span>
        </div>
        <Button className="w-full h-8 text-xs font-semibold" variant="default">
          {companyUrl
            ? t('vouchers.go_to_store', 'Go to Online Store')
            : t('vouchers.reserve', 'Reserve')}
        </Button>
      </CardContent>
    </Card>
  )
}
