import { useParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Ticket,
  Gift,
  ExternalLink,
  Copy,
  Globe,
  Share2,
  MapPin,
  Clock,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Voucher() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, formatDate, language } = useLanguage()
  const {
    user,
    coupons,
    seasonalEvents,
    usedVouchers,
    validateCoupon,
    isReserved,
    reserveCoupon,
  } = useCouponStore()

  const [dbPromo, setDbPromo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shares, setShares] = useState(0)

  const localCoupon = coupons.find((c) => c.id === id)
  const localEvent = seasonalEvents.find((e) => e.id === id)

  useEffect(() => {
    if (user && id && id !== 'preview') {
      supabase
        .from('user_engagements')
        .select('id')
        .eq('user_id', user.id)
        .eq('campaign_id', id)
        .eq('action_type', 'social_share')
        .then(({ data }) => {
          if (data) setShares(data.length)
        })
    }
  }, [user, id])

  useEffect(() => {
    if (!localCoupon && !localEvent && id && id !== 'preview') {
      setIsLoading(true)
      const fetchPromo = async () => {
        try {
          const { data } = await supabase
            .from('discovered_promotions')
            .select('*')
            .eq('id', id)
            .maybeSingle()
          if (data) {
            setDbPromo({
              id: data.id,
              title: data.title,
              description: data.description,
              discount: data.discount_percentage
                ? `${data.discount_percentage}% OFF`
                : data.discount || 'Oferta Especial',
              image: data.image_url,
              storeName: data.store_name,
              externalUrl: data.product_link || data.source_url,
              offerType: 'online',
              endDate: data.end_date,
              totalAvailable: data.total_limit || 100,
              promotionModel: data.promotion_model,
              engagementThreshold: data.engagement_threshold,
              rewardType: data.reward_type,
              rewardValue: data.reward_value,
            })
            return
          }

          const { data: cData } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', id)
            .maybeSingle()
          if (cData) {
            setDbPromo({
              id: cData.id,
              title: cData.title,
              description: cData.description,
              discount: cData.discount || 'Desconto',
              image: cData.image_url,
              storeName: cData.store_name,
              externalUrl: null,
              offerType: 'offline',
              endDate: cData.end_date,
              address: cData.location_name,
            })
          }
        } catch (e) {
          console.error('Error fetching promo', e)
        } finally {
          setIsLoading(false)
        }
      }
      fetchPromo()
    }
  }, [id, localCoupon, localEvent])

  const coupon = localCoupon || dbPromo
  const event = localEvent

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Buscando oferta...</p>
      </div>
    )
  }

  if (!coupon && !event) {
    return (
      <div className="container py-16 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">
          {t('voucher_detail.not_found', 'Voucher não encontrado')}
        </h2>
        <Button onClick={() => navigate(-1)}>
          {t('common.back', 'Voltar')}
        </Button>
      </div>
    )
  }

  const isOnline =
    coupon?.offerType === 'online' ||
    event?.offerType === 'online' ||
    !!coupon?.externalUrl ||
    !!event?.externalUrl
  const externalUrl = coupon?.externalUrl || event?.externalUrl

  const baseTitle = coupon?.title || event?.title || ''
  const title =
    coupon?.translations?.[language]?.title ||
    event?.translations?.[language]?.title ||
    baseTitle

  const storeName =
    coupon?.storeName ||
    event?.companyId ||
    t('vouchers.partner_store', 'Loja Parceira')

  const baseDescription = coupon?.description || event?.description || ''
  const description =
    coupon?.translations?.[language]?.description ||
    event?.translations?.[language]?.description ||
    baseDescription

  const baseInstructions = coupon?.instructions || event?.instructions || ''
  const translatedInstructions =
    coupon?.translations?.[language]?.instructions ||
    event?.translations?.[language]?.instructions ||
    baseInstructions

  const defaultInstructions = isOnline
    ? t(
        'voucher_detail.instructions_online',
        'Acesse a oferta online clicando no botão abaixo. Se aplicável, o código de desconto já será copiado ou aplicado automaticamente no site do lojista.',
      )
    : t(
        'voucher_detail.instructions_offline',
        'Apresente este código ao lojista no momento do pagamento para aplicar o benefício. O código é único e válido para apenas uma utilização.',
      )

  const instructions = translatedInstructions || defaultInstructions

  const discount =
    coupon?.discount ||
    (event?.type === 'sale'
      ? t('event.type.sale', 'Promoção')
      : t('vouchers.special_event', 'Evento Especial'))
  const image = coupon?.image || event?.image

  const code =
    coupon?.code ||
    (event?.vouchers && event.vouchers.length > 0
      ? event.vouchers[0]
      : `VCH-${id?.substring(0, 6).toUpperCase()}`)

  const isUsed = coupon ? coupon.status === 'used' : usedVouchers.includes(code)
  const reserved = isReserved(id || '')

  const available =
    coupon?.totalAvailable !== undefined
      ? coupon.totalAvailable
      : event?.totalAvailable !== undefined
        ? event.totalAvailable
        : 100
  const isSoldOut = available <= 0

  const handleSimulateScan = () => {
    if (!code) return
    const result = validateCoupon(code)
    if (result.success) {
      toast.success(
        t('voucher_detail.scan_success', 'Voucher validado com sucesso!'),
      )
    } else {
      toast.error(t('voucher_detail.scan_error', 'Erro ao validar o voucher.'))
    }
  }

  const handleReserve = () => {
    if (id) {
      const success = reserveCoupon(id)
      if (success) {
        toast.success(
          t(
            'voucher_detail.reserved_success',
            'Voucher reservado e salvo em "Meus Vouchers"!',
          ),
        )
        navigate('/vouchers')
      }
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success(
      t(
        'voucher_detail.code_copied',
        'Código copiado para a área de transferência!',
      ),
      {
        duration: 3000,
      },
    )
  }

  const handleShare = async () => {
    if (user && id && id !== 'preview') {
      await supabase.from('user_engagements').insert({
        user_id: user.id,
        campaign_id: id,
        action_type: 'social_share',
      })
      setShares((s) => s + 1)
    }

    const shareUrl = window.location.href

    const fallbackCopy = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success(
          t(
            'voucher_detail.share_fallback_success',
            'Link copiado para a área de transferência!',
          ),
        )
      } catch (err) {
        console.error('Fallback copy failed', err)
      }
    }

    const shareData = {
      title,
      text: description,
      url: shareUrl,
    }

    try {
      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare(shareData))
      ) {
        await navigator.share(shareData)
      } else {
        await fallbackCopy()
      }
    } catch (error: any) {
      console.error('Error sharing', error)
      // Check if the user aborted the action themselves. If not, fallback to copy to clipboard.
      if (error.name !== 'AbortError') {
        await fallbackCopy()
      }
    }
  }

  const handleBuyNow = () => {
    if (!externalUrl) return
    try {
      let finalUrl = externalUrl
      if (!finalUrl.startsWith('http')) {
        finalUrl = `https://${finalUrl}`
      }

      const url = new URL(finalUrl)
      const config = coupon?.affiliateConfig || event?.affiliateConfig

      if (config) {
        const pId = user?.partnerId || config.partnerId
        if (pId) {
          url.searchParams.set(config.paramName, pId)
        }
        if (config.discountParamName && code && code !== 'PREVIEW') {
          url.searchParams.set(config.discountParamName, code)
        }
      }

      if (code && code !== 'PREVIEW') {
        navigator.clipboard.writeText(code)
        toast.info(
          t(
            'voucher_detail.redirecting',
            'Código copiado! Você será redirecionado para a loja.',
          ),
          {
            duration: 3000,
          },
        )
      }

      if (id && !reserved && id !== 'preview') {
        reserveCoupon(id)
      }

      setTimeout(() => {
        window.open(url.toString(), '_blank')
      }, 500)
    } catch (e) {
      toast.error(
        t('voucher_detail.link_error', 'Erro ao abrir o link da oferta.'),
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-8 px-4 sm:py-12 animate-fade-in-up">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between w-full mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="-ml-4 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('common.back', 'Voltar')}
          </Button>

          <Button
            variant="ghost"
            onClick={handleShare}
            className="-mr-4 text-slate-600 hover:text-primary transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {t('voucher_detail.share', 'Compartilhar')}
          </Button>
        </div>

        <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl relative bg-white">
          <div
            className={cn(
              'absolute top-0 left-0 w-full h-2',
              isOnline ? 'bg-blue-500' : 'bg-primary',
            )}
          />

          {image && !reserved && (
            <div className="w-full h-48 relative overflow-hidden bg-slate-100">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-white/95 text-black font-bold backdrop-blur-sm shadow-sm text-sm px-2.5 py-0.5">
                  {discount}
                </Badge>
                {isOnline && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-2.5 py-0.5 border-none">
                    <Globe className="w-3.5 h-3.5 mr-1" />{' '}
                    {t('vouchers.online', 'Online')}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <CardContent
            className={cn(
              'p-6 sm:p-8 flex flex-col items-center text-center',
              reserved ? 'pt-8' : 'pt-6',
            )}
          >
            {!reserved ? (
              <>
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center mb-5 mt-2',
                    isOnline ? 'bg-blue-50' : 'bg-primary/10',
                  )}
                >
                  {isOnline ? (
                    <Globe className="h-8 w-8 text-blue-500" />
                  ) : (
                    <Gift className="h-8 w-8 text-primary" />
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  {title}
                </h1>
                <p className="text-slate-500 font-medium mb-6 flex items-center gap-1.5 justify-center">
                  {isOnline && <Globe className="w-3 h-3 text-slate-400" />}
                  {storeName}
                </p>

                <div className="bg-slate-50 p-5 rounded-xl text-left w-full mb-8 border border-slate-100 shadow-inner space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />{' '}
                      {t('voucher_detail.description', 'Descrição')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {(coupon?.expiryDate || event?.endDate) && (
                    <div className="pt-4 border-t border-slate-200/60">
                      <h3 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />{' '}
                        {t('voucher_detail.validity', 'Validade')}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {formatDate(coupon?.expiryDate || event?.endDate || '')}
                      </p>
                    </div>
                  )}

                  {coupon?.address && !isOnline && (
                    <div className="pt-4 border-t border-slate-200/60">
                      <h3 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />{' '}
                        {t('voucher_detail.address', 'Endereço')}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {coupon.address}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200/60">
                    <h3 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />{' '}
                      {t('voucher_detail.rules', 'Regras e Condições')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {instructions}
                    </p>
                  </div>

                  {!isOnline && (
                    <p className="text-xs text-slate-400 mt-2 pt-4 border-t border-slate-200/60 font-medium">
                      {t('voucher_detail.available', 'Disponíveis:')}{' '}
                      <span className="text-slate-700">{available}</span>
                    </p>
                  )}
                </div>

                {coupon?.promotionModel === 'pre-launch' && (
                  <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 shadow-inner text-left">
                    <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-indigo-600" /> Mission:
                      Share to Unlock!
                    </h3>
                    <p className="text-sm text-indigo-700 mb-4">
                      Share this offer with your friends. Once you reach the
                      goal, you will unlock a special reward:
                      <strong>
                        {' '}
                        {coupon.rewardType} ({coupon.rewardValue})
                      </strong>
                      .
                    </p>
                    <div className="flex justify-between text-xs mb-1 font-bold text-indigo-800">
                      <span>
                        Progress: {shares} / {coupon.engagementThreshold || 1}{' '}
                        shares
                      </span>
                      {shares >= (coupon.engagementThreshold || 1) && (
                        <span className="text-green-600">Unlocked!</span>
                      )}
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-3 mb-4">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((shares / (coupon.engagementThreshold || 1)) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" /> Share Now
                    </Button>
                  </div>
                )}

                {isOnline ? (
                  <Button
                    size="lg"
                    disabled={isSoldOut}
                    className="w-full h-14 text-base font-bold shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:translate-y-0"
                    onClick={handleBuyNow}
                  >
                    {isSoldOut ? (
                      t('vouchers.sold_out', 'Esgotado')
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-5 w-5" />
                        {t('voucher_detail.visit_site', 'Visitar Site da Loja')}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={isSoldOut}
                    className="w-full h-14 text-base font-bold shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:translate-y-0"
                    onClick={handleReserve}
                  >
                    {isSoldOut ? (
                      t('vouchers.sold_out', 'Esgotado')
                    ) : (
                      <>
                        <QrCode className="mr-2 h-5 w-5" />
                        {t('voucher_detail.reserve', 'Reservar Voucher')}
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <>
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center mb-5',
                    isOnline ? 'bg-blue-50' : 'bg-primary/10',
                  )}
                >
                  {isOnline ? (
                    <Globe className="h-8 w-8 text-blue-500" />
                  ) : (
                    <QrCode className="h-8 w-8 text-primary" />
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  {title}
                </h1>
                <p className="text-slate-500 font-medium mb-2">{storeName}</p>
                <div className="flex gap-2 mb-6 justify-center">
                  <Badge
                    variant="secondary"
                    className="font-bold text-primary bg-primary/10"
                  >
                    {discount}
                  </Badge>
                  {isOnline && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold">
                      {t('voucher_detail.online_offer', 'Oferta Online')}
                    </Badge>
                  )}
                </div>

                {/* Separator with cutouts */}
                <div className="w-full relative flex items-center mb-8">
                  <div className="w-6 h-6 bg-slate-50 rounded-full absolute -left-10 shadow-inner" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <div className="w-6 h-6 bg-slate-50 rounded-full absolute -right-10 shadow-inner" />
                </div>

                {!isOnline ? (
                  /* Physical Store View (QR Code) */
                  <>
                    <div className="relative mb-6 group w-full flex justify-center">
                      <div
                        className={cn(
                          'p-4 border-[3px] rounded-2xl transition-all duration-500 relative',
                          isUsed
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-primary/20 bg-white shadow-sm',
                        )}
                      >
                        <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center relative overflow-hidden rounded-xl">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${code}&color=${isUsed ? '94a3b8' : '0f172a'}`}
                            alt="QR Code"
                            className={cn(
                              'w-full h-full object-contain transition-all duration-500',
                              isUsed && 'opacity-20 blur-[2px]',
                            )}
                          />

                          {isUsed && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] animate-in zoom-in-95 duration-300">
                              <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                              </div>
                              <span className="font-extrabold text-xl text-emerald-600 bg-white px-4 py-1 rounded-full shadow-sm">
                                {t(
                                  'voucher_detail.already_used',
                                  'Já Utilizado',
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl w-full mb-6 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
                        {t('voucher_detail.voucher_code', 'Código do Voucher')}
                      </span>
                      <span
                        className={cn(
                          'text-2xl sm:text-3xl font-mono tracking-widest font-black transition-colors duration-300',
                          isUsed
                            ? 'text-slate-300 line-through decoration-slate-300/50'
                            : 'text-slate-800',
                        )}
                      >
                        {code}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Online Store View (Code Box) */
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl w-full mb-6 relative">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block mb-3 text-center">
                      {t('voucher_detail.coupon_code', 'Código do Cupom')}
                    </span>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 sm:p-3 shadow-sm">
                      <span className="text-xl sm:text-2xl font-mono tracking-widest font-black text-slate-800 ml-2">
                        {code}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyCode}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title={t('voucher_detail.copy_code', 'Copiar código')}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-400 text-center mt-3 leading-tight">
                      {t(
                        'voucher_detail.copy_instructions',
                        'Copie o código acima e cole no carrinho de compras do site.',
                      )}
                    </p>
                  </div>
                )}

                <div className="text-sm text-slate-600 bg-blue-50/50 p-4 rounded-xl text-left w-full space-y-2 border border-blue-100/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-blue-900/80">
                      {instructions}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {reserved && (
          <div className="mt-8 flex flex-col items-center">
            {isOnline ? (
              <Button
                variant="default"
                size="lg"
                onClick={handleBuyNow}
                className="w-full gap-2 font-bold h-14 text-base transition-all duration-300 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:-translate-y-0.5"
              >
                <ExternalLink className="h-5 w-5" />{' '}
                {t('voucher_detail.visit_site', 'Visitar Site da Loja')}
              </Button>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-3 text-center font-medium px-4">
                  {t(
                    'voucher_detail.test_action',
                    'Ação exclusiva para testes: Simula a leitura do QR Code pelo aplicativo do lojista.',
                  )}
                </p>
                <Button
                  variant={isUsed ? 'secondary' : 'default'}
                  size="lg"
                  onClick={handleSimulateScan}
                  disabled={isUsed}
                  className={cn(
                    'w-full gap-2 font-bold h-14 text-base transition-all duration-300 rounded-xl',
                    isUsed
                      ? 'bg-slate-200 text-slate-500'
                      : 'shadow-md hover:-translate-y-0.5',
                  )}
                >
                  {isUsed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />{' '}
                      {t(
                        'voucher_detail.voucher_validated',
                        'Voucher Validado',
                      )}
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-5 w-5" />{' '}
                      {t(
                        'voucher_detail.simulate_scan',
                        'Simular Leitura do Lojista',
                      )}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
