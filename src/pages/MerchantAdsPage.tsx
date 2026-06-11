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
import { Rocket, Check, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function MerchantAdsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { user, profile } = useAuth()

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
      search_top: 'SEARCH TOP',
      search: 'SEARCH',
      bottom: 'BOTTOM',
      sidebar: 'SIDEBAR',
      offer_of_the_day: 'OFFER OF THE DAY',
      home_hero: 'HOME HERO',
      sponsored_push: 'SPONSORED PUSH',
    }
    return (
      map[placement.toLowerCase()] || placement.replace(/_/g, ' ').toUpperCase()
    )
  }

  const handlePurchase = async (plan: any) => {
    if (!profile?.company_id && !user?.id) {
      toast.error('Merchant identity not found. Please update store settings.')
      return
    }

    setProcessing(true)
    const advertiserId = profile?.company_id || user?.id

    await supabase.from('ad_advertisers').upsert(
      {
        id: advertiserId,
        company_name: profile?.name || user?.email || 'Merchant',
        environment: 'production',
      },
      { onConflict: 'id' },
    )

    const { data: campaign, error: campaignError } = await supabase
      .from('ad_campaigns')
      .insert({
        title: `Boost: ${formatPlacementName(plan.placement)}`,
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
      toast.error(`Error creating campaign: ${campaignError.message}`)
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
      toast.error(`Error generating invoice: ${error.message}`)
    } else {
      toast.success(
        `Plan "${formatPlacementName(plan.placement)}" purchased successfully! Invoice generated in the Financial tab.`,
      )
    }
  }

  const highestPrice =
    plans.length > 0 ? Math.max(...plans.map((p) => p.price)) : 0

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto space-y-8 animate-fade-in overflow-hidden">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
        <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Boost Marketplace
        </h1>
        <p className="text-slate-500 text-lg">
          Increase the visibility of your offers and reach more customers in the
          region with our exclusive highlight plans.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 px-4 text-slate-500 bg-white rounded-xl border border-dashed shadow-sm">
          No plans available in your region at the moment.
        </div>
      ) : (
        <div
          className="flex justify-center -mb-24 md:-mb-48 origin-top"
          style={{ transform: 'scale(0.6)' }}
        >
          {/* 40% Scale Reduction Enforced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1200px]">
            {plans.map((plan) => {
              const isPopular =
                plan.price === highestPrice ||
                plan.placement.toLowerCase() === 'search_top'
              const formattedName = formatPlacementName(plan.placement)
              const formattedPrice = plan.price.toLocaleString('en-US', {
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
                      ? 'border-indigo-500 shadow-indigo-100 shadow-2xl z-10 ring-2 ring-indigo-500'
                      : 'border-slate-200 hover:shadow-xl hover:border-indigo-300',
                  )}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-[12px] font-bold text-center py-2 uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Zap className="w-4 h-4 fill-current" />
                      MOST POPULAR
                    </div>
                  )}

                  <CardHeader
                    className={cn(
                      'text-center pb-6 pt-12 border-b border-slate-100 flex-none',
                      isPopular ? 'bg-indigo-50/50 pt-16' : 'bg-slate-50/50',
                    )}
                  >
                    <CardTitle className="text-[16px] font-bold text-slate-800 uppercase tracking-wide">
                      {formattedName}
                    </CardTitle>
                    <div className="mt-4 flex items-center justify-center gap-1">
                      <span className="text-[16px] font-normal text-slate-500">
                        $ {formattedPrice} /{isCpc ? 'CPC' : 'ONCE'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-8 px-8 pb-8 bg-white">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-[16px] font-normal leading-tight">
                          High priority in searches
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-[16px] font-normal leading-tight">
                          Fixed highlight on{' '}
                          <span className="font-bold">{formattedName}</span>
                        </span>
                      </li>
                      {plan.duration_days && (
                        <li className="flex items-start gap-3 text-slate-700">
                          <div className="rounded-full bg-emerald-100 p-1 shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                          </div>
                          <span className="text-[16px] font-normal leading-tight">
                            Extended duration of{' '}
                            <span className="font-bold">
                              {plan.duration_days} days
                            </span>
                          </span>
                        </li>
                      )}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-8 pt-0 mt-auto flex-none bg-white">
                    <Button
                      className={cn(
                        'w-full h-12 text-[16px] font-bold shadow-sm transition-all rounded-lg',
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md'
                          : 'bg-slate-800 hover:bg-slate-900 text-white',
                      )}
                      onClick={() => handlePurchase(plan)}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'BUY'}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
