import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Rocket, Check, Megaphone, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function MerchantAdsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { user, profile } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    supabase
      .from('ad_pricing')
      .select('*')
      .eq('environment', 'production')
      .order('price')
      .then(({ data }) => {
        setPlans(data || [])
        setLoading(false)
      })
  }, [])

  const formatPlacementName = (placement: string) => {
    const map: Record<string, string> = {
      search_top: 'Search Top',
      search: 'Search',
      bottom: 'Bottom',
      sidebar: 'Sidebar',
      offer_of_the_day: 'Offer of the Day',
    }
    return (
      map[placement.toLowerCase()] ||
      placement.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    )
  }

  const handlePurchase = async (plan: any) => {
    if (!profile?.company_id && !user?.id) {
      toast.error(
        t(
          'ads.merchant_not_found',
          'Merchant identity not found. Por favor atualize as configurações da loja.',
        ),
      )
      return
    }

    setProcessing(true)
    const advertiserId = profile?.company_id || user?.id

    // Ensure ad_advertiser exists for foreign key mapping
    await supabase.from('ad_advertisers').upsert(
      {
        id: advertiserId,
        company_name: profile?.name || user?.email || 'Merchant',
        environment: 'production',
      },
      { onConflict: 'id' },
    )

    // Create Ad Campaign with pending payment status
    const { data: campaign, error: campaignError } = await supabase
      .from('ad_campaigns')
      .insert({
        title: `Impulsionamento: ${formatPlacementName(plan.placement)}`,
        company_id: advertiserId,
        placement: plan.placement,
        billing_type: plan.billing_type,
        price: plan.price,
        status: 'pending_payment',
        environment: 'production',
      })
      .select()
      .single()

    if (campaignError) {
      toast.error(
        `${t('ads.error_campaign', 'Erro ao criar campanha:')} ${campaignError.message}`,
      )
      setProcessing(false)
      return
    }

    const { error } = await supabase.from('ad_invoices').insert({
      ad_id: campaign.id,
      advertiser_id: advertiserId,
      reference_number: `BOOST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount: plan.price,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'pending',
      environment: 'production',
    })

    setProcessing(false)

    if (error) {
      toast.error(
        `${t('ads.error_invoice', 'Erro ao gerar fatura:')} ${error.message}`,
      )
    } else {
      toast.success(
        t(
          'ads.success_purchase',
          'Plano "{plan}" adquirido com sucesso! Fatura gerada na aba Financeiro.',
        ).replace('{plan}', formatPlacementName(plan.placement)),
      )
    }
  }

  // Find the highest priced plan or specific one to highlight
  const highestPrice =
    plans.length > 0 ? Math.max(...plans.map((p) => p.price)) : 0

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
        <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('ads.marketplace_title', 'Marketplace de Impulsionamento')}
        </h1>
        <p className="text-slate-500 text-lg">
          {t(
            'ads.marketplace_desc',
            'Aumente a visibilidade das suas ofertas e alcance mais clientes na região com nossos planos de destaque exclusivos.',
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 px-4 text-slate-500 bg-white rounded-xl border border-dashed shadow-sm">
          {t(
            'ads.no_plans',
            'Nenhum plano disponível no momento para sua região.',
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan) => {
            const isPopular =
              plan.price === highestPrice ||
              plan.placement.toLowerCase() === 'search_top'
            const formattedName = formatPlacementName(plan.placement)
            const formattedPrice = plan.price.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
            const isCpc = plan.billing_type === 'cpc'

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col overflow-hidden transition-all duration-300 bg-white h-full',
                  isPopular
                    ? 'border-indigo-500 shadow-indigo-100 shadow-xl z-10 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:shadow-lg hover:border-indigo-300',
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-[12px] font-bold text-center py-1.5 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Zap className="w-3 h-3 fill-current" />
                    {t('ads.most_popular', 'Mais Popular')}
                  </div>
                )}

                <CardHeader
                  className={cn(
                    'text-center pb-4 pt-8 border-b border-slate-100 flex-none',
                    isPopular ? 'bg-indigo-50/50' : 'bg-slate-50/50',
                  )}
                >
                  <CardTitle className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">
                    {formattedName}
                  </CardTitle>
                  <div className="mt-3 flex items-center justify-center gap-1 h-8">
                    <span className="text-[12px] font-bold text-slate-400">
                      R$
                    </span>
                    <span className="text-[12px] font-bold text-slate-900">
                      {formattedPrice}
                    </span>
                    <span className="text-[12px] font-bold text-slate-500 uppercase ml-1">
                      /{isCpc ? 'cpc' : t('ads.billing_unique', 'único')}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-6 px-6 pb-6 bg-white">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-slate-700">
                      <div className="rounded-full bg-emerald-100 p-0.5 shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-[12px] font-normal leading-tight">
                        {t('ads.high_priority', 'Alta prioridade nas buscas')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <div className="rounded-full bg-emerald-100 p-0.5 shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-[12px] font-normal leading-tight">
                        {t('ads.fixed_highlight', 'Destaque fixo em')}{' '}
                        <strong className="text-[12px] font-bold text-slate-900">
                          {formattedName}
                        </strong>
                      </span>
                    </li>
                    {plan.duration_days && (
                      <li className="flex items-start gap-2 text-slate-700">
                        <div className="rounded-full bg-emerald-100 p-0.5 shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-[12px] font-normal leading-tight">
                          {t('ads.extended_duration', 'Duração estendida de')}{' '}
                          <strong className="text-[12px] font-bold text-slate-900">
                            {plan.duration_days} {t('ads.days', 'dias')}
                          </strong>
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0 mt-auto flex-none bg-white">
                  <Button
                    className={cn(
                      'w-full h-10 text-[12px] font-bold shadow-sm transition-all',
                      isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md'
                        : 'bg-slate-800 hover:bg-slate-900 text-white',
                    )}
                    onClick={() => handlePurchase(plan)}
                    disabled={processing}
                  >
                    {processing
                      ? t('ads.processing', 'Processando...')
                      : 'Comprar'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
